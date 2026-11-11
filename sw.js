/* VER Chess Intelligence PWA service worker. App assets are self-hosted under GitHub Pages /Xchrss/. */
'use strict';
const APP_CACHE='ver-chess-shell-v7-7-combination-2026-11-11';
const ENGINE_CACHE='ver-chess-stockfish-19-0-1';
const ART_CACHE='ver-chess-cburnett-piece-art-v1';
const APP_SHELL=['./','./index.html','./ver-chess-v4-library.js','./ver-chess-v4-ux.css','./ver-chess-piece-art.js','./ver-chess-smooth-board.js','./ver-chess-smooth-ui.css','./ver-chess-touch-review.js','./ver-chess-board-themes.js','./ver-chess-refined-ui.css','./ver-chess-v6-mobile.css','./ver-chess-v6-mobile.js','./ver-chess-coach-on-board.js','./ver-chess-coach-on-board.css','./ver-chess-learn.js','./ver-chess-lesson-match.js','./ver-chess-game-lesson-index.js','./ver-chess-review-lesson-suggestions.js','./ver-chess-learn.css','./ver-chess-motifs.js','./ver-chess-back-rank.js','./ver-chess-observation-quiz.js','./ver-chess-observation-practice.js','./ver-chess-observation-practice.css','./ver-chess-v6-1-fit.css','./ver-chess-v6-2-board-rescue.css','./ver-chess-viewport-fit-v6-1.js','./ver-chess-touch-review-v6-1.js','./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./icon-180.png'];
const ENGINE_FILES=['./engine/stockfish-19-lite-single.js','./engine/stockfish-19-lite-single.wasm'];
const COMBINATION_FILES=['ver-chess-combination-content.js','ver-chess-combination.js','ver-chess-combination.css'];
APP_SHELL.push(...COMBINATION_FILES.map(name=>'./'+name));
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
// Share in-flight downloads across worker fetches and CACHE_ENGINE requests.
// A retry reuses completed files, including when two app windows ask at once.
const downloads=new Map();
async function cacheFirst(request,cacheName){
  const cache=await caches.open(cacheName);
  const hit=await cache.match(request,{ignoreSearch:cacheName===APP_CACHE});
  if(hit)return hit;
  const key=cacheName+':'+(typeof request==='string'?request:request.url);
  if(!downloads.has(key)){
    const pending=(async()=>{
      const fresh=await fetch(request);
      if(fresh.ok || fresh.type==='opaque')await cache.put(request,fresh.clone());
      return fresh;
    })();
    downloads.set(key,pending);
    pending.finally(()=>downloads.delete(key)).catch(()=>{});
  }
  return (await downloads.get(key)).clone();
}
// App JS and CSS must refresh while online; offline play still uses the last valid copy.
async function networkFirst(request){
  const cache=await caches.open(APP_CACHE);
  try{
    const fresh=await fetch(request,{cache:'no-cache'});
    if(fresh.ok)await cache.put(request,fresh.clone());
    else {const saved=await cache.match(request,{ignoreSearch:true});if(saved)return saved;}
    return fresh;
  }catch(_){
    return await cache.match(request,{ignoreSearch:true}) || Response.error();
  }
}
async function navigationFirst(request){
  const cache=await caches.open(APP_CACHE);
  try{const fresh=await fetch(request,{cache:'no-cache'});if(fresh.ok)await cache.put('./index.html',fresh.clone());else {const saved=await cache.match('./index.html') || await cache.match('./');if(saved)return saved;}return fresh;}
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
  if(COMBINATION_FILES.some(name=>url.pathname===root.pathname+name)){event.respondWith(networkFirst(request));return;}
  if(url.pathname.endsWith('/index.html') || url.pathname.endsWith('/ver-chess-v4-library.js') || url.pathname.endsWith('/ver-chess-v4-ux.css') || url.pathname.endsWith('/ver-chess-piece-art.js') || url.pathname.endsWith('/ver-chess-smooth-board.js') || url.pathname.endsWith('/ver-chess-smooth-ui.css') || url.pathname.endsWith('/ver-chess-touch-review.js') || url.pathname.endsWith('/ver-chess-board-themes.js') || url.pathname.endsWith('/ver-chess-refined-ui.css') || url.pathname.endsWith('/ver-chess-v6-mobile.css') || url.pathname.endsWith('/ver-chess-v6-mobile.js') || url.pathname.endsWith('/ver-chess-coach-on-board.js') || url.pathname.endsWith('/ver-chess-coach-on-board.css') || url.pathname.endsWith('/ver-chess-learn.js') || url.pathname.endsWith('/ver-chess-lesson-match.js') || url.pathname.endsWith('/ver-chess-game-lesson-index.js') || url.pathname.endsWith('/ver-chess-review-lesson-suggestions.js') || url.pathname.endsWith('/ver-chess-learn.css') || url.pathname.endsWith('/ver-chess-motifs.js') || url.pathname.endsWith('/ver-chess-back-rank.js') || url.pathname.endsWith('/ver-chess-observation-quiz.js') || url.pathname.endsWith('/ver-chess-observation-practice.js') || url.pathname.endsWith('/ver-chess-observation-practice.css') || url.pathname.endsWith('/ver-chess-v6-1-fit.css') || url.pathname.endsWith('/ver-chess-v6-2-board-rescue.css') || url.pathname.endsWith('/ver-chess-viewport-fit-v6-1.js') || url.pathname.endsWith('/ver-chess-touch-review-v6-1.js') || url.pathname===root.pathname || url.pathname.endsWith('/manifest.json') || url.pathname.split('/').pop().startsWith('icon-')){
    event.respondWith(networkFirst(request));
  }
});
self.addEventListener('message',event=>{
  if(event.data?.type!=='CACHE_ENGINE')return;
  event.waitUntil((async()=>{
    const target=event.source;
    try{
      for(const filename of ENGINE_FILES){
        const url=new URL(filename,root).href;
        const response=await cacheFirst(url,ENGINE_CACHE);
        if(!response.ok)throw Error('Engine asset unavailable: '+response.status);
      }
      target?.postMessage({type:'ENGINE_CACHED'});
    }catch(err){target?.postMessage({type:'ENGINE_CACHE_FAILED',reason:String(err)});}
  })());
});
