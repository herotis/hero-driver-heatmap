const CACHE='fishradar-v38-final-1';
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
    caches.match(e.request).then(r=> {
      // สำหรับไฟล์หลัก ไม่ใช้ cache เก่าเลย บังคับโหลดใหม่
      if(e.request.url.includes('index.html') || e.request.mode === 'navigate'){
        return fetch(e.request).then(res=>{
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,copy));
          return res;
        }).catch(()=>r || caches.match('./index.html'));
      }
      return r || fetch(e.request).then(res=>{
        if(e.request.url.includes('tile.openstreetmap.org')){
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,copy));
        }
        return res;
      }).catch(()=>caches.match('./index.html'))
    })
  );
});
let heartbeat=null;
self.addEventListener('message',e=>{
  if(e.data==='start-heartbeat'){
    clearInterval(heartbeat);
    heartbeat=setInterval(()=>{self.clients.matchAll().then(clients=>clients.forEach(c=>c.postMessage('heartbeat')));},30000);
  }
  if(e.data==='stop-heartbeat'){clearInterval(heartbeat);}
});
