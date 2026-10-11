// DolaBypass duration bridge: forwards popup duration into the page's main-world controller.
(() => {
  'use strict';
  const STORAGE_KEY = 'rbshinko_selected_duration';

  function normalize(value) {
    const n = Math.round(Number(value));
    if (isNaN(n) || n < 1) return 1;
    if (n > 60) return 60;
    return n;
  }

  function forward(duration) {
    const value = normalize(duration);
    window.postMessage({
      source: 'RBSHINKO_EXTENSION',
      type: 'RBSHINKO_SET_SEEDANCE_DURATION',
      duration: value,
      enabled: true
    }, '*');
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || message.type !== 'RBSHINKO_SET_DURATION') return;
    const duration = normalize(message.duration);
    try {
      localStorage.setItem(STORAGE_KEY, String(duration));
    } catch (_) {}
    forward(duration);
    sendResponse?.({ success: true, duration });
  });

  // Restore the last popup selection whenever a Dola tab loads/reloads.
  try {
    const stored = normalize(localStorage.getItem(STORAGE_KEY));
    forward(stored);
  } catch (_) {
    forward(30);
  }
})();
