/* DolaBypass Model 1.0 -> 2.5 Dynamic Request Rewriter. MAIN world. */
(() => {
  'use strict';
  if (window.__DOLABYPASS_MODEL_REWRITER__) return;
  window.__DOLABYPASS_MODEL_REWRITER__ = true;

  console.log('[DolaBypass] ⚡ Model Rewriter (Seedance 1.0 -> 2.5) активен');

  // Detect and rewrite model identifier from 1.0 to 2.5 in generation requests
  function rewriteModelInObject(obj) {
    if (!obj || typeof obj !== 'object') return false;
    let modified = false;
    let seen = new WeakSet();

    function walk(node, depth) {
      if (!node || typeof node !== 'object' || depth > 10 || seen.has(node)) return;
      seen.add(node);

      for (const key of Object.keys(node)) {
        const val = node[key];
        if (typeof val === 'string') {
          // Check for Seedance 1.0 / v1.0 identifiers and upgrade to 2.5
          if (/seedance[-_]?1[\._0]*/i.test(val) || /dreamina[-_]?1[\._0]*/i.test(val) || val === 'seedance_v1' || val === 'seedance_1') {
            console.log(`[DolaBypass Model Bypass] 🔥 Подмена модели ${val} -> seedance_2_5!`);
            node[key] = val.replace(/1[\._0]*/i, '2.5');
            modified = true;
          }
        } else if (typeof val === 'object' && val !== null) {
          walk(val, depth + 1);
        }
      }
    }

    walk(obj, 0);
    return modified;
  }

  function rewritePayloadString(body) {
    if (typeof body !== 'string' || !body.trim()) return body;
    let json;
    try {
      json = JSON.parse(body);
    } catch (_) {
      // String regex replacement as fallback
      if (body.includes('seedance_1') || body.includes('seedance-1') || body.includes('Seedance 1.0')) {
        return body.replace(/seedance[-_]?1(?:\.0)?/gi, 'seedance_2_5');
      }
      return body;
    }

    if (rewriteModelInObject(json)) {
      return JSON.stringify(json);
    }
    return body;
  }

  // Hook window.fetch
  const originalFetch = window.fetch;
  if (originalFetch) {
    window.fetch = async function(input, init) {
      try {
        if (init && typeof init.body === 'string') {
          const rewritten = rewritePayloadString(init.body);
          if (rewritten !== init.body) {
            init = { ...init, body: rewritten };
          }
        }
      } catch (e) {}
      return originalFetch.call(this, input, init);
    };
  }

  // Hook XMLHttpRequest
  const originalXhrSend = XMLHttpRequest?.prototype?.send;
  if (originalXhrSend) {
    XMLHttpRequest.prototype.send = function(body) {
      try {
        if (typeof body === 'string') {
          body = rewritePayloadString(body);
        }
      } catch (e) {}
      return originalXhrSend.call(this, body);
    };
  }

  // Hook WebSocket
  const originalWsSend = window.WebSocket?.prototype?.send;
  if (originalWsSend) {
    window.WebSocket.prototype.send = function(data) {
      try {
        if (typeof data === 'string') {
          data = rewritePayloadString(data);
        }
      } catch (e) {}
      return originalWsSend.call(this, data);
    };
  }
})();
