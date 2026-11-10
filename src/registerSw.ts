export const registerSw = (env: { PROD: boolean } = import.meta.env) => {
  if (!env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => undefined);
  });
};
