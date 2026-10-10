/* =========================================================================
   DolaBypass Mobile HUD & Duration Enforcer
   Author: By Fikus
   Runs inside Android WebView:
   1. Constantly enforces 30s duration without flickering back to 10s.
   2. Renders floating Liquid Glass Settings Pill (open settings / switch 10s, 15s, 30s, 60s).
   ========================================================================= */

(() => {
  if (window.__DOLABYPASS_MOBILE_HUD_INITIALIZED) return;
  window.__DOLABYPASS_MOBILE_HUD_INITIALIZED = true;

  console.log('[DolaBypass Mobile] ⚡ Mobile HUD & Continuous 30s Enforcer активен');

  let currentDuration = 30;
  try {
    const saved = localStorage.getItem('rbshinko_selected_duration');
    if (saved && [10, 15, 20, 25, 30, 60, 180, 300].includes(Number(saved))) {
      currentDuration = Number(saved);
    }
  } catch (_) {}

  // 1. Force duration continuously into main world and localStorage
  function enforceDuration(sec) {
    currentDuration = sec;
    try {
      localStorage.setItem('rbshinko_selected_duration', String(sec));
    } catch (_) {}

    // Dispatch custom events directly for inject.js and page bridge
    window.dispatchEvent(new CustomEvent('DOLA_SET_SEEDANCE_CONFIG', {
      detail: { duration: sec, enabled: true }
    }));
    window.postMessage({
      source: 'RBSHINKO_EXTENSION',
      type: 'RBSHINKO_SET_SEEDANCE_DURATION',
      duration: sec,
      enabled: true
    }, '*');
  }

  // Enforce on start and keep polling so React doesn't overwrite it with 10s
  enforceDuration(currentDuration);
  setInterval(() => {
    enforceDuration(currentDuration);
    updateDolaButtonText();
  }, 1000);

  // 2. Fix the visual flickering on the button ("10s" -> "30s (DolaBypass Mode)")
  function updateDolaButtonText() {
    const hud = document.getElementById('dolabypass-mobile-hud');
    const candidates = document.querySelectorAll('button, div[role="button"], span, div');
    const targetLabel = `${currentDuration}s (DolaBypass Mode)`;

    for (const el of candidates) {
      if (!el || el.children.length > 0) continue;
      // DO NOT touch our own HUD elements!
      if (hud && hud.contains(el)) continue;

      const txt = (el.textContent || '').trim();
      if (!txt) continue;

      // Check if it's the duration button on Dola's dock
      const isDuration = /^(?:Авто\s*·\s*)?(?:5|10|15|20|25|30|60)\s*(?:s|с|с\.)(?:\s*\(.*?\))?$/iu.test(txt);
      if (isDuration) {
        const isControl = el.closest('button, [role="button"], [class*="dock"], [class*="bar"], [class*="footer"], [class*="control"], form');
        if (isControl && el.textContent.trim() !== targetLabel) {
          el.textContent = targetLabel;
          el.style.color = '#c084fc';
          el.style.fontWeight = '700';
          el.style.textShadow = '0 0 10px rgba(168, 85, 247, 0.4)';
        }
      }
    }
  }

  // 3. Inject Floating Liquid Glass Mobile HUD & Settings Menu
  function injectMobileHUD() {
    if (document.getElementById('dolabypass-mobile-hud')) return;

    const hud = document.createElement('div');
    hud.id = 'dolabypass-mobile-hud';
    hud.style.cssText = `
      position: fixed !important;
      bottom: 18px !important;
      left: 14px !important;
      z-index: 2147483645 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      user-select: none !important;
    `;

    hud.innerHTML = `
      <style>
        #dolabypass-hud-btn {
          background: rgba(18, 14, 30, 0.88);
          border: 1px solid rgba(192, 132, 252, 0.45);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 9999px;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 12px 32px rgba(0,0,0,0.7), 0 0 20px rgba(168, 85, 247, 0.35);
          cursor: pointer;
        }
        #dolabypass-hud-btn:active {
          transform: scale(0.96);
        }
        #dolabypass-hud-modal {
          position: fixed;
          bottom: 70px;
          left: 14px;
          right: 14px;
          max-width: 320px;
          background: rgba(16, 12, 28, 0.96);
          border: 1px solid rgba(192, 132, 252, 0.45);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border-radius: 20px;
          padding: 16px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.25);
          display: none;
          flex-direction: column;
          gap: 12px;
          color: #fff;
        }
        .dola-chip-btn {
          flex: 1;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          color: #e2e8f0;
          padding: 10px 4px;
          font-size: 11px;
          font-weight: 700;
          text-align: center;
          cursor: pointer;
          white-space: nowrap;
        }
        .dola-chip-btn.active {
          background: rgba(168, 85, 247, 0.35);
          border-color: #c084fc;
          color: #fff;
          font-weight: 700;
          box-shadow: 0 0 14px rgba(168, 85, 247, 0.4);
        }
        .dola-action-btn {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 10px;
          color: #f1f5f9;
          padding: 10px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
      </style>

      <div id="dolabypass-hud-btn">
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; box-shadow:0 0 8px #10b981;"></span>
        <span id="dolabypass-hud-label">Dola 30s By Fikus</span>
      </div>

      <div id="dolabypass-hud-modal">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:13px; font-weight:800; background:linear-gradient(135deg, #c084fc, #818cf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
            DolaBypass PRO
          </span>
          <span id="dolabypass-modal-close" style="font-size:16px; cursor:pointer; color:#94a3b8;">✕</span>
        </div>

        <div style="font-size:10px; color:#94a3b8; text-transform:uppercase; font-weight:700;">Длительность видео:</div>
        <div style="display:flex; gap:6px;">
          <div class="dola-chip-btn" data-sec="10">10 с</div>
          <div class="dola-chip-btn" data-sec="15">15 с</div>
          <div class="dola-chip-btn active" data-sec="30">30 с</div>
          <div class="dola-chip-btn" data-sec="60">60 с</div>
        </div>

        <div style="font-size:10px; color:#94a3b8; text-transform:uppercase; font-weight:700; margin-top:4px;">Быстрые действия:</div>
        <div class="dola-action-btn" id="btn-mobile-reset-session">
          Сбросить сессию (Новый аккаунт)
        </div>
        <div class="dola-action-btn" id="btn-mobile-reload" style="background:linear-gradient(135deg, #a855f7, #6366f1); border:none;">
          Применить и обновить страницу
        </div>
      </div>
    `;

    document.body.appendChild(hud);

    const btn = document.getElementById('dolabypass-hud-btn');
    const modal = document.getElementById('dolabypass-hud-modal');
    const close = document.getElementById('dolabypass-modal-close');
    const chips = modal.querySelectorAll('.dola-chip-btn');
    const hudLabel = document.getElementById('dolabypass-hud-label');

    btn.addEventListener('click', () => {
      modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
    });

    close.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const sec = Number(chip.getAttribute('data-sec')) || 30;
        enforceDuration(sec);
        hudLabel.textContent = `Dola ${sec}s By Fikus`;
        updateDolaButtonText();
      });
    });

    document.getElementById('btn-mobile-reset-session').addEventListener('click', () => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = 'https://dola.com';
    });

    document.getElementById('btn-mobile-reload').addEventListener('click', () => {
      window.location.reload();
    });
  }

  // Inject when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectMobileHUD);
  } else {
    injectMobileHUD();
  }
})();
