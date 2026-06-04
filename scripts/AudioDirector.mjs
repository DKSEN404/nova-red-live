import { MODULE_ID, APP_ID, CHANNELS } from './constants.mjs';
import { ChannelManager } from './ChannelManager.mjs';
import { YouTubeImporter } from './YouTubeImporter.mjs';

export class AudioDirector extends Application {
  constructor(channelManager) {
    super();
    this.cm = channelManager;
    this.isCustomMinimized = false;
    this.savedHeight = 400;
    this.savedWidth = 620;
    this._searchResults = {};
    this._importStates = {};
    window.audioDirector = this;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: APP_ID,
      title: 'Nova-Red Live',
      template: `modules/${MODULE_ID}/templates/mixer.hbs`,
      width: 620,
      height: 400,
      top: 80,
      left: 100,
      resizable: true,
      icon: 'fas fa-headphones',
      classes: ['nova-red-live-app']
    });
  }

  getData() {
    const channels = [];
    for (const [id, cfg] of Object.entries(CHANNELS)) {
      const state = this.cm.getState(id);
      channels.push({
        id,
        label: game.i18n.localize(cfg.label),
        icon: cfg.icon,
        playing: state.playing,
        looping: state.looping,
        volume: state.volume,
        volumePct: Math.round(state.volume * 100),
        trackName: state.currentTrack?.name || '---',
        duration: this._fmtDuration(state.currentTrack?.duration || 0),
        trackCount: state.trackCount
      });
    }
    return {
      isGM: game.user.isGM,
      channels,
      soundEffects: game.settings.get(MODULE_ID, 'soundEffects') || [],
      searchResults: Object.keys(this._searchResults).length > 0 ? this._searchResults : null
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    const HANDLERS = {
      'channel-play': this._onChannelPlay.bind(this),
      'channel-stop': this._onChannelStop.bind(this),
      'channel-loop': this._onChannelLoop.bind(this),
      'channel-clear': this._onChannelClear.bind(this),
      'import-url': this._onImportUrl.bind(this),
      'search-query': this._onSearchQuery.bind(this),
      'search-select': this._onSearchSelect.bind(this),
      'search-close': this._onSearchClose.bind(this),
      'sfx-play': this._onSfxPlay.bind(this),
      minimize: this._onMinimize.bind(this),
      'import-playlist': this._onImportPlaylist.bind(this)
    };

    html[0].addEventListener('click', (event) => {
      const target = event.target.closest('[data-action]');
      if (!target) return;
      const action = target.dataset.action;
      const handler = HANDLERS[action];
      if (handler) {
        event.preventDefault();
        handler(event, target);
      }
    });

    html[0].addEventListener('change', (event) => {
      const target = event.target;
      if (target.name === 'channel-volume') {
        const channelId = target.dataset.channel;
        const volume = parseFloat(target.value);
        this.cm.setVolume(channelId, volume);
        const pct = Math.round(volume * 100);
        const lbl = html[0].querySelector(`.volume-label[data-channel="${channelId}"]`);
        if (lbl) lbl.textContent = `${pct}%`;
      }
    });

    html[0].addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const importInput = html[0].querySelector('#nr-import-input');
        if (importInput && document.activeElement === importInput) {
          this._handleImport(importInput.value.trim());
          importInput.value = '';
        }
        const searchInput = html[0].querySelector('#nr-search-input');
        if (searchInput && document.activeElement === searchInput) {
          this._handleSearch(searchInput.value.trim());
        }
      }
    });
  }

  async _onChannelPlay(event, target) {
    const ch = target.dataset.channel;
    if (this.cm.playing[ch]) {
      await this.cm.stop(ch);
    } else {
      await this.cm.play(ch);
    }
    this.render();
  }

  async _onChannelStop(event, target) {
    await this.cm.stop(target.dataset.channel);
    this.render();
  }

  _onChannelLoop(event, target) {
    this.cm.toggleLoop(target.dataset.channel);
    target.classList.toggle('active');
  }

  async _onChannelClear(event, target) {
    const ch = target.dataset.channel;
    await this.cm.clearChannel(ch);
    this.render();
  }

  async _onImportUrl(event, target) {
    const ch = target.dataset.channel;
    let input = this.element[0].querySelector(`#nr-import-input-${ch}`);
    if (!input) input = this.element[0].querySelector('#nr-import-input');
    if (!input) return;
    const val = input.value.trim();
    if (!val) return;
    input.value = '';
    await this._handleImport(val, ch);
  }

  async _handleImport(val, channelId) {
    if (!val) return;
    const isUrl = /^(https?:\/\/)/i.test(val);
    if (isUrl && !/(youtube\.com|youtu\.be)/i.test(val)) {
      try { ui.notifications.warn('Only YouTube URLs or search terms are supported'); } catch (e) { console.warn(`${MODULE_ID} |`, e); }
      return;
    }
    const result = await YouTubeImporter.importFromUrl(val);
    if (!result) {
      const err = YouTubeImporter.lastError;
      let msg;
      if (err?.startsWith('no_audio_streams')) {
        msg = game.i18n.localize('nova-red-live.import.noAudioStreams');
        const detail = err.includes('(') ? err.substring(err.indexOf('(')) : '';
        if (detail) msg += ` ${detail}`;
      } else if (err === 'all_tiers_exhausted') {
        msg = game.i18n.localize('nova-red-live.import.pipedUnavailable');
      } else {
        msg = game.i18n.localize('nova-red-live.import.notFound');
      }
      try { ui.notifications.warn(msg); } catch (e) { console.warn(`${MODULE_ID} |`, e); }
      return;
    }

    if (result.type === 'track') {
      const targetCh = channelId || 'music';
      await this.cm.addTrack(targetCh, result.info);
      try { ui.notifications.info(`Added: ${result.info.title}`); } catch (e) { console.warn(`${MODULE_ID} |`, e); }
      this.render();
    } else if (result.type === 'playlist') {
      const targetCh = channelId || 'music';
      let count = 0;
      for (const v of result.videos) {
        const info = await YouTubeImporter.getStreamInfo(v.videoId);
        if (info) {
          await this.cm.addTrack(targetCh, info);
          count++;
        }
      }
      try { ui.notifications.info(`Imported ${count} tracks from playlist`); } catch (e) { console.warn(`${MODULE_ID} |`, e); }
      this.render();
    } else if (result.type === 'search') {
      this._searchResults = { query: val, results: result.results, channel: channelId || 'music' };
      this.render();
    }
  }

  _onSearchQuery(event, target) {
    const ch = target.dataset.channel;
    const input = this.element[0].querySelector(`#nr-search-input-${ch}`);
    if (!input) return;
    this._handleSearch(input.value.trim(), ch);
  }

  async _handleSearch(query, channelId) {
    if (!query) return;
    const results = await YouTubeImporter.search(query);
    this._searchResults = { query, results, channel: channelId || 'music' };
    this.render();
  }

  _onSearchSelect(event, target) {
    const videoId = target.dataset.videoid;
    const ch = target.dataset.channel || this._searchResults.channel;
    if (!videoId) return;
    YouTubeImporter.getStreamInfo(videoId).then(info => {
      if (info) {
        this.cm.addTrack(ch, info).then(() => {
          ui.notifications.info(`Added: ${info.title}`);
          this._searchResults = {};
          this.render();
        });
      }
    });
  }

  _onSearchClose() {
    this._searchResults = {};
    this.render();
  }

  _onSfxPlay(event, target) {
    const path = target.dataset.path;
    if (path) {
      game.audio.play(path);
    }
  }

  _onMinimize() {
    this.isCustomMinimized = !this.isCustomMinimized;
    if (this.isCustomMinimized) {
      if (this.element[0]) {
        this.savedWidth = this.element[0].offsetWidth;
        if (this.element[0].offsetHeight > 100) this.savedHeight = this.element[0].offsetHeight;
      }
      this.element[0].classList.add('custom-minimized');
      this.setPosition({ height: 58, width: this.savedWidth });
    } else {
      this.element[0].classList.remove('custom-minimized');
      const w = this.savedWidth || 620;
      const h = (this.savedHeight && this.savedHeight > 100) ? this.savedHeight : 400;
      this.setPosition({ width: w, height: h });
    }
  }

  _onImportPlaylist(event, target) {
    const ch = target.dataset.channel;
    const url = prompt('Paste a YouTube playlist URL:');
    if (url) this._handleImport(url, ch);
  }

  _fmtDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const s = Math.floor(seconds % 60);
    const m = Math.floor((seconds / 60) % 60);
    const h = Math.floor(seconds / 3600);
    const ss = s < 10 ? `0${s}` : s;
    if (h > 0) {
      const mm = m < 10 ? `0${m}` : m;
      return `${h}:${mm}:${ss}`;
    }
    return `${m}:${ss}`;
  }

  async close(options = {}) {
    return super.close(options);
  }
}
