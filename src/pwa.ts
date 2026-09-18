interface InstallEvent extends Event { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> }
export function setupPwa(isPlaying: () => boolean, stop: () => void) {
  let ready = false;
  let waiting: ServiceWorker | null = null;
  let install: InstallEvent | null = null;
  let updating = false;
  const refresh = () => {
    const status = document.querySelector('#offline-status span');
    if (status) status.textContent = ready ? (navigator.onLine ? 'Gotowy offline' : 'Tryb offline') : import.meta.env.DEV ? 'Tryb lokalny' : 'Przygotowanie offline';
    const button = document.querySelector<HTMLButtonElement>('#install'); if (button) button.hidden = !install;
    const update = document.querySelector<HTMLButtonElement>('#update'); if (update) update.hidden = !waiting;
  };
  document.addEventListener('app-render', refresh);
  window.addEventListener('online', refresh); window.addEventListener('offline', refresh);
  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); install = event as InstallEvent; refresh(); });
  window.addEventListener('appinstalled', () => { install = null; refresh(); });
  document.addEventListener('click', async event => {
    const button = (event.target as HTMLElement).closest('button');
    if (button?.id === 'install' && install) { await install.prompt(); await install.userChoice; install = null; refresh(); }
    if (button?.id === 'update' && waiting) {
      if (isPlaying()) {
        document.querySelector('#message')!.textContent = 'Zatrzymaj odtwarzanie, aby bezpiecznie zainstalować nową wersję.'; return;
      }
      stop(); updating = true; waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  });
  refresh();
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (updating) location.reload(); });
  void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then(registration => {
    waiting = registration.waiting; refresh();
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) { waiting = registration.waiting; refresh(); }
      });
    });
    return navigator.serviceWorker.ready;
  }).then(() => { ready = true; refresh(); }).catch(() => {
    const status = document.querySelector('#offline-status span'); if (status) status.textContent = 'Offline niedostępny';
  });
}
