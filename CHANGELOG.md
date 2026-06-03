# Changelog — Nova-Red Live

All notable changes to this project will be documented in this file.

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
