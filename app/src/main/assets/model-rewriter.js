/* DolaBypass Model 1.0 -> 2.5 Dynamic Request Rewriter. MAIN world. */
(() => {
  'use strict';
  if (window.__DOLABYPASS_MODEL_REWRITER__) return;
  window.__DOLABYPASS_MODEL_REWRITER__ = true;

  console.log('[DolaBypass] ⚡ Model Rewriter (Seedance 1.0 -> 2.5) активен');

  // Comprehensive model substitution mapping & logic
  function rewriteModelString(val) {
    if (typeof val !== 'string') return val;

    let next = val;

    // Pattern 1: Seedance 1.0 / 1 / 1_0 identifiers
    next = next.replace(/\bseedance[-_]?1(?:[\._0]+)?\b/gi, match => {
      if (match.includes('_0') || match.includes('_1_')) return 'seedance_2_5';
      if (match.includes('-')) return 'seedance-2.5';
      return 'seedance_2.5';
    });

    // Pattern 2: Dreamina Seedance 1.0
    next = next.replace(/\bdreamina[-_]?seedance[-_]?1(?:[\._0]+)?\b/gi, 'dreamina_seedance_2.5');
    next = next.replace(/\bDreamina\s+Seedance\s+1(?:\.0)?\b/gi, 'Dreamina Seedance 2.5');
    next = next.replace(/\bSeedance\s+1(?:\.0)?\b/gi, 'Seedance 2.5');

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
          // Check if key is a model indicator
          const isModelKey = /^(model|model_name|model_id|model_version|model_type|video_model|base_model|engine|algorithm|version_id|model_tag|sub_model)$/i.test(lowerKey);

          if (isModelKey) {
            if (/^1(?:\.0)?$/i.test(val) || /^v?1(?:[\._0]+)?$/i.test(val)) {
              console.log(`[DolaBypass Model Bypass] 🔥 Подмена ${key}: "${val}" -> "2.5"`);
              node[key] = '2.5';
              modified = true;
              continue;
            }
          }

          const rewritten = rewriteModelString(val);
          if (rewritten !== val) {
            console.log(`[DolaBypass Model Bypass] 🔥 Подмена модели "${val}" -> "${rewritten}"`);
            node[key] = rewritten;
            modified = true;
          }
        } else if (typeof val === 'number') {
          // If key is model_version and number is 1, change to 2.5
          if (/^(model_version)$/i.test(lowerKey) && val === 1) {
            console.log(`[DolaBypass Model Bypass] 🔥 Подмена ${key}: 1 -> 2.5`);
            node[key] = 2.5;
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
      // Fallback text string replacements
      return rewriteModelString(body);
    }

    if (rewriteModelInObject(json)) {
      return JSON.stringify(json);
    }

    // Also do fallback text regex check on JSON string if not caught by walker
    if (/seedance[-_]?1/i.test(body) || /Seedance\s+1/i.test(body)) {
      const replaced = rewriteModelString(body);
      if (replaced !== body) {
        try {
          JSON.parse(replaced); // Verify still valid JSON
          return replaced;
        } catch (_) {}
      }
    }

    return body;
  }

  function rewriteUrl(url) {
    if (typeof url !== 'string') return url;
    if (/seedance[-_]?1/i.test(url)) {
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

        if (init && typeof init.body === 'string') {
          const rewritten = rewritePayloadString(init.body);
          if (rewritten !== init.body) {
            init = { ...init, body: rewritten };
          }
        } else if (init && typeof FormData !== 'undefined' && init.body instanceof FormData) {
          for (const [k, v] of Array.from(init.body.entries())) {
            if (typeof v === 'string') {
              const rewritten = rewriteModelString(v);
              if (rewritten !== v) {
                init.body.set(k, rewritten);
                console.log(`[DolaBypass Model Bypass] 🔥 FormData [${k}]: "${v}" -> "${rewritten}"`);
              }
            }
          }
        } else if (init && typeof URLSearchParams !== 'undefined' && init.body instanceof URLSearchParams) {
          for (const [k, v] of Array.from(init.body.entries())) {
            const rewritten = rewriteModelString(v);
            if (rewritten !== v) {
              init.body.set(k, rewritten);
              console.log(`[DolaBypass Model Bypass] 🔥 URLSearchParams [${k}]: "${v}" -> "${rewritten}"`);
            }
          }
        } else if (typeof Request !== 'undefined' && input instanceof Request && !init && /POST|PUT|PATCH/i.test(input.method)) {
          const ct = input.headers.get('content-type') || '';
          if (/json/i.test(ct)) {
            const raw = await input.clone().text();
            const rewritten = rewritePayloadString(raw);
            if (rewritten !== raw) {
              input = new Request(input, { body: rewritten });
              console.log('[DolaBypass Model Bypass] 🔥 Request object payload rewritten to 2.5');
            }
          }
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
          body = rewritePayloadString(body);
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
          data = rewritePayloadString(data);
        }
      } catch (e) {}
      return originalWsSend.call(this, data);
    };
  }
})();
