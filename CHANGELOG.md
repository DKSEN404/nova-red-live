# Changelog — Nova-Red Live

All notable changes to this project will be documented in this file.

## [1.0.4] — 2026-06-03

### Fixed
- **`scripts/PipedProxy.mjs`**: Socket proxy was not working in Foundry v12.331. Root cause: Foundry v12 uses the **entire event name** as the routing key. When two sub-events were used (`module.nova-red-live.piped-proxy` and `module.nova-red-live.piped-proxy-response`), the server's `game.socket.on()` handlers never fired because the event name routing didn't match. Fixed by switching to a **single event name** (`module.nova-red-live`) with `data.action` field (`'proxy-req'` / `'proxy-res'`) to distinguish request from response — matching the convention used by other Foundry v12 modules (e.g. Preload Tracker uses `module.preload-tracker`). Also added wrapped `game.socket.emit` in try/catch so failures reject the promise immediately. Added comprehensive logging on init, emit, and server-side processing for future debug.
- **`scripts/AudioDirector.mjs`**: `_handleImport()` notification calls wrapped in try/catch to prevent `mobile-improvements` (v1.3.3) `queuedNotification` hook crash (`Cannot read properties of undefined (reading 'replace')`) from propagating as an unhandled error.

### Changed
- **`scripts/constants.mjs`**: Added two additional Piped instances (`pipedapi.us.owo.codes` and `pipedapi.namazso.eu`) to improve reliability when multiple instances are down.

### Credits
- Original module: **foundry-tube** by [shrade](https://github.com/shradee)

## [1.0.3] — 2026-06-03

### Added
- **`scripts/PipedProxy.mjs`**: New module — server-side socket bridge for Piped API. Uses Foundry's `game.socket` to relay proxy requests from browser clients to the Node.js server, which makes unrestricted HTTP requests (`fetch()`) to Piped instances (no CORS). Server detected via `typeof window === 'undefined'`. Includes 15s timeout per request, unique request IDs, and concurrent request support via `pending` Map.
- **`scripts/main.mjs`**: Added `PipedProxy.init()` call in `ready` hook, runs before `ChannelManager` initialization to ensure proxy is available for import operations.
- **`module.json`**: Added `"socket": true` flag to enable Foundry socket API for server-side proxy.

### Changed
- **`scripts/YouTubeImporter.mjs`**: `fetchFromPiped()` now has 3-tier fallback:
  1. **Socket proxy** (server-side, no CORS) — new Tier 1
  2. **Direct Piped call** (may work in Electron desktop client)
  3. **CORS proxies** (allorigins, corsproxy.io) — removed `codetabs` and `cors.sh` (unreliable)
- **`scripts/constants.mjs`**: Replaced dead Piped instances `silentx.me` (DNS) and `qdi.ax` (DNS) with `pipedapi.adminforge.de` and `pipedapi.oxy.wiki`

### Credits
- Original module: **foundry-tube** by [shrade](https://github.com/shradee)

## [1.0.2] — 2026-06-03

### Fixed
- **`scripts/ChannelManager.mjs`**: `_findOrCreatePlaylist()` now validates existing playlists found in world data. If a playlist from v1.0.0 has invalid methods (corrupted by `mode: 3`), it is deleted and recreated. Added `typeof` guard in `play()`, `stop()`, and `next()` to prevent `playlist.play is not a function` errors. (B5 — CRITICAL)
- **`scripts/YouTubeImporter.mjs`**: Changed `api.allorigins.win` proxy from `/raw` (no CORS) to `/get` endpoint (has CORS headers). Added `cors.sh` and `codetabs` as additional proxy fallbacks. Added JSON wrapper parsing for allorigins `/get` response format. (B3 — CRITICAL)
- **`scripts/AudioDirector.mjs`**: `_handleImport()` now rejects non-YouTube URLs early with a clear message ("Only YouTube URLs or search terms are supported"), preventing failed imports for Spotify/other URLs.

### Changed
- `module.json`: version → `1.0.2`, removed dead Piped instances `r4fo.com` and `ngn.tf` (DNS errors confirmed), added `pipedapi.silentx.me` and `pipedapi.qdi.ax` as replacements

### Credits
- Original module: **foundry-tube** by [shrade](https://github.com/shradee)

## [1.0.1] — 2026-06-03

### Fixed
- **`scripts/constants.mjs`**: `ambience.playlistMode` changed from `3` to `2`. Foundry v12 only supports modes 0 (sequential), 1 (shuffle), 2 (simultaneous). Mode `3` caused `Playlist.create()` validation failure → cascading crash → `TypeError: playlist.play is not a function` (B1 — CRITICAL)
- **`scripts/AudioDirector.mjs`**: Removed `close()` override that blocked all close attempts (X button, Escape key, programmatic close). Foundry v12 `Application` handles close natively — no override needed. (B2 — CRITICAL)
- **`scripts/AudioDirector.mjs`**: `_onImportUrl()` now falls back to `#nr-import-input` (top bar input) when per-channel `#nr-import-input-${ch}` doesn't exist. Previously only scanned per-channel inputs. (B4)
- **`scripts/AudioDirector.mjs`**: `_handleImport()` now validates `val` before use and sanitizes `.warn()` message with `game.i18n.localize(...)` fallback instead of bare string. (B4)
- **`scripts/main.mjs`**: Toggle button now uses `audioDirector.close()` / `audioDirector.render(true)` natively instead of `style.display = 'none'/'block'`. Combined with the `close()` override fix, the window can now be toggled properly. (B2)
- **`scripts/main.mjs`**: `hideOnStartup` now only executes for GM users (`if (game.user.isGM)`) and uses `audioDirector.close()` instead of `style.display = 'none'`. (B2)
- **`scripts/YouTubeImporter.mjs`**: Added CORS proxy chain (`api.allorigins.win`, `corsproxy.io`) as second-level fallback after direct Piped instance attempts. Browser `fetch()` cannot access Piped API directly due to missing CORS headers. (B3 — CRITICAL)
- **`scripts/YouTubeImporter.mjs`**: `importFromUrl()` now checks `isUrl` before extracting video/playlist IDs. If a URL fails `getStreamInfo()`, returns `null` instead of falling back to `search()` with the full URL as query. (B4)
- **`scripts/ChannelManager.mjs`**: `_findOrCreatePlaylist()` wrapped in `try/catch` to handle `Playlist.create()` validation errors gracefully instead of crashing. (B1)
- **`scripts/ChannelManager.mjs`**: `getState()` now uses `??` (nullish coalescing) and explicit defaults (`false`, `0.5`, `0`) instead of bare `undefined` values. (B1)
- **`styles/nova-red-live.css`**: Restored native `window-header` chrome (24px min-height, visible title, functional close/minimize buttons). Removed `display: none !important` on children and `overflow: hidden` that disabled all window controls. (B2)

### Changed
- `module.json`: version → `1.0.1`

### Credits
- Original module: **foundry-tube** by [shrade](https://github.com/shradee)

## [1.0.0] — 2026-06-03

### Added
- **Arquitectura modular ES (`scripts/*.mjs`)** — Reemplaza el monolito `scripts/main.js` (973 líneas) con 6 módulos independientes:
  - `scripts/constants.mjs`: MODULE_ID, 3 CHANNELS (music/ambience/effects), PIPED_INSTANCES (5), SETTINGS
  - `scripts/YouTubeImporter.mjs`: Cliente REST Piped API con fallback multi-instancia para obtener streams de audio de YouTube
  - `scripts/ChannelManager.mjs`: Gestión de Playlists nativas de Foundry por canal (CRUD + control de reproducción)
  - `scripts/AudioDirector.mjs`: Aplicación mixer (Application v12) con 3 canales, búsqueda YouTube, soundboard
  - `scripts/ScenePresetManager.mjs`: Presets de audio vinculados a escenas (world settings)
  - `scripts/main.mjs`: Entry point con hooks init/ready, settings, botón de escena, API pública
- **`templates/mixer.hbs`**: Template del mixer con import bar, search panel, 3 canales (play/stop/loop/volume/clear)
- **`templates/soundboard.hbs`**: Template placeholder para panel de efectos de sonido
- **`styles/nova-red-live.css`**: Tema Cyberpunk (~280 líneas, 7 secciones, accent `#ffb000`)
- **`lang/en.json`**, **`lang/es.json`**: i18n con namespace `nova-red-live.`, claves idénticas en ambos idiomas

### Changed
- **Integración con Foundry nativa**: Playlists reemplazan sockets custom — Foundry sincroniza automáticamente GM↔Players
- **Piped API reemplaza scraping YouTube**: URLs directas de stream M4A vía `pipedapi.kavin.rocks` con fallback chain de 5 instancias
- **3 canales temáticos**: Música (sequential), Ambiente (simultaneous), Efectos (one-shot vía AudioHelper)
- **`module.json`**: `version` → `1.0.0`, `esmodules` → `scripts/main.mjs`, agregado `languages` array, eliminado flag `"socket": true`

### Removed
- Dependencia de YouTube IFrame API (`YT.Player`, `onYouTubeIframeAPIReady`)
- Dependencia de scraping HTML con proxies CORS (`_fetchText`, `_parseYouTubeHtml`)
- Dependencia de socketlib para sincronización
- 5 tabs genéricos reemplazados por 3 canales con propósito definido
- Archivos legacy (aún en disco, no se cargan): `scripts/main.js`, `styles/style.css`, `templates/widget.hbs`, `languages/`

### Credits
- Original module: **foundry-tube** by [shrade](https://github.com/shradee)

## [0.0.4] — 2026-06-03

### Fixed
- `scripts/main.js`: All 17 `data-action` buttons were unresponsive after v13→v12 migration because `DEFAULT_OPTIONS.actions` was removed in v0.0.2 without adding manual event binding (C1 — CRITICAL)
- `scripts/main.js`: `shuffleBtn.display` → `shuffleBtn.style.display` (H1)

### Added
- `scripts/main.js`: Event delegation for all `data-action` buttons in `activateListeners` via `html[0].addEventListener('click', …)` with `event.target.closest('[data-action]')` — restores all button functionality (playback, loop, shuffle, queue, presets, search, etc.)
- `scripts/main.js`: Console logging with `NovaRedLiveApp |` prefix in event delegation dispatch, catch blocks, and missing handler warnings for future debugging
- `scripts/main.js`: `.catch()` on initial `render(true)` call to prevent unhandled promise rejection

### Changed
- `module.json`: version → `0.0.4`

### Credits
- Original module: **foundry-tube** by [shrade](https://github.com/shradee)

## [0.0.3] — 2026-06-03

### Fixed
- `scripts/main.js`: `MODULE_ID` was still `'foundry-tube'` instead of `'nova-red-live'` — caused:
  - Template path resolved to nonexistent `modules/foundry-tube/templates/widget.hbs` → `render()` silently failed → button did nothing
  - Settings registered under wrong namespace → "sin mapear" in settings panel
  - `game.modules.get(MODULE_ID)` returned `undefined`

### Changed
- `scripts/main.js`: class renamed `FoundryTubeApp` → `NovaRedLiveApp`
- `scripts/main.js`: window title `"Tube"` → `"Live Player"`, button title `"Tube Player"` → `"Live Player"`
- `scripts/main.js`: `getSceneControlButtons` — button now only visible to GMs (`if (!game.user.isGM) return;`)
- `module.json`: version → `0.0.3`

### Credits
- Original module: **foundry-tube** by [shrade](https://github.com/shradee)

## [0.0.2] — 2026-06-03

### Changed
- `module.json`: compatibility → minimum `12`, verified `12.331`; version → `0.0.2`
- `scripts/main.js`: migrated from Foundry VTT v13 (`ApplicationV2` / `HandlebarsApplicationMixin`) to v12 (`Application`):
  - `static DEFAULT_OPTIONS` → `static get defaultOptions()` with `foundry.utils.mergeObject`
  - `static PARTS` removed; `template` string in `defaultOptions`
  - `_prepareContext(options)` → synchronous `getData()`
  - `_onRender(context, options)` → `activateListeners(html)` with `super.activateListeners(html)`
  - `render({ force: true })` → `render(true)` (×3)
  - `this.element.querySelector()` → `this.element[0].querySelector()` (×22)
  - `this.element.closest()` → `this.element[0].closest()`
  - `this.element.style` → `this.element[0].style` (×5)
  - `this.element.classList` → `this.element[0].classList` (×2)
  - `this.element.offsetWidth` / `.offsetHeight` → `this.element[0].offsetWidth` / `.offsetHeight`
  - `if (this.element)` → `if (this.element[0])`
  - `tubeApp.element` → `tubeApp.element[0]` (×4)
  - `app.element` → `app.element[0]` (×5)

### Fixed
- `syncShuffle` handler used `p.isLooping` instead of `p.isShuffling` (pre-existing)

### Credits
- Original module: **foundry-tube** by [shrade](https://github.com/shradee)

## [0.0.1] — 2026-06-03

### Added
- Fork of **foundry-tube** v1.4.1 by [shrade](https://github.com/shradee)
- `LICENSE` — MIT License with attribution to original work
- `CHANGELOG.md` — Bilingual changelog (EN/ES)
- `README.md` — English documentation
- `README.es.md` — Spanish documentation
- `languages/es.json` — Spanish localization
- `.github/workflows/release-validate.yml` — CI/CD pipeline

### Changed
- `module.json`: id → `nova-red-live`, title → `Nova-Red Live`, version → `0.0.1`, authors updated, URLs point to new repository

### Credits
- Original module: **foundry-tube** by [shrade](https://github.com/shradee)

---

# Changelog — Nova-Red Live

Todos los cambios notables de este proyecto se documentarán en este archivo.

## [1.0.3] — 2026-06-03

### Añadido
- **`scripts/PipedProxy.mjs`**: Nuevo módulo — puente socket server-side para Piped API. Usa `game.socket` de Foundry para relayar peticiones proxy desde clientes navegador al servidor Node.js, que hace peticiones HTTP sin restricciones CORS. El servidor se detecta via `typeof window === 'undefined'`. Incluye timeout de 15s por petición, IDs de request únicos, y soporte de peticiones concurrentes via Map `pending`.
- **`scripts/main.mjs`**: Añadida llamada `PipedProxy.init()` en hook `ready`, ejecutada antes de inicializar `ChannelManager` para asegurar que el proxy está disponible para importaciones.
- **`module.json`**: Añadido flag `"socket": true` para habilitar API de socket de Foundry para proxy server-side.

### Cambiado
- **`scripts/YouTubeImporter.mjs`**: `fetchFromPiped()` ahora tiene 3 niveles de fallback:
  1. **Socket proxy** (server-side, sin CORS) — nuevo Tier 1
  2. **Llamada directa Piped** (puede funcionar en cliente desktop Electron)
  3. **Proxies CORS** (allorigins, corsproxy.io) — eliminados `codetabs` y `cors.sh` (no confiables)
- **`scripts/constants.mjs`**: Reemplazadas instancias Piped caídas `silentx.me` (DNS) y `qdi.ax` (DNS) por `pipedapi.adminforge.de` y `pipedapi.oxy.wiki`

### Créditos
- Módulo original: **foundry-tube** por [shrade](https://github.com/shradee)

## [1.0.2] — 2026-06-03

### Corregido
- **`scripts/ChannelManager.mjs`**: `_findOrCreatePlaylist()` ahora valida las playlists existentes encontradas en la base de datos del mundo. Si una playlist de v1.0.0 tiene métodos inválidos (corrupta por `mode: 3`), se elimina y recrea. Agregada guardia `typeof` en `play()`, `stop()` y `next()` para prevenir errores `playlist.play is not a function`. (B5 — CRÍTICO)
- **`scripts/YouTubeImporter.mjs`**: Cambiado proxy de `api.allorigins.win` de `/raw` (sin CORS) al endpoint `/get` (con cabeceras CORS). Agregados `cors.sh` y `codetabs` como proxies fallback adicionales. Agregado parseo del wrapper JSON para el formato de respuesta de `/get`. (B3 — CRÍTICO)
- **`scripts/AudioDirector.mjs`**: `_handleImport()` ahora rechaza URLs no-YouTube temprano con un mensaje claro ("Solo se aceptan URLs de YouTube o términos de búsqueda"), previniendo imports fallidos para URLs de Spotify y otros.

### Cambiado
- `module.json`: versión → `1.0.2`, instancias Piped caídas `r4fo.com` y `ngn.tf` eliminadas, agregadas `pipedapi.silentx.me` y `pipedapi.qdi.ax`

### Créditos
- Módulo original: **foundry-tube** por [shrade](https://github.com/shradee)

## [1.0.1] — 2026-06-03

### Corregido
- **`scripts/constants.mjs`**: `ambience.playlistMode` cambiado de `3` a `2`. Foundry v12 solo soporta modos 0 (secuencial), 1 (aleatorio), 2 (simultáneo). El modo `3` causaba fallo de validación en `Playlist.create()` → error en cascada → `TypeError: playlist.play is not a function` (B1 — CRÍTICO)
- **`scripts/AudioDirector.mjs`**: Eliminada la sobreescritura de `close()` que bloqueaba todos los intentos de cierre (botón X, tecla Escape, cierre programático). Foundry v12 `Application` maneja el cierre de forma nativa — no necesita override. (B2 — CRÍTICO)
- **`scripts/AudioDirector.mjs`**: `_onImportUrl()` ahora usa `#nr-import-input` (input de la barra superior) como fallback cuando el input por canal `#nr-import-input-${ch}` no existe. Anteriormente solo escaneaba inputs por canal. (B4)
- **`scripts/AudioDirector.mjs`**: `_handleImport()` ahora valida `val` antes de usarlo y sanitiza el mensaje de `.warn()` con `game.i18n.localize(...)` en vez de un string sin localizar. (B4)
- **`scripts/main.mjs`**: El botón toggle ahora usa `audioDirector.close()` / `audioDirector.render(true)` nativos en vez de `style.display = 'none'/'block'`. Combinado con la corrección del `close()`, la ventana ahora se puede ocultar/mostrar correctamente. (B2)
- **`scripts/main.mjs`**: `hideOnStartup` ahora solo se ejecuta para GMs (`if (game.user.isGM)`) y usa `audioDirector.close()` en vez de `style.display = 'none'`. (B2)
- **`scripts/YouTubeImporter.mjs`**: Añadida cadena de proxies CORS (`api.allorigins.win`, `corsproxy.io`) como segundo nivel de fallback tras intentos directos a instancias Piped. El `fetch()` del navegador no puede acceder a la API de Piped directamente por falta de cabeceras CORS. (B3 — CRÍTICO)
- **`scripts/YouTubeImporter.mjs`**: `importFromUrl()` ahora verifica `isUrl` antes de extraer IDs de video/playlist. Si una URL falla en `getStreamInfo()`, retorna `null` en vez de caer en `search()` con la URL completa como consulta. (B4)
- **`scripts/ChannelManager.mjs`**: `_findOrCreatePlaylist()` envuelto en `try/catch` para manejar errores de validación de `Playlist.create()` sin colgar el módulo. (B1)
- **`scripts/ChannelManager.mjs`**: `getState()` ahora usa `??` (coalescencia nula) y valores por defecto explícitos (`false`, `0.5`, `0`) en vez de valores `undefined`. (B1)
- **`styles/nova-red-live.css`**: Restaurado el `window-header` nativo (24px de alto mínimo, título visible, botones de cerrar/minimizar funcionales). Eliminados `display: none !important` en hijos y `overflow: hidden` que deshabilitaban todos los controles de ventana. (B2)

### Cambiado
- `module.json`: versión → `1.0.1`

### Créditos
- Módulo original: **foundry-tube** por [shrade](https://github.com/shradee)

## [1.0.0] — 2026-06-03

### Añadido
- **Arquitectura modular ES (`scripts/*.mjs`)** — Reemplaza el monolito `scripts/main.js` (973 líneas) con 6 módulos independientes:
  - `scripts/constants.mjs`: MODULE_ID, 3 CHANNELS (music/ambience/effects), PIPED_INSTANCES (5), SETTINGS
  - `scripts/YouTubeImporter.mjs`: Cliente REST Piped API con fallback multi-instancia para obtener streams de audio de YouTube
  - `scripts/ChannelManager.mjs`: Gestión de Playlists nativas de Foundry por canal (CRUD + control de reproducción)
  - `scripts/AudioDirector.mjs`: Aplicación mixer (Application v12) con 3 canales, búsqueda YouTube, soundboard
  - `scripts/ScenePresetManager.mjs`: Presets de audio vinculados a escenas (world settings)
  - `scripts/main.mjs`: Entry point con hooks init/ready, settings, botón de escena, API pública
- **`templates/mixer.hbs`**: Template del mixer con import bar, search panel, 3 canales (play/stop/loop/volume/clear)
- **`templates/soundboard.hbs`**: Template placeholder para panel de efectos de sonido
- **`styles/nova-red-live.css`**: Tema Cyberpunk (~280 líneas, 7 secciones, accent `#ffb000`)
- **`lang/en.json`**, **`lang/es.json`**: i18n con namespace `nova-red-live.`, claves idénticas en ambos idiomas

### Cambiado
- **Integración con Foundry nativa**: Playlists reemplazan sockets custom — Foundry sincroniza automáticamente GM↔Players
- **Piped API reemplaza scraping YouTube**: URLs directas de stream M4A vía `pipedapi.kavin.rocks` con fallback chain de 5 instancias
- **3 canales temáticos**: Música (sequential), Ambiente (simultaneous), Efectos (one-shot vía AudioHelper)
- **`module.json`**: `version` → `1.0.0`, `esmodules` → `scripts/main.mjs`, agregado `languages` array, eliminado flag `"socket": true`

### Eliminado
- Dependencia de YouTube IFrame API (`YT.Player`, `onYouTubeIframeAPIReady`)
- Dependencia de scraping HTML con proxies CORS (`_fetchText`, `_parseYouTubeHtml`)
- Dependencia de socketlib para sincronización
- 5 tabs genéricos reemplazados por 3 canales con propósito definido
- Archivos legacy (aún en disco, no se cargan): `scripts/main.js`, `styles/style.css`, `templates/widget.hbs`, `languages/`

### Créditos
- Módulo original: **foundry-tube** por [shrade](https://github.com/shradee)

## [0.0.4] — 2026-06-03

### Corregido
- `scripts/main.js`: Los 17 botones `data-action` no respondían tras la migración v13→v12 porque `DEFAULT_OPTIONS.actions` se eliminó en v0.0.2 sin agregar bindeo manual de eventos (C1 — CRÍTICO)
- `scripts/main.js`: `shuffleBtn.display` → `shuffleBtn.style.display` (H1)

### Añadido
- `scripts/main.js`: Delegación de eventos para todos los botones `data-action` en `activateListeners` vía `html[0].addEventListener('click', …)` con `event.target.closest('[data-action]')` — restaura toda la funcionalidad de botones (reproducción, loop, shuffle, cola, presets, búsqueda, etc.)
- `scripts/main.js`: Registro en consola con prefijo `NovaRedLiveApp |` en despacho de delegación, bloques catch, y advertencias de handler faltante para depuración futura
- `scripts/main.js`: `.catch()` en la llamada inicial `render(true)` para evitar rechazo de promesa no manejado

### Cambiado
- `module.json`: versión → `0.0.4`

### Créditos
- Módulo original: **foundry-tube** por [shrade](https://github.com/shradee)

## [0.0.3] — 2026-06-03

### Corregido
- `scripts/main.js`: `MODULE_ID` seguía siendo `'foundry-tube'` en vez de `'nova-red-live'` — causaba:
  - Ruta del template apuntaba a `modules/foundry-tube/templates/widget.hbs` inexistente → `render()` fallaba silenciosamente → botón no funcionaba
  - Settings registradas bajo namespace incorrecto → "sin mapear" en panel de configuración
  - `game.modules.get(MODULE_ID)` retornaba `undefined`

### Cambiado
- `scripts/main.js`: clase renombrada `FoundryTubeApp` → `NovaRedLiveApp`
- `scripts/main.js`: título de ventana `"Tube"` → `"Live Player"`, título del botón `"Tube Player"` → `"Live Player"`
- `scripts/main.js`: `getSceneControlButtons` — botón ahora visible solo para GMs (`if (!game.user.isGM) return;`)
- `module.json`: versión → `0.0.3`

### Créditos
- Módulo original: **foundry-tube** por [shrade](https://github.com/shradee)

## [0.0.2] — 2026-06-03

### Cambiado
- `module.json`: compatibilidad → mínimo `12`, verificado `12.331`; versión → `0.0.2`
- `scripts/main.js`: migrado de API v13 (`ApplicationV2` / `HandlebarsApplicationMixin`) a v12 (`Application`):
  - `static DEFAULT_OPTIONS` → `static get defaultOptions()` con `foundry.utils.mergeObject`
  - `static PARTS` eliminado; `template` string en `defaultOptions`
  - `_prepareContext(options)` → `getData()` síncrono
  - `_onRender(context, options)` → `activateListeners(html)` con `super.activateListeners(html)`
  - `render({ force: true })` → `render(true)` (×3)
  - `this.element.querySelector()` → `this.element[0].querySelector()` (×22)
  - `this.element.closest()` → `this.element[0].closest()`
  - `this.element.style` → `this.element[0].style` (×5)
  - `this.element.classList` → `this.element[0].classList` (×2)
  - `this.element.offsetWidth` / `.offsetHeight` → `this.element[0].offsetWidth` / `.offsetHeight`
  - `if (this.element)` → `if (this.element[0])`
  - `tubeApp.element` → `tubeApp.element[0]` (×4)
  - `app.element` → `app.element[0]` (×5)

### Corregido
- Manejador `syncShuffle` usaba `p.isLooping` en vez de `p.isShuffling` (preexistente)

### Créditos
- Módulo original: **foundry-tube** por [shrade](https://github.com/shradee)

## [0.0.1] — 2026-06-03

### Añadido
- Fork de **foundry-tube** v1.4.1 por [shrade](https://github.com/shradee)
- `LICENSE` — Licencia MIT con atribución al trabajo original
- `CHANGELOG.md` — Registro de cambios bilingüe (EN/ES)
- `README.md` — Documentación en inglés
- `README.es.md` — Documentación en español
- `languages/es.json` — Localización al español
- `.github/workflows/release-validate.yml` — Pipeline CI/CD

### Cambiado
- `module.json`: id → `nova-red-live`, title → `Nova-Red Live`, version → `0.0.1`, autores actualizados, URLs apuntan al nuevo repositorio

### Créditos
- Módulo original: **foundry-tube** por [shrade](https://github.com/shradee)
