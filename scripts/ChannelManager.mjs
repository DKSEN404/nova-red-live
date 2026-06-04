import { MODULE_ID, CHANNELS, PLAYLIST_PREFIX, SETTINGS } from './constants.mjs';

export class ChannelManager {
  constructor() {
    this.playlists = {};
    this.currentTrack = {};
    this.playing = {};
    this.looping = {};
    this.volumes = {};
  }

  _playlistName(channelId) {
    return `${PLAYLIST_PREFIX} ${game.i18n.localize(CHANNELS[channelId].label)}`;
  }

  async init() {
    const vols = game.settings.get(MODULE_ID, 'channelVolume') || {};
    for (const ch of Object.keys(CHANNELS)) {
      this.volumes[ch] = vols[ch] ?? CHANNELS[ch].defaultVolume;
      this.playing[ch] = false;
      this.looping[ch] = false;
      this.currentTrack[ch] = null;
      await this._findOrCreatePlaylist(ch);
    }
  }

  async _findOrCreatePlaylist(channelId) {
    const name = this._playlistName(channelId);
    let playlist = game.playlists.find(p => p.name.startsWith(PLAYLIST_PREFIX) && p.flags?.[MODULE_ID]?.channel === channelId);
    if (playlist) {
      if (typeof playlist.play !== 'function' || typeof playlist.stop !== 'function') {
        try {
          await playlist.delete();
        } catch (e) {
          console.error(`${MODULE_ID} | Failed to delete corrupt playlist for ${channelId}:`, e);
        }
        playlist = null;
      }
    }
    if (!playlist) {
      try {
        playlist = await Playlist.create({
          name,
          mode: CHANNELS[channelId].playlistMode,
          permission: { default: 2 },
          flags: { [MODULE_ID]: { channel: channelId } }
        });
      } catch (e) {
        console.error(`${MODULE_ID} | Failed to create playlist for ${channelId}:`, e);
        return null;
      }
    }
    this.playlists[channelId] = playlist;
    return playlist;
  }

  async addTrack(channelId, streamData) {
    let playlist = this.playlists[channelId];
    if (!playlist) playlist = await this._findOrCreatePlaylist(channelId);

    const sound = await playlist.createEmbeddedDocuments('PlaylistSound', [{
      name: streamData.title || 'Unknown',
      path: streamData.url,
      duration: streamData.duration || 0,
      volume: this.volumes[channelId],
      playing: false
    }]);
    return sound[0];
  }

  async removeTrack(channelId, soundId) {
    const playlist = this.playlists[channelId];
    if (!playlist) return;
    await playlist.deleteEmbeddedDocuments('PlaylistSound', [soundId]);
  }

  async clearChannel(channelId) {
    const playlist = this.playlists[channelId];
    if (!playlist) return;
    const sounds = playlist.sounds.map(s => s.id);
    if (sounds.length > 0) {
      await playlist.deleteEmbeddedDocuments('PlaylistSound', sounds);
    }
  }

  async play(channelId) {
    const playlist = this.playlists[channelId];
    if (!playlist || typeof playlist.play !== 'function') return;
    if (game.user.isGM) {
      if (this.playing[channelId]) return;
      this.playing[channelId] = true;
      if (this.looping[channelId]) playlist.mode = 0;
      await playlist.play();
    }
  }

  async stop(channelId) {
    const playlist = this.playlists[channelId];
    if (!playlist || typeof playlist.stop !== 'function') return;
    if (game.user.isGM) {
      this.playing[channelId] = false;
      await playlist.stop();
    }
  }

  async next(channelId) {
    const playlist = this.playlists[channelId];
    if (!playlist || typeof playlist.play !== 'function' || typeof playlist.stop !== 'function') return;
    if (this.playing[channelId]) {
      await playlist.stop();
      await playlist.play();
    }
  }

  async setVolume(channelId, volume) {
    this.volumes[channelId] = volume;
    const playlist = this.playlists[channelId];
    if (playlist) {
      const updates = playlist.sounds.map(s => ({
        _id: s.id,
        volume
      }));
      if (updates.length > 0) {
        await playlist.updateEmbeddedDocuments('PlaylistSound', updates);
      }
    }
    const vols = game.settings.get(MODULE_ID, 'channelVolume') || {};
    vols[channelId] = volume;
    await game.settings.set(MODULE_ID, 'channelVolume', vols);
  }

  toggleLoop(channelId) {
    this.looping[channelId] = !this.looping[channelId];
  }

  getState(channelId) {
    const playlist = this.playlists[channelId];
    const currentSound = playlist?.sounds?.find(s => s.playing);
    return {
      channel: channelId,
      playing: this.playing[channelId] || false,
      looping: this.looping[channelId] || false,
      volume: this.volumes[channelId] || 0.5,
      currentTrack: currentSound ? { id: currentSound.id, name: currentSound.name, duration: currentSound.duration } : null,
      trackCount: playlist?.sounds?.size ?? 0
    };
  }

  getAllState() {
    const state = {};
    for (const ch of Object.keys(CHANNELS)) {
      state[ch] = this.getState(ch);
    }
    return state;
  }
}
