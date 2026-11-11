const {test,expect}=require('@playwright/test');
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');

// A real HTTP server is necessary: page.route does not intercept worker fetches.
// Serve under /Xchrss/ to exercise the actual Pages scope, not just localhost /.
async function server() {
  const failures=new Set(),counts=new Map(),delays=new Map();let revision='base';
  const root=path.resolve(__dirname,'..');
  const app=http.createServer(async(req,res)=>{
    const url=new URL(req.url,'http://localhost'),name=url.pathname.replace(/^\/Xchrss\//,'')||'index.html';
    counts.set(name,(counts.get(name)||0)+1);
    if(delays.has(name))await new Promise(resolve=>setTimeout(resolve,delays.get(name)));
    if(failures.has(name)){res.writeHead(503);res.end('Temporary failure');return;}
    try {
      let body=await fs.readFile(path.join(root,name));
      if(name==='sw.js')body=Buffer.from(body.toString().replace(/ver-chess-shell-([^']+)/,'ver-chess-shell-$1-'+revision));
      const type=name.endsWith('.js')?'application/javascript':name.endsWith('.css')?'text/css':name.endsWith('.wasm')?'application/wasm':name.endsWith('.json')?'application/json':name.endsWith('.png')?'image/png':'text/html';
      res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(body);
    } catch {res.writeHead(404);res.end();}
  });
  await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
  return {url:`http://127.0.0.1:${app.address().port}/Xchrss/`,failures,counts,delays,revision:value=>revision=value,
    close:()=>new Promise(resolve=>{app.closeAllConnections();app.close(resolve);})};
}
test.use({viewport:{width:393,height:852},isMobile:true,hasTouch:true,serviceWorkers:'allow'});

async function saveGame(page) {
  await page.route('https://lichess.org/api/games/user/**',route=>route.fulfill({contentType:'application/x-chess-pgn',body:'[Event "Preserved PGN"]\n[White "qaowner"]\n[Black "Opponent"]\n[Result "1-0"]\n\n1. e4 e5 1-0'}));
  await page.locator('#verV4LichessUsername').fill('qaowner');
  await page.locator('#verV4LichessFind').tap();
  await expect(page.locator('#verV4List')).toContainText('qaowner');
}

test('failed engine download resumes without refetching completed files or duplicating simultaneous retries',async({page})=>{
  const site=await server(),wasm='engine/stockfish-19-lite-single.wasm',js='engine/stockfish-19-lite-single.js';
  try {
    site.failures.add(wasm);
    await page.goto(site.url);await page.evaluate(async()=>await navigator.serviceWorker.ready);
    await expect(page.locator('#pwaConnectText')).toContainText('Connect to the internet once');
    expect(site.counts.get(js)).toBe(1);expect(site.counts.get(wasm)).toBe(1);
    site.failures.clear();site.delays.set(wasm,250);
    await page.evaluate(()=>new Promise(resolve=>{
      let replies=0;
      const listener=e=>{if(e.data.type==='ENGINE_CACHED'&&++replies===2){navigator.serviceWorker.removeEventListener('message',listener);resolve();}};
      navigator.serviceWorker.addEventListener('message',listener);
      navigator.serviceWorker.controller.postMessage({type:'CACHE_ENGINE'});
      navigator.serviceWorker.controller.postMessage({type:'CACHE_ENGINE'});
    }));
    expect(site.counts.get(js)).toBe(1);
    expect(site.counts.get(wasm)).toBe(2); // One failed request, one successful retry.
  } finally {await site.close();}
});

test('cached shell survives HTTP failures and cold offline reopening with local PGN and Stockfish',async({page,context},info)=>{
  const site=await server();
  try {
    await page.goto(site.url);
    await page.evaluate(async()=>await navigator.serviceWorker.ready);
    await page.reload();
    await expect.poll(()=>page.evaluate(async()=>{
      const c=await caches.open('ver-chess-stockfish-19-0-1');return (await c.keys()).length;
    })).toBe(2);
    await saveGame(page);
    await page.evaluate(()=>localStorage.setItem('qa-preservation','keep my saved PGN'));
    const saved=await page.evaluate(()=>({...localStorage}));
    for(const file of ['index.html','ver-chess-learn.js'])site.failures.add(file);
    const asset=await page.evaluate(async()=>{const r=await fetch('./ver-chess-learn.js');return {ok:r.ok,text:await r.text()};});
    expect(asset.ok).toBe(true);expect(asset.text).toContain('VERChessLearn');
    await page.reload();
    await expect(page.locator('[data-ver-nav="learn"]')).toBeVisible();
    expect(await page.evaluate(()=>({...localStorage}))).toEqual(saved);
    site.failures.clear();
    const downloads=site.counts.get('engine/stockfish-19-lite-single.wasm');
    await page.evaluate(()=>navigator.serviceWorker.controller.postMessage({type:'CACHE_ENGINE'}));
    await page.reload();
    expect(site.counts.get('engine/stockfish-19-lite-single.wasm')).toBe(downloads);
    await context.setOffline(true);
    await page.close();
    const cold=await context.newPage();await cold.goto(site.url);
    expect(await cold.evaluate(()=>({...localStorage}))).toEqual(saved);
    await expect(cold.locator('#verV4List')).toContainText('qaowner');
    await cold.locator('#fileInput').setInputFiles({name:'offline.pgn',mimeType:'text/plain',buffer:Buffer.from('[White "Offline saved"]\n\n1. e4 e5 *')});
    await expect(cold.locator('#v5MoveNumber')).toHaveText('0 / 2');
    const engine=await cold.evaluate(async()=>{
      const worker=new Worker('./engine/stockfish-19-lite-single.js');
      return new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>{worker.terminate();reject(Error('No offline UCI response'));},12000);
        worker.onmessage=e=>{if(String(e.data).includes('uciok')){clearTimeout(timer);worker.terminate();resolve('uciok');}};
        worker.onerror=e=>{clearTimeout(timer);worker.terminate();reject(Error(e.message));};worker.postMessage('uci');
      });
    });
    expect(engine).toBe('uciok');
    await cold.locator('[data-ver-nav="learn"]').tap();await cold.locator('[data-lesson="pin"]').tap();
    await cold.locator('#verLearnBoard .v5-square[aria-label="e2 B"]').tap();
    await cold.locator('#verLearnBoard .v5-square[aria-label="c4 empty"]').tap();
    await expect(cold.locator('#verLearnFeedback')).toContainText('Correct');
    await cold.screenshot({path:info.outputPath('cold-offline.png')});
  } finally {await context.setOffline(false);await site.close();}
});

test('interrupted shell update keeps the active release and saved games; retry offers Reload update',async({page},info)=>{
  const site=await server();
  try {
    await page.goto(site.url);await page.evaluate(async()=>await navigator.serviceWorker.ready);await page.reload();
    await saveGame(page);
    await page.evaluate(()=>localStorage.setItem('qa-saved-pgn','1. e4 e5 *'));
    const original=await page.evaluate(async()=>(await caches.keys()).find(k=>k.startsWith('ver-chess-shell-')));
    site.revision('interrupted');site.failures.add('ver-chess-learn.js');
    expect(await page.evaluate(async()=>{
      const registration=await navigator.serviceWorker.getRegistration();
      const failed=new Promise(resolve=>registration.addEventListener('updatefound',()=>{
        const worker=registration.installing;worker.addEventListener('statechange',()=>{if(worker.state==='redundant')resolve(worker.state);});
      },{once:true}));await registration.update();return failed;
    })).toBe('redundant');
    expect(await page.evaluate(async name=>(await caches.keys()).includes(name),original)).toBe(true);
    // Check the actual active cache independently of an incomplete installation.
    expect(await page.evaluate(async name=>Boolean(await caches.open(name).then(c=>c.match('./index.html'))),original)).toBe(true);
    expect(await page.evaluate(()=>localStorage.getItem('qa-saved-pgn'))).toBe('1. e4 e5 *');
    site.failures.clear();site.revision('recovered');
    await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();});
    await expect(page.getByRole('button',{name:'Reload update'})).toBeVisible();
    await page.getByRole('button',{name:'Reload update'}).tap();
    await expect(page.locator('[data-ver-nav="learn"]')).toBeVisible();
    await expect(page.locator('#verV4List')).toContainText('qaowner');
    expect(await page.evaluate(()=>localStorage.getItem('qa-saved-pgn'))).toBe('1. e4 e5 *');
    await page.screenshot({path:info.outputPath('updated.png')});
  } finally {await site.close();}
});
