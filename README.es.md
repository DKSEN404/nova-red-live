# Nova-Red Live

![Versión](https://img.shields.io/badge/version-1.1.0-ffb000?style=flat-square)

> Reproductor de YouTube compacto y sincronizado para Foundry VTT con soporte de playlists, búsqueda y presets.
> Fork de [foundry-tube](https://github.com/shradee/foundry-tube) por [shrade](https://github.com/shradee).

---

## Instalación

1. En Foundry VTT, ve a **Add-on Modules** → **Install Module**
2. Pega la URL del manifiesto:

```
https://github.com/DKSEN404/nova-red-live/releases/latest/download/module.json
```

3. Haz clic en **Install**
4. Activa el módulo en tu mundo en **Manage Modules**

---

## Características

- **5 canales independientes** — Cada uno con su propia playlist, loop, shuffle y modo de entrada
- **Reproducción de YouTube** — Impulsado por la API oficial de YouTube IFrame Player
- **Sincronización en tiempo real** — Los controles del GM se sincronizan a todos los jugadores vía sockets
- **Gestión de playlists** — Importa playlists de YouTube, administra pistas individuales, reordena con arrastrar y soltar
- **Búsqueda** — Busca en YouTube directamente desde el reproductor
- **Presets** — Guarda y carga playlists con nombre como presets (alcance del mundo)
- **Autoridad del GM** — Solo el Director de Juego controla la reproducción; los jugadores reciben estado sincronizado

---

## Controles

| Control | GM | Jugador |
|---------|----|---------|
| Reproducir / Pausa | ✅ | ❌ (solo sincronía) |
| Pista anterior / siguiente | ✅ | ❌ |
| Activar/desactivar loop | ✅ | ❌ |
| Activar/desactivar shuffle | ✅ | ❌ |
| Volumen | ✅ (afecta a todos) | ✅ (solo local) |
| Importar playlist / video | ✅ | ❌ |
| Buscar en YouTube | ✅ | ❌ |
| Guardar / Cargar presets | ✅ | ❌ |
| Solicitar sincronización manual | ✅ | ✅ |
| Reordenar con arrastrar y soltar | ✅ | ❌ |

---

## Configuración

Abre el reproductor mediante el botón **Tube Player** en la barra de controles de tokens, o usa la API del módulo:

```javascript
game.modules.get('nova-red-live').api.open();
```

### Ajustes

| Ajuste | Alcance | Default | Descripción |
|--------|---------|---------|-------------|
| Auto-reproducción al inicio | Cliente | false | Reproduce automáticamente el último video activo al cargar el mundo |
| Ocultar al inicio | Cliente | true | Oculta la ventana del reproductor al cargar el mundo |
| Activar transparencia | Cliente | true | Permite que la ventana del reproductor sea transparente |
| Opacidad minimizado | Cliente | 50% | Opacidad cuando la ventana del reproductor está minimizada |

---

## Changelog

Consulta [CHANGELOG.md](CHANGELOG.md) para el historial de versiones.

---

## Licencia

Licencia MIT — Copyright (c) 2026 DKSEN404

Trabajo original **foundry-tube** Copyright (c) 2026 shrade. Consulta [LICENSE](LICENSE) para más detalles.

---

## Créditos

- **shrade** — Creador de [foundry-tube](https://github.com/shradee/foundry-tube), el módulo original en el que se basa este fork
- **YouTube** — IFrame Player API
