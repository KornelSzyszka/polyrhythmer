import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
async function list(path) {
  const entries = await readdir(path, { withFileTypes: true });
  return (await Promise.all(entries.filter(e => e.name !== 'sw.js').map(e => e.isDirectory() ? list(`${path}/${e.name}`) : `${path}/${e.name}`))).flat();
}
const files = await list('dist');
const hash = createHash('sha256');
for (const file of files.sort()) hash.update(await readFile(file));
const assets = files.map(f => './' + f.slice(5));
const version = hash.digest('hex').slice(0,16);
await writeFile('dist/sw.js', `
const CACHE = 'synesterra-${version}';
const ASSETS = ${JSON.stringify(['./', ...assets])};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  // Keep previous caches for already-open tabs. Each worker reads only its own cache.
  event.waitUntil(self.clients.claim());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    // Static same-origin assets are identical for all Origin headers. Vite preview
    // sends Vary: Origin, while module requests carry Origin and precache does not.
    const cached = await cache.match(event.request, { ignoreVary: true });
    if (cached) return cached;
    try { return await fetch(event.request); }
    catch (error) {
      if (event.request.mode === 'navigate') return (await cache.match('./index.html')) || Response.error();
      return Response.error();
    }
  }));
});
`);
console.log(`Offline shell: ${assets.length} assets, version ${version}`);
