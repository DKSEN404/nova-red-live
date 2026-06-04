# Nova-Red Live

![Version](https://img.shields.io/badge/version-1.1.0-ffb000?style=flat-square)

> A compact, synchronized YouTube player for Foundry VTT with playlist support, searching, and presets.
> Fork of [foundry-tube](https://github.com/shradee/foundry-tube) by [shrade](https://github.com/shradee).

---

## Installation

1. In Foundry VTT, go to **Add-on Modules** → **Install Module**
2. Paste the manifest URL:

```
https://github.com/DKSEN404/nova-red-live/releases/latest/download/module.json
```

3. Click **Install**
4. Enable the module in your world's **Manage Modules**

---

## Features

- **5 independent channels** — Each with its own playlist, loop, shuffle, and input mode
- **YouTube playback** — Powered by the official YouTube IFrame Player API
- **Real-time sync** — GM controls are synchronized to all players via sockets
- **Playlist management** — Import YouTube playlists, manage individual tracks, drag-and-drop reorder
- **Search** — Search YouTube directly from the player
- **Presets** — Save and load named playlists as presets (world-scoped)
- **GM-authoritative** — Only the Game Master controls playback; players receive synchronized state

---

## Controls

| Control | GM | Player |
|---------|----|--------|
| Play / Pause | ✅ | ❌ (sync only) |
| Previous / Next track | ✅ | ❌ |
| Loop toggle | ✅ | ❌ |
| Shuffle toggle | ✅ | ❌ |
| Volume | ✅ (affects all) | ✅ (local only) |
| Import playlist / video | ✅ | ❌ |
| Search YouTube | ✅ | ❌ |
| Save / Load presets | ✅ | ❌ |
| Manual sync request | ✅ | ✅ |
| Drag-and-drop reorder | ✅ | ❌ |

---

## Configuration

Open the player via the **Tube Player** button in the token controls toolbar, or use the module API:

```javascript
game.modules.get('nova-red-live').api.open();
```

### Settings

| Setting | Scope | Default | Description |
|---------|-------|---------|-------------|
| Autoplay on start | Client | false | Auto-play the last active video on world load |
| Hide on startup | Client | true | Hide the player window on world load |
| Enable transparency | Client | true | Allow the player window to be transparent |
| Minimized opacity | Client | 50% | Opacity when the player window is minimized |

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## License

MIT License — Copyright (c) 2026 DKSEN404

Original work **foundry-tube** Copyright (c) 2026 shrade. See [LICENSE](LICENSE) for details.

---

## Credits

- **shrade** — Creator of [foundry-tube](https://github.com/shradee/foundry-tube), the original module this fork is based on
- **YouTube** — IFrame Player API
