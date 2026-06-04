export const MODULE_ID = 'nova-red-live';

export const CHANNELS = {
  music: {
    id: 'music',
    label: 'nova-red-live.channelLabels.music',
    icon: 'fas fa-headphones',
    playlistMode: 0,
    defaultVolume: 0.5
  },
  ambience: {
    id: 'ambience',
    label: 'nova-red-live.channelLabels.ambience',
    icon: 'fas fa-cloud-rain',
    playlistMode: 2,
    defaultVolume: 0.3
  },
  effects: {
    id: 'effects',
    label: 'nova-red-live.channelLabels.effects',
    icon: 'fas fa-bolt',
    playlistMode: 0,
    defaultVolume: 0.7
  }
};

export const PIPED_INSTANCES = [
  'https://api.piped.private.coffee',
  'https://pipedapi.kavin.rocks',
  'https://pipedapi-libre.kavin.rocks',
  'https://pipedapi.leptons.xyz',
  'https://piped-api.lunar.icu',
  'https://pipedapi.adminforge.de',
  'https://pipedapi.ducks.party'
];

export const SETTINGS = {
  channelVolume: { scope: 'client', type: Object, default: { music: 0.5, ambience: 0.3, effects: 0.7 } },
  scenePresets: { scope: 'world', type: Object, default: {} },
  enabled: { scope: 'client', type: Boolean, default: true },
  hideOnStartup: { scope: 'client', type: Boolean, default: false }
};

export const APP_ID = 'nova-red-live-app';
export const PLAYLIST_PREFIX = 'Nova-Red';
