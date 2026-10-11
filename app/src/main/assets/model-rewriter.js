/* DolaBypass Model 1.0 -> 2.5 Deep Request Rewriter & Network Inspector. MAIN world. */
(() => {
  'use strict';
  if (window.__DOLABYPASS_MODEL_REWRITER__) return;
  window.__DOLABYPASS_MODEL_REWRITER__ = true;

  console.log('%c[DolaBypass] ⚡ Model Rewriter (Seedance 1.0 -> 2.5) активен!', 'background: #7c3aed; color: #fff; font-weight: bold; padding: 3px 8px; border-radius: 4px;');

  window.__DOLABYPASS_REQUESTS_LOG__ = [];

  // Floating On-Screen Toast Notification
  function showBypassToast(msg, isSuccess = true) {
    try {
      let toast = document.getElementById('dola-bypass-model-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'dola-bypass-model-toast';
        toast.style.cssText = `
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999999;
          background: rgba(15, 10, 28, 0.94);
          border: 1px solid ${isSuccess ? '#10b981' : '#a855f7'};
          box-shadow: 0 10px 30px rgba(0,0,0,0.6), 0 0 20px ${isSuccess ? 'rgba(16,185,129,0.4)' : 'rgba(168,85,247,0.4)'};
          color: #f8fafc;
          padding: 12px 18px;
          border-radius: 14px;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 13px;
          font-weight: 600;
          backdrop-filter: blur(16px);
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.35s ease;
          pointer-events: none;
        `;
        (document.body || document.documentElement).appendChild(toast);
      }
      toast.innerHTML = `<span style="font-size: 18px;">${isSuccess ? '🚀' : '⚡'}</span> <span>${msg}</span>`;
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0) scale(1)';
      clearTimeout(toast.__timer);
      toast.__timer = setTimeout(() => {
        if (toast) {
          toast.style.opacity = '0';
          toast.style.transform = 'translateY(12px) scale(0.96)';
        }
      }, 5000);
    } catch (_) {}
  }

  // Model substitution logic: target 1.0, 1.0-pro, 1.0-fast, v1, bare seedance, etc.
  function rewriteModelString(val) {
    if (typeof val !== 'string') return val;

    let next = val;

    // 1. Exact string matches
    if (val === 'seedance' || val === 'seedance_v1' || val === 'seedance-1' || val === 'seedance_1' || val === 'seedance-1.0' || val === 'seedance_1.0' || val === 'seedance1.0' || val === 'seedance1' || val === 'seedance-1-0') {
      return 'seedance-2.5';
    }
    if (val === 'dreamina-seedance' || val === 'dreamina_seedance' || val === 'dreamina-seedance-1.0' || val === 'dreamina_seedance_1.0' || val === 'dreamina-seedance-1' || val === 'dreamina_seedance_1') {
      return 'seedance-2.5';
    }

    // 2. Regex replacements for compound identifiers
    // e.g. seedance-1.0-fast, seedance-1.0-pro, seedance_1.0
    if (/seedance[-_]?1(?:[\._0]+)?/i.test(next) || /seedance[-_]?v1(?:[\._0]+)?/i.test(next)) {
      next = next.replace(/seedance[-_]?(?:v)?1(?:[\._0]+)?(?:[-_](?:fast|pro|mini))?/gi, 'seedance-2.5');
    }

    // 3. Dreamina Seedance 1.0 (human readable)
    if (/Dreamina\s+Seedance\s+1(?:\.0)?/i.test(next)) {
      next = next.replace(/Dreamina\s+Seedance\s+1(?:\.0)?/gi, 'Dreamina Seedance 2.5');
    }
    if (/Seedance\s+1(?:\.0)?/i.test(next)) {
      next = next.replace(/Seedance\s+1(?:\.0)?/gi, 'Seedance 2.5');
    }

    // 4. Fallback for bare "seedance" in model context (when not already 2.0 or 2.5)
    if (/^seedance$/i.test(next)) {
      next = 'seedance-2.5';
    }

    return next;
  }

  function rewriteModelInObject(obj) {
    if (!obj || typeof obj !== 'object') return false;
    let modified = false;
    const seen = new WeakSet();

    function walk(node, depth) {
      if (!node || typeof node !== 'object' || depth > 12 || seen.has(node)) return;
      seen.add(node);

      for (const key of Object.keys(node)) {
        const val = node[key];
        const lowerKey = key.toLowerCase();

        if (typeof val === 'string') {
          const isModelKey = /^(model|model_name|model_id|model_version|model_type|video_model|base_model|engine|algorithm|version_id|model_tag|sub_model|model_code|version|model_key|video_model_version)$/i.test(lowerKey);

          if (isModelKey) {
            // Version values like "1.0", "1", "v1.0"
            if (/^v?1(?:\.0)?$/i.test(val.trim())) {
              console.log(`%c[DolaBypass] 🔥 Подмена ${key}: "${val}" -> "2.5"`, 'color: #10b981; font-weight: bold;');
              node[key] = '2.5';
              modified = true;
              showBypassToast(`Подмена модели: ${key} ➔ 2.5`, true);
              continue;
            }
            // If the model key simply contains "seedance" or "seedance-1..."
            if (/seedance/i.test(val) && !/2\.0|2\.5|2_5/i.test(val)) {
              console.log(`%c[DolaBypass] 🔥 Подмена ${key}: "${val}" -> "seedance-2.5"`, 'color: #10b981; font-weight: bold;');
              node[key] = 'seedance-2.5';
              modified = true;
              showBypassToast(`Подмена модели: "${val}" ➔ "seedance-2.5"`, true);
              continue;
            }
          }

          const rewritten = rewriteModelString(val);
          if (rewritten !== val) {
            console.log(`%c[DolaBypass] 🔥 Подмена значения "${val}" -> "${rewritten}" (ключ: ${key})`, 'color: #10b981; font-weight: bold;');
            node[key] = rewritten;
            modified = true;
            showBypassToast(`Подмена модели: "${val}" ➔ "${rewritten}"`, true);
          }
        } else if (typeof val === 'number') {
          if (/^(model_version|version)$/i.test(lowerKey) && val === 1) {
            console.log(`%c[DolaBypass] 🔥 Подмена ${key}: 1 -> 2.5`, 'color: #10b981; font-weight: bold;');
            node[key] = 2.5;
            modified = true;
            showBypassToast(`Подмена версии модели: 1 ➔ 2.5`, true);
          }
        } else if (typeof val === 'object' && val !== null) {
          walk(val, depth + 1);
        }
      }
    }

    walk(obj, 0);
    return modified;
  }

  function rewritePayloadString(body, url = '') {
    if (typeof body !== 'string' || !body.trim()) return body;

    let json;
    try {
      json = JSON.parse(body);
    } catch (_) {
      const rewritten = rewriteModelString(body);
      if (rewritten !== body) {
        showBypassToast('Подмена модели в текстовом запросе ➔ Seedance 2.5', true);
      }
      return rewritten;
    }

    const modified = rewriteModelInObject(json);

    if (modified) {
      window.__DOLABYPASS_LAST_INTERCEPTED_REQUEST__ = {
        url,
        time: new Date().toISOString(),
        payload: json
      };
      window.__DOLABYPASS_REQUESTS_LOG__.push(window.__DOLABYPASS_LAST_INTERCEPTED_REQUEST__);
      return JSON.stringify(json);
    }

    // Secondary fallback: if raw json has seedance without 2.5/2.0
    if (/seedance/i.test(body) && !/seedance[-_]?2/i.test(body)) {
      const replaced = rewriteModelString(body);
      if (replaced !== body) {
        try {
          JSON.parse(replaced);
          showBypassToast('Подмена модели в JSON строке ➔ Seedance 2.5', true);
          return replaced;
        } catch (_) {}
      }
    }

    return body;
  }

  function rewriteUrl(url) {
    if (typeof url !== 'string') return url;
    if (/seedance/i.test(url) && !/seedance[-_]?2/i.test(url)) {
      return rewriteModelString(url);
    }
    return url;
  }

  // Hook window.fetch
  const originalFetch = window.fetch;
  if (originalFetch) {
    const wrappedFetch = async function(input, init) {
      try {
        let url = typeof input === 'string' ? input : input?.url || '';
        const rewrittenUrl = rewriteUrl(url);
        if (rewrittenUrl !== url) {
          if (typeof input === 'string') input = rewrittenUrl;
        }

        const isApiOrChat = /chat|message|video|generate|create|task|completion|conversation|seedance/i.test(url);

        if (init && typeof init.body === 'string') {
          const rewritten = rewritePayloadString(init.body, url);
          if (rewritten !== init.body) {
            init = { ...init, body: rewritten };
          }
        } else if (init && typeof FormData !== 'undefined' && init.body instanceof FormData) {
          for (const [k, v] of Array.from(init.body.entries())) {
            if (typeof v === 'string') {
              const rewritten = rewriteModelString(v);
              if (rewritten !== v) {
                init.body.set(k, rewritten);
                showBypassToast(`FormData [${k}] ➔ ${rewritten}`, true);
              }
            }
          }
        } else if (init && typeof URLSearchParams !== 'undefined' && init.body instanceof URLSearchParams) {
          for (const [k, v] of Array.from(init.body.entries())) {
            const rewritten = rewriteModelString(v);
            if (rewritten !== v) {
              init.body.set(k, rewritten);
              showBypassToast(`URLSearchParams [${k}] ➔ ${rewritten}`, true);
            }
          }
        } else if (init && typeof Uint8Array !== 'undefined' && init.body instanceof Uint8Array) {
          try {
            const decoded = new TextDecoder().decode(init.body);
            const rewritten = rewritePayloadString(decoded, url);
            if (rewritten !== decoded) {
              init.body = new TextEncoder().encode(rewritten);
              showBypassToast('Бинарный Uint8Array запрос ➔ Seedance 2.5', true);
            }
          } catch (_) {}
        } else if (typeof Request !== 'undefined' && input instanceof Request && !init && /POST|PUT|PATCH/i.test(input.method)) {
          const ct = input.headers.get('content-type') || '';
          if (/json/i.test(ct)) {
            const raw = await input.clone().text();
            const rewritten = rewritePayloadString(raw, url);
            if (rewritten !== raw) {
              input = new Request(input, { body: rewritten });
              showBypassToast('Request payload ➔ Seedance 2.5', true);
            }
          }
        }

        if (isApiOrChat && init?.body && typeof init.body === 'string') {
          console.log(`[DolaBypass Network Trace] ${url}`, init.body.slice(0, 300));
        }
      } catch (e) {
        console.warn('[DolaBypass Model Rewriter] fetch hook warn:', e);
      }
      return originalFetch.call(this, input, init);
    };
    wrappedFetch.__dolaModelWrapped = true;
    window.fetch = wrappedFetch;
  }

  // Hook XMLHttpRequest
  const originalXhrSend = XMLHttpRequest?.prototype?.send;
  const originalXhrOpen = XMLHttpRequest?.prototype?.open;
  if (originalXhrOpen) {
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      try {
        this.__dolaUrl = String(url || '');
        const rewrittenUrl = rewriteUrl(url);
        if (rewrittenUrl !== url) url = rewrittenUrl;
      } catch (_) {}
      return originalXhrOpen.call(this, method, url, ...args);
    };
  }

  if (originalXhrSend) {
    XMLHttpRequest.prototype.send = function(body) {
      try {
        if (typeof body === 'string') {
          body = rewritePayloadString(body, this.__dolaUrl || '');
        } else if (typeof FormData !== 'undefined' && body instanceof FormData) {
          for (const [k, v] of Array.from(body.entries())) {
            if (typeof v === 'string') {
              const rewritten = rewriteModelString(v);
              if (rewritten !== v) body.set(k, rewritten);
            }
          }
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
          data = rewritePayloadString(data, 'wss://dola-websocket');
        }
      } catch (e) {}
      return originalWsSend.call(this, data);
    };
  }
})();
