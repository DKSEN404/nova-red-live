import { PIPED_INSTANCES, MODULE_ID } from './constants.mjs';
import { PipedProxy } from './PipedProxy.mjs';

const CORS_PROXIES = [
  { url: 'https://api.allorigins.win/get?url=', type: 'allorigins' },
  { url: 'https://corsproxy.io/?', type: 'passthrough' }
];

export class YouTubeImporter {
  static async fetchFromPiped(endpoint) {
    for (const instance of PIPED_INSTANCES) {
      try {
        return await PipedProxy.proxyFetch(`${instance}${endpoint}`);
      } catch (e) {
        continue;
      }
    }
    for (const instance of PIPED_INSTANCES) {
      try {
        const url = `${instance}${endpoint}`;
        const res = await fetch(url);
        if (!res.ok) continue;
        return await res.json();
      } catch (e) {
        continue;
      }
    }
    for (const proxy of CORS_PROXIES) {
      for (const instance of PIPED_INSTANCES) {
        try {
          const targetUrl = `${instance}${endpoint}`;
          const proxyUrl = `${proxy.url}${encodeURIComponent(targetUrl)}`;
          const res = await fetch(proxyUrl);
          if (!res.ok) continue;
          let data;
          if (proxy.type === 'allorigins') {
            const wrapper = await res.json();
            if (!wrapper?.contents) continue;
            data = JSON.parse(wrapper.contents);
          } else {
            data = await res.json();
          }
          return data;
        } catch (e) {
          continue;
        }
      }
    }
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
    const data = await this.fetchFromPiped(`/streams/${videoId}`);
    if (!data) return null;

    const audio = data.audioStreams?.[0];
    if (!audio) return null;

    return {
      url: audio.url,
      mimeType: audio.mimeType,
      quality: audio.quality,
      title: data.title || 'Unknown',
      duration: data.duration || 0,
      author: data.uploader || 'Unknown',
      thumbnail: data.thumbnailUrl || '',
      videoId
    };
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
