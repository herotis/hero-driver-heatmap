
const CACHE='fishradar-v34-pwa-1';
const ASSETS=['./','./index.html','./manifest.json'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).then(res=>{
      // cache OSM tiles
      if(e.request.url.includes('tile.openstreetmap.org')){
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy));
      }
      return res;
    }).catch(()=>caches.match('./index.html'))
  ));
});
// background heartbeat
let heartbeat=null;
self.addEventListener('message',e=>{
  if(e.data==='start-heartbeat'){
    clearInterval(heartbeat);
    heartbeat=setInterval(()=>{self.clients.matchAll().then(clients=>clients.forEach(c=>c.postMessage('heartbeat')));},30000);
  }
  if(e.data==='stop-heartbeat'){clearInterval(heartbeat);}
});
