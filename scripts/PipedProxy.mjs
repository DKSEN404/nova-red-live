import { MODULE_ID } from './constants.mjs';

const SOCKET_NS = `module.${MODULE_ID}`;
const EVT_REQUEST = `${SOCKET_NS}.piped-proxy`;
const EVT_RESPONSE = `${SOCKET_NS}.piped-proxy-response`;
const TIMEOUT_MS = 15000;

const pending = new Map();
let counter = 0;

function uid() {
  return `${MODULE_ID}_proxy_${counter++}_${Date.now()}`;
}

let initialized = false;

export class PipedProxy {
  static init() {
    if (initialized) return;
    initialized = true;

    game.socket.on(EVT_REQUEST, async (data) => {
      if (typeof window !== 'undefined') return;
      const { requestId, url } = data;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          game.socket.emit(EVT_RESPONSE, { requestId, error: `HTTP ${res.status}`, result: null });
          return;
        }
        const result = await res.json();
        game.socket.emit(EVT_RESPONSE, { requestId, error: null, result });
      } catch (err) {
        game.socket.emit(EVT_RESPONSE, { requestId, error: err.message, result: null });
      }
    });

    game.socket.on(EVT_RESPONSE, (data) => {
      const entry = pending.get(data.requestId);
      if (!entry) return;
      pending.delete(data.requestId);
      clearTimeout(entry.timer);
      if (data.error) {
        entry.reject(new Error(data.error));
      } else {
        entry.resolve(data.result);
      }
    });
  }

  static proxyFetch(url) {
    return new Promise((resolve, reject) => {
      const requestId = uid();
      const timer = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error('Proxy timeout'));
      }, TIMEOUT_MS);
      pending.set(requestId, { resolve, reject, timer });
      game.socket.emit(EVT_REQUEST, { requestId, url });
    });
  }
}
