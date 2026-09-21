import { PREFERENCE_LANGUAGES, translateText, type Language } from './i18n';

export function setupPwa(isPlaying: () => boolean, stop: () => void) {
  let waiting: ServiceWorker | null = null;
  let updating = false;
  const text = (value: string) =>
    translateText(
      value,
      PREFERENCE_LANGUAGES.includes(document.documentElement.lang as Language)
        ? (document.documentElement.lang as Language)
        : 'en',
    );
  const refresh = () => {
    const update = document.querySelector<HTMLButtonElement>('#update');
    if (update) update.hidden = !waiting;
  };
  document.addEventListener('app-render', refresh);
  window.addEventListener('online', refresh);
  window.addEventListener('offline', refresh);
  document.addEventListener('click', async (event) => {
    const button = (event.target as HTMLElement).closest('button');
    if (button?.id === 'update' && waiting) {
      if (isPlaying()) {
        document.querySelector('#message')!.textContent = text(
          'Zatrzymaj odtwarzanie, aby bezpiecznie zainstalować nową wersję.',
        );
        return;
      }
      stop();
      updating = true;
      waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  });
  refresh();
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (updating) location.reload();
  });
  void navigator.serviceWorker
    .register(`${import.meta.env.BASE_URL}sw.js`)
    .then((registration) => {
      waiting = registration.waiting;
      refresh();
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            waiting = registration.waiting;
            refresh();
          }
        });
      });
      return navigator.serviceWorker.ready;
    })
    .then(() => {
      refresh();
    })
    .catch(() => undefined);
}
