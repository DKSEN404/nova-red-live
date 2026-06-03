import { MODULE_ID } from './constants.mjs';

export class ScenePresetManager {
  static savePreset(sceneId, name, config) {
    const presets = game.settings.get(MODULE_ID, 'scenePresets') || {};
    if (!presets[sceneId]) presets[sceneId] = {};
    presets[sceneId][name] = {
      channels: { ...config },
      savedAt: Date.now()
    };
    game.settings.set(MODULE_ID, 'scenePresets', presets);
  }

  static getPresets(sceneId) {
    const presets = game.settings.get(MODULE_ID, 'scenePresets') || {};
    return presets[sceneId] || {};
  }

  static deletePreset(sceneId, name) {
    const presets = game.settings.get(MODULE_ID, 'scenePresets') || {};
    if (presets[sceneId]?.[name]) {
      delete presets[sceneId][name];
      if (Object.keys(presets[sceneId]).length === 0) {
        delete presets[sceneId];
      }
      game.settings.set(MODULE_ID, 'scenePresets', presets);
    }
  }

  static getAllPresets() {
    return game.settings.get(MODULE_ID, 'scenePresets') || {};
  }
}
