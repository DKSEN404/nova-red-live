import { MODULE_ID } from './constants.mjs';

const SOCKET_EVENT = `module.${MODULE_ID}`;
const ACTION_REQ = 'proxy-req';
const ACTION_RES = 'proxy-res';
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

    console.log(`${MODULE_ID} | PipedProxy.init() — listening on "${SOCKET_EVENT}"`);

    game.socket.on(SOCKET_EVENT, (data) => {
      if (data.action === ACTION_REQ) {
        PipedProxy._handleRequest(data);
      } else if (data.action === ACTION_RES) {
        PipedProxy._handleResponse(data);
      }
    });
  }

  static async _handleRequest(data) {
    if (typeof window !== 'undefined') return;
    const { requestId, url } = data;
    console.log(`${MODULE_ID} | PipedProxy SERVER processing requestId=${requestId} url=${url}`);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`${MODULE_ID} | PipedProxy SERVER HTTP ${res.status} for ${url}`);
        game.socket.emit(SOCKET_EVENT, { action: ACTION_RES, requestId, error: `HTTP ${res.status}` });
        return;
      }
      const result = await res.json();
      console.log(`${MODULE_ID} | PipedProxy SERVER OK requestId=${requestId}`);
      game.socket.emit(SOCKET_EVENT, { action: ACTION_RES, requestId, result });
    } catch (err) {
      console.warn(`${MODULE_ID} | PipedProxy SERVER error for ${url}: ${err.message}`);
      game.socket.emit(SOCKET_EVENT, { action: ACTION_RES, requestId, error: err.message });
    }
  }

  static _handleResponse(data) {
    const entry = pending.get(data.requestId);
    if (!entry) return;
    pending.delete(data.requestId);
    clearTimeout(entry.timer);
    if (data.error) {
      console.warn(`${MODULE_ID} | PipedProxy response error requestId=${data.requestId}: ${data.error}`);
      entry.reject(new Error(data.error));
    } else {
      console.log(`${MODULE_ID} | PipedProxy response OK requestId=${data.requestId}`);
      entry.resolve(data.result);
    }
  }

  static proxyFetch(url) {
    return new Promise((resolve, reject) => {
      const requestId = uid();
      const timer = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error('Proxy timeout'));
      }, TIMEOUT_MS);
      pending.set(requestId, { resolve, reject, timer });
      try {
        game.socket.emit(SOCKET_EVENT, { action: ACTION_REQ, requestId, url });
        console.log(`${MODULE_ID} | PipedProxy emitted requestId=${requestId} url=${url}`);
      } catch (err) {
        clearTimeout(timer);
        pending.delete(requestId);
        console.warn(`${MODULE_ID} | PipedProxy emit failed: ${err.message}`);
        reject(err);
      }
    });
  }
}
