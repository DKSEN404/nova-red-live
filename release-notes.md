### v1.0.0 — Redesign Completo: Mixer Nativo Foundry + Piped API + 3 Canales (2026-06-03)

#### Breaking Changes
- **Arquitectura completamente nueva**: El monolito `scripts/main.js` (973 líneas) fue reemplazado por 6 módulos ES independientes
- **YouTube IFrame API eliminada**: Ya no se usan iframes embebidos de YouTube
- **Sockets custom eliminados**: La sincronización GM↔Players ahora usa Playlists nativas de Foundry
- **5 tabs genéricos → 3 canales temáticos**: Música (sequential), Ambiente (simultaneous), Efectos (one-shot)

#### Nuevo
- `scripts/constants.mjs`: MODULE_ID, 3 CHANNELS (music/ambience/effects), PIPED_INSTANCES (5 instancias)
- `scripts/YouTubeImporter.mjs`: Cliente REST Piped API con fallback multi-instancia para streams de audio
- `scripts/ChannelManager.mjs`: CRUD de Playlists Foundry + control de reproducción por canal
- `scripts/AudioDirector.mjs`: App mixer (Application v12) con 3 canales, búsqueda YouTube, soundboard
- `scripts/ScenePresetManager.mjs`: Presets de audio vinculados a escenas
- `scripts/main.mjs`: Entry point con hooks init/ready, settings, botón de escena, API pública
- `templates/mixer.hbs`: Template del mixer con import bar, search panel, 3 canales
- `templates/soundboard.hbs`: Template placeholder para efectos de sonido
- `styles/nova-red-live.css`: Tema Cyberpunk (~280 líneas, 7 secciones)
- `lang/en.json`, `lang/es.json`: i18n namespace nova-red-live., claves idénticas

#### Cambiado
- **Piped API**: Reemplaza completamente el scraping de HTML con proxies CORS
- **Playlists Foundry nativas**: Reemplazan sockets custom — Foundry sincroniza automáticamente
- `module.json`: version 1.0.0, esmodules → main.mjs, +languages array, eliminado flag "socket"

#### Créditos
- Módulo original: **foundry-tube** por [shrade](https://github.com/shradee)
