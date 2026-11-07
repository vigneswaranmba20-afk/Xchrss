/* VER Chess Intelligence PWA service worker. App assets are self-hosted under GitHub Pages /Xchrss/. */
'use strict';
const APP_CACHE='ver-chess-shell-v6-3-lichess-full-comments-2026-11-07';
const ENGINE_CACHE='ver-chess-stockfish-19-0-1';
const ART_CACHE='ver-chess-cburnett-piece-art-v1';
const APP_SHELL=['./','./index.html','./ver-chess-v4-library.js','./ver-chess-v4-ux.css','./ver-chess-piece-art.js','./ver-chess-smooth-board.js','./ver-chess-smooth-ui.css','./ver-chess-touch-review.js','./ver-chess-board-themes.js','./ver-chess-refined-ui.css','./ver-chess-v6-mobile.css','./ver-chess-v6-mobile.js','./ver-chess-flying-coach.js','./ver-chess-v6-1-fit.css','./ver-chess-v6-2-board-rescue.css','./ver-chess-viewport-fit-v6-1.js','./ver-chess-touch-review-v6-1.js','./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./icon-180.png'];
const ENGINE_FILES=['./engine/stockfish-19-lite-single.js','./engine/stockfish-19-lite-single.wasm'];
const root=new URL(self.registration.scope);
const withinScope=url=>url.origin===root.origin && url.pathname.startsWith(root.pathname);
function engineAsset(url){return url.pathname.startsWith(root.pathname+'engine/');}
function pieceAsset(url){return url.hostname==='cdn.jsdelivr.net' && url.pathname.includes('/lichess-org/lila@master/public/piece/cburnett/');}
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(APP_CACHE).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('ver-chess-shell-') && k!==APP_CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
async function cacheFirst(request,cacheName){
  const cache=await caches.open(cacheName);
  const hit=await cache.match(request,{ignoreSearch:cacheName===APP_CACHE});
  if(hit)return hit;
  const fresh=await fetch(request);
  if(fresh.ok || fresh.type==='opaque')await cache.put(request,fresh.clone());
  return fresh;
}
async function navigationFirst(request){
  const cache=await caches.open(APP_CACHE);
  try{const fresh=await fetch(request);if(fresh.ok)await cache.put('./index.html',fresh.clone());return fresh;}
  catch(err){return await cache.match('./index.html') || await cache.match('./') || Response.error();}
}
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(pieceAsset(url)){event.respondWith(cacheFirst(request,ART_CACHE));return;}
  if(!withinScope(url))return;
  if(engineAsset(url)){event.respondWith(cacheFirst(request,ENGINE_CACHE));return;}
  if(request.mode==='navigate'){event.respondWith(navigationFirst(request));return;}
  if(url.pathname.endsWith('/index.html') || url.pathname.endsWith('/ver-chess-v4-library.js') || url.pathname.endsWith('/ver-chess-v4-ux.css') || url.pathname.endsWith('/ver-chess-piece-art.js') || url.pathname.endsWith('/ver-chess-smooth-board.js') || url.pathname.endsWith('/ver-chess-smooth-ui.css') || url.pathname.endsWith('/ver-chess-touch-review.js') || url.pathname.endsWith('/ver-chess-board-themes.js') || url.pathname.endsWith('/ver-chess-refined-ui.css') || url.pathname.endsWith('/ver-chess-v6-mobile.css') || url.pathname.endsWith('/ver-chess-v6-mobile.js') || url.pathname.endsWith('/ver-chess-flying-coach.js') || url.pathname.endsWith('/ver-chess-v6-1-fit.css') || url.pathname.endsWith('/ver-chess-v6-2-board-rescue.css') || url.pathname.endsWith('/ver-chess-viewport-fit-v6-1.js') || url.pathname.endsWith('/ver-chess-touch-review-v6-1.js') || url.pathname===root.pathname || url.pathname.endsWith('/manifest.json') || url.pathname.split('/').pop().startsWith('icon-')){
    event.respondWith(cacheFirst(request,APP_CACHE));
  }
});
self.addEventListener('message',event=>{
  if(event.data?.type!=='CACHE_ENGINE')return;
  event.waitUntil((async()=>{
    const target=event.source;
    try{
      const cache=await caches.open(ENGINE_CACHE);
      for(const filename of ENGINE_FILES){
        const url=new URL(filename,root).href;
        let response=await cache.match(url);
        if(!response){response=await fetch(url);if(!response.ok)throw Error('Engine asset unavailable: '+response.status);await cache.put(url,response.clone());}
      }
      target?.postMessage({type:'ENGINE_CACHED'});
    }catch(err){target?.postMessage({type:'ENGINE_CACHE_FAILED',reason:String(err)});}
  })());
});
