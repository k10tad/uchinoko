const CACHE='uchinoko-app-1.1.1';
const ASSETS=["./", "index.html", "style.css?v=1.1.1", "app.js?v=1.1.1", "media.js?v=6", "diary.js?v=6", "feeding.js?v=1.1.0", "preventive.js?v=1.1.0", "history-ui.js?v=1.1.1", "grooming.js?v=1.1.0", "modal-layout.js?v=6", "pwa.js", "splash.css?v=1.0.2", "splash.js?v=1.0.2", "dog.jpg", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('uchinoko-app-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url),base=new URL(self.registration.scope);
 if(request.method!=='GET'||url.origin!==base.origin||!url.pathname.startsWith(base.pathname))return;
 const known=ASSETS.some(path=>new URL(path,base).href===url.href);
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).catch(()=>caches.open(CACHE).then(cache=>cache.match('index.html'))));return;
 }
 if(known)event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(request))||fetch(request)));
});
