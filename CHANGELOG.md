# Changelog — Nova-Red Live

All notable changes to this project will be documented in this file.

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
