import { PIPED_INSTANCES, MODULE_ID } from './constants.mjs';

const CORS_PROXIES = [
  { url: 'https://api.allorigins.win/get?url=', type: 'allorigins' },
  { url: 'https://corsproxy.io/?', type: 'passthrough' }
];

const LOCAL_PROXY = 'http://localhost:23456';
const FETCH_TIMEOUT = 10000;
const CACHE_TTL = 300000;
const streamCache = new Map();

function getCached(key) {
  const entry = streamCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data;
  streamCache.delete(key);
  return null;
}

function setCache(key, data) {
  streamCache.set(key, { data, timestamp: Date.now() });
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export class YouTubeImporter {
  static lastError = null;

  static async fetchFromPiped(endpoint) {
    this.lastError = null;
    for (const instance of PIPED_INSTANCES) {
      try {
        const healthRes = await fetchWithTimeout(`${LOCAL_PROXY}/health`);
        if (!healthRes.ok) break;
      } catch {
        console.warn(`${MODULE_ID} | Tier 1 (local proxy) not reachable — skipping`);
        break;
      }
      try {
        const res = await fetchWithTimeout(`${LOCAL_PROXY}/fetch?url=${encodeURIComponent(`${instance}${endpoint}`)}`);
        if (!res.ok) { console.warn(`${MODULE_ID} | Tier 1 HTTP ${res.status} for ${instance}`); continue; }
        const data = await res.json();
        console.log(`${MODULE_ID} | Tier 1 (local proxy) OK via ${instance}`);
        return data;
      } catch (e) {
        console.warn(`${MODULE_ID} | Tier 1 failed for ${instance}: ${e.message}`);
      }
    }
    console.warn(`${MODULE_ID} | Tier 1 exhausted, trying Tier 2 (direct fetch)`);
    for (const instance of PIPED_INSTANCES) {
      try {
        const url = `${instance}${endpoint}`;
        const res = await fetchWithTimeout(url);
        if (!res.ok) continue;
        const data = await res.json();
        console.log(`${MODULE_ID} | Tier 2 (direct) OK via ${instance}`);
        return data;
      } catch (e) {
        console.warn(`${MODULE_ID} | Tier 2 failed for ${instance}: ${e.message}`);
      }
    }
    console.warn(`${MODULE_ID} | Tier 2 exhausted, trying Tier 3 (CORS proxies)`);
    for (const proxy of CORS_PROXIES) {
      for (const instance of PIPED_INSTANCES) {
        try {
          const targetUrl = `${instance}${endpoint}`;
          const proxyUrl = `${proxy.url}${encodeURIComponent(targetUrl)}`;
          const res = await fetchWithTimeout(proxyUrl);
          if (!res.ok) continue;
          let data;
          if (proxy.type === 'allorigins') {
            const wrapper = await res.json();
            if (!wrapper?.contents) continue;
            data = JSON.parse(wrapper.contents);
          } else {
            data = await res.json();
          }
          console.log(`${MODULE_ID} | Tier 3 OK via ${proxy.type} -> ${instance}`);
          return data;
        } catch (e) {
          console.warn(`${MODULE_ID} | Tier 3 failed for ${proxy.type}/${instance}: ${e.message}`);
        }
      }
    }
    this.lastError = 'all_tiers_exhausted';
    console.error(`${MODULE_ID} | All 3 tiers exhausted — returning null`);
    return null;
  }

  static extractVideoId(input) {
    if (!input) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const p of patterns) {
      const m = input.match(p);
      if (m) return m[1];
    }
    return null;
  }

  static extractPlaylistId(input) {
    if (!input) return null;
    const m = input.match(/[&?]list=([a-zA-Z0-9_-]+)/);
    return m ? m[1] : null;
  }

  static async getStreamInfo(videoId) {
    const cached = getCached(videoId);
    if (cached) return cached;

    const data = await this.fetchFromPiped(`/streams/${videoId}`);
    if (!data) return null;

    let audioStreams = data.audioStreams;
    if (!audioStreams || audioStreams.length === 0) {
      const videoStream = data.videoStreams?.find(s =>
        s?.url && (s.mimeType?.includes('mp4') || s.mimeType?.includes('webm'))
      );
      if (videoStream?.url) {
        const result = {
          url: videoStream.url,
          mimeType: videoStream.mimeType,
          quality: videoStream.quality || 'audio only',
          title: data.title || 'Unknown',
          duration: data.duration || data.videoDuration || 0,
          author: data.uploader || 'Unknown',
          thumbnail: data.thumbnailUrl || '',
          videoId
        };
        setCache(videoId, result);
        return result;
      }
      this.lastError = 'no_audio_streams';
      return null;
    }

    const preferred = audioStreams
      .filter(s => s?.url && (s.mimeType?.includes('mp4') || s.mimeType?.includes('webm')))
      .sort((a, b) => {
        const qA = parseInt(a.quality) || 0;
        const qB = parseInt(b.quality) || 0;
        return qB - qA;
      });

    const audio = preferred[0] || audioStreams[0];
    if (!audio?.url) {
      this.lastError = 'no_audio_streams';
      return null;
    }

    const result = {
      url: audio.url,
      mimeType: audio.mimeType,
      quality: audio.quality,
      title: data.title || 'Unknown',
      duration: data.duration || data.videoDuration || 0,
      author: data.uploader || 'Unknown',
      thumbnail: data.thumbnailUrl || '',
      videoId
    };
    setCache(videoId, result);
    return result;
  }

  static async search(query) {
    const data = await this.fetchFromPiped(`/search?q=${encodeURIComponent(query)}`);
    if (!data?.items) return [];
    return data.items
      .filter(item => item.url && item.url.startsWith('/watch'))
      .slice(0, 20)
      .map(item => ({
        videoId: item.url.replace('/watch?v=', ''),
        title: item.title || 'Unknown',
        duration: item.duration || 0,
        author: item.uploaderName || 'Unknown',
        thumbnail: item.thumbnail || ''
      }));
  }

  static async getPlaylistVideos(playlistId) {
    const data = await this.fetchFromPiped(`/playlists/${playlistId}`);
    if (!data?.relatedStreams) return [];
    return data.relatedStreams
      .filter(item => item.url && item.url.startsWith('/watch'))
      .map(item => ({
        videoId: item.url.replace('/watch?v=', ''),
        title: item.title || 'Unknown',
        duration: item.duration || 0,
        author: item.uploaderName || 'Unknown',
        thumbnail: item.thumbnail || ''
      }));
  }

  static async importFromUrl(input) {
    const isUrl = /^(https?:\/\/)/i.test(input);
    const playlistId = isUrl ? this.extractPlaylistId(input) : null;
    if (playlistId) {
      const videos = await this.getPlaylistVideos(playlistId);
      if (videos.length > 0) return { type: 'playlist', videos };
    }
    const videoId = isUrl ? this.extractVideoId(input) : null;
    if (videoId) {
      const info = await this.getStreamInfo(videoId);
      if (info) return { type: 'track', info };
      return null;
    }
    const results = await this.search(input);
    if (results.length > 0) return { type: 'search', results };
    return null;
  }
}
