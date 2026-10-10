// Rbshinko main-world bridge. Keeps the existing Seedance duration engine intact.
(() => {
  const VALID = new Set([10, 15, 20, 25, 30, 60, 180, 300]);
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.source !== 'RBSHINKO_EXTENSION' || data.type !== 'RBSHINKO_SET_SEEDANCE_DURATION') return;
    const duration = Number(data.duration);
    if (!VALID.has(duration)) return;
    window.dispatchEvent(new CustomEvent('DOLA_SET_SEEDANCE_CONFIG', {
      detail: { duration, enabled: data.enabled !== false }
    }));
  });
})();
