// DolaBypass main-world bridge: keeps Seedance duration engine dynamic (1-60s)
(() => {
  'use strict';
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.source !== 'RBSHINKO_EXTENSION' || data.type !== 'RBSHINKO_SET_SEEDANCE_DURATION') return;
    const duration = Math.round(Number(data.duration));
    if (isNaN(duration) || duration < 1 || duration > 300) return;
    window.dispatchEvent(new CustomEvent('DOLA_SET_SEEDANCE_CONFIG', {
      detail: { duration, enabled: data.enabled !== false }
    }));
  });
})();
