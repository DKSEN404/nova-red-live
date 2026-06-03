import { MODULE_ID, SETTINGS } from './constants.mjs';
import { ChannelManager } from './ChannelManager.mjs';
import { AudioDirector } from './AudioDirector.mjs';

let channelManager;
let audioDirector;

Hooks.once('init', () => {
  for (const [key, cfg] of Object.entries(SETTINGS)) {
    game.settings.register(MODULE_ID, key, {
      name: `${MODULE_ID}.settings.${key}.name`,
      hint: `${MODULE_ID}.settings.${key}.hint`,
      scope: cfg.scope,
      config: true,
      type: cfg.type,
      default: cfg.default
    });
  }

  game.settings.register(MODULE_ID, 'soundEffects', {
    scope: 'world',
    config: false,
    type: Object,
    default: []
  });
});

Hooks.once('ready', async () => {
  channelManager = new ChannelManager();
  await channelManager.init();

  audioDirector = new AudioDirector(channelManager);

  const m = game.modules.get(MODULE_ID);
  if (m) {
    m.api = {
      open: () => audioDirector.render(true),
      channelManager,
      getState: () => channelManager.getAllState()
    };
  }

  if (game.user.isGM) {
    setTimeout(async () => {
      await audioDirector.render(true);
      if (game.settings.get(MODULE_ID, 'hideOnStartup')) {
        audioDirector.close();
      }
    }, 1000);
  }

  Hooks.on('canvasReady', () => {
    if (!game.user.isGM) return;
  });
});

Hooks.on('getSceneControlButtons', (controls) => {
  if (!game.user.isGM) return;
  const tool = {
    name: 'nr-audio-director',
    title: 'Nova-Red Live',
    icon: 'fas fa-headphones',
    visible: true,
    button: true,
    onClick: () => {
      if (!audioDirector) return;
      if (audioDirector.rendered) {
        audioDirector.close();
      } else {
        audioDirector.render(true);
      }
    }
  };

  if (Array.isArray(controls)) {
    const token = controls.find(c => c.name === 'token');
    if (token) token.tools.push(tool);
  } else {
    const tokenLayer = controls.token || controls.tokens;
    if (tokenLayer) {
      if (Array.isArray(tokenLayer.tools)) {
        tokenLayer.tools.push(tool);
      } else {
        tokenLayer.tools['nr-audio-director'] = tool;
      }
    }
  }
});
