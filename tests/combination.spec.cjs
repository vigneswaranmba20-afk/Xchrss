const {test,expect}=require('@playwright/test');
const content=require('../ver-chess-combination-content.js');
test.use({viewport:{width:393,height:852},isMobile:true,hasTouch:true,serviceWorkers:'block'});
const square=(page,name)=>page.locator('#verComboBoard [data-square="'+name+'"]');
const state=page=>page.evaluate(()=>VERChessCombination.state());
async function open(page){
 await page.goto('/');await page.locator('[data-ver-nav="learn"]').click();
 await page.locator('[data-lesson="deflection-fork"]').click();
 await expect(page.locator('#verComboStage')).toHaveText('Observe');
 await expect(page.locator('#verComboBoard .v5-square')).toHaveCount(64);
}
async function playback(page){
 await open(page);await page.locator('#verComboNext').click();await page.locator('#verComboNext').click();
 await page.locator('#verComboPlay').click(); // Pause, including before the first move.
 await page.locator('#verComboReplay').click();
 await expect.poll(async()=>(await state(page)).ply).toBe(0);
}
async function toEnd(page){
 for(let ply=1;ply<=5;ply++){await page.locator('#verComboMoveNext').click();await expect.poll(async()=>(await state(page)).ply).toBe(ply);}
 await expect(page.locator('#verComboNext')).toBeEnabled();
}
async function readyAt(page,ply){await expect.poll(async()=>{const s=await state(page);return s.ply===ply&&!s.busy&&!s.playing;}).toBe(true);}
async function move(page,from,to,expectedPly){
 await square(page,from).tap();await square(page,to).tap();await readyAt(page,expectedPly);
}
async function boardGeometry(page){return page.evaluate(()=>{
 const b=document.querySelector('#verComboBoard').getBoundingClientRect(),p=document.querySelector('#verComboPlayer').getBoundingClientRect(),slot=document.querySelector('.ver-combo-position').getBoundingClientRect();
 const width=Math.max(0,Math.min(innerWidth,b.right,p.right,slot.right)-Math.max(0,b.left,p.left,slot.left));
 const height=Math.max(0,Math.min(innerHeight,b.bottom,p.bottom,slot.bottom)-Math.max(0,b.top,p.top,slot.top));
 const cells=[...document.querySelectorAll('#verComboBoard .v5-square')].map(c=>c.getBoundingClientRect());
 return {width:b.width,height:b.height,visible:width*height/(b.width*b.height),playerBottom:p.bottom,overflow:document.documentElement.scrollWidth-innerWidth,
  rows:new Set(cells.map(c=>c.y)).size,columns:new Set(cells.map(c=>c.x)).size,minSquareWidth:Math.min(...cells.map(c=>c.width))};
});}

test('Observe has no autoplay or solution overlay; Discover accepts legal candidates without corrupting the position',async({page})=>{
 await open(page);await page.waitForTimeout(700);
 expect(await state(page)).toMatchObject({stage:'Observe',ply:0,playing:false,fen:content.fen});
 await expect(page.locator('#verComboBoard .last')).toHaveCount(0);
 await expect(page.locator('#verComboBoard .v5-board-arrows path')).toHaveCount(0);
 await page.locator('#verComboNext').click();
 await square(page,'e5').tap();await expect(square(page,'f7')).toHaveClass(/ver-learn-legal/);
 await square(page,'f7').tap();
 await expect(page.locator('#verComboFeedback')).toContainText('does not check the king on g8');
 expect((await state(page)).fen).toBe(content.fen);
 await square(page,'h1').tap();await square(page,'g2').tap();
 await expect(page.locator('#verComboFeedback')).toContainText('not legal');
 expect((await state(page)).fen).toBe(content.fen);
 await square(page,'h8').tap();
 await expect(page.locator('#verComboStage')).toHaveText('Animate');
 await expect(square(page,'h8')).toHaveAttribute('aria-label','h8 R');
 await page.locator('#verComboPlay').click();
});

test('all five animated plies, captures, Previous, Next and Replay keep notation and explanations synchronized',async({page},info)=>{
 await playback(page);
 const labels=['Rh8+','Kxh8','Nf7+','Kh7','Nxd8'];
 for(let i=0;i<5;i++){
  await page.locator('#verComboMoveNext').click();
  await expect(page.locator('#verComboText')).toContainText(labels[i]);
  await readyAt(page,i+1);
  const geometry=await boardGeometry(page);
  await info.attach('playback-geometry-'+(i+1),{body:JSON.stringify({...geometry,scrollY:await page.evaluate(()=>scrollY)}),contentType:'application/json'});
  expect(geometry.visible,'All ranks must remain visible after every playback control').toBeGreaterThan(0.97);
  if(i===0)await expect(square(page,'h8')).toHaveAttribute('aria-label','h8 R');
  if(i===1){await expect(square(page,'h8')).toHaveAttribute('aria-label','h8 k');await expect(page.locator('#verComboBoard [data-piece="wR"]')).toHaveCount(0);}
  if(i===2){await expect(square(page,'f7')).toHaveAttribute('aria-label','f7 N');await expect(page.locator('#verComboBoard .v5-board-arrows path')).toHaveCount(4);}
  await page.screenshot({path:info.outputPath('ply-'+(i+1)+'.png')});
 }
 await expect(square(page,'d8')).toHaveAttribute('aria-label','d8 N');
 await expect(page.locator('#verComboBoard [data-piece="bQ"]')).toHaveCount(0);
 for(let i=4;i>=0;i--){await page.locator('#verComboPrevious').click();await readyAt(page,i);if(i)await expect(page.locator('#verComboText')).toContainText(labels[i-1]);}
 expect((await state(page)).fen).toBe(content.fen);
 await page.locator('#verComboMoveNext').click();await readyAt(page,1);
 await page.locator('#verComboReplay').click();expect((await state(page)).fen).toBe(content.fen);
});

for(const defense of ['kh7','kg8'])test('independent Practice handles mistakes, all attacking moves and defense '+defense,async({page},info)=>{
 await playback(page);await toEnd(page);
 await page.locator('#verComboNext').click();await expect(page.locator('#verComboStage')).toHaveText('Explain');
 await page.locator('#verComboMore summary').click();
 await expect(page.locator('#verComboDetail')).toContainText('remaining endgame');
 await page.locator('#verComboDefense').selectOption(defense);
 await page.locator('#verComboNext').click();await expect(page.locator('#verComboStage')).toHaveText('Practice');
 expect((await state(page)).fen).toBe(content.fen);
 await expect(page.locator('#verComboNext')).toBeDisabled();
 await square(page,'e5').tap();await square(page,'f7').tap();
 await expect(page.locator('#verComboFeedback')).toContainText('Qf8');expect((await state(page)).ply).toBe(0);
 await move(page,'h1','h8',2);
 await expect(square(page,'h8')).toHaveAttribute('aria-label','h8 k');
 await move(page,'e5','f7',4);
 await expect(square(page,defense==='kh7'?'h7':'g8')).toHaveAttribute('aria-label',(defense==='kh7'?'h7':'g8')+' k');
 await move(page,'f7','d8',5);
 expect((await state(page)).solved).toBe(true);
 await page.locator('#verComboNext').click();await expect(page.locator('#verComboStage')).toHaveText('Review');
 await expect(page.locator('#verComboText')).toContainText('Calculate every reply');
 await page.screenshot({path:info.outputPath('review-'+defense+'.png')});
 await page.locator('#verComboReplay').click();expect((await state(page)).fen).toBe(content.fen);
 await expect(page.locator('#verComboStage')).toHaveText('Animate');
});

test('rapid repeated stage and move taps cannot skip stages or duplicate moves',async({page})=>{
 await open(page);
 await page.locator('#verComboNext').evaluate(b=>{for(let i=0;i<12;i++)b.click();});
 expect(await state(page)).toMatchObject({stage:'Discover',ply:0});
 await page.locator('#verComboNext').click();await page.locator('#verComboPlay').click();await page.locator('#verComboReplay').click();
 await page.locator('#verComboMoveNext').evaluate(b=>{for(let i=0;i<12;i++)b.click();});
 await readyAt(page,1);expect((await state(page)).ply).toBe(1);
 await page.locator('#verComboPrevious').evaluate(b=>{for(let i=0;i<12;i++)b.click();});
 await readyAt(page,0);expect((await state(page)).fen).toBe(content.fen);
});

test('focus and accidental page scrolling cannot displace the active lesson board',async({page})=>{
 await playback(page);
 await page.locator('#verComboMoveNext').click();await readyAt(page,1);
 const before=await boardGeometry(page);
 await page.evaluate(()=>window.scrollTo({top:300,behavior:'instant'}));
 await page.mouse.wheel(0,400);
 await page.locator('#verComboMoveNext').focus();
 await expect.poll(async()=>(await boardGeometry(page)).visible).toBeGreaterThan(0.97);
 expect((await boardGeometry(page)).width).toBe(before.width);
 await page.locator('#verComboExit').click();
 await expect(page.locator('body')).not.toHaveClass(/ver-combination-active/);
 await expect(page.locator('#verLearnChoices')).toBeVisible();
});

test('leaving mid-animation cancels playback and preserves the imported review board and saved storage',async({page})=>{
 await page.goto('/');await page.locator('#fileInput').setInputFiles({name:'review.pgn',mimeType:'text/plain',buffer:Buffer.from('[White "Preserved game"]\n\n1. e4 e5 *')});
 const before=await page.evaluate(()=>({state:VERChessReviewControls.state(),fens:VERChessReviewControls.positionFens(),storage:{...localStorage},board:document.querySelector('#board').innerHTML}));
 await page.locator('[data-ver-nav="learn"]').click();await page.locator('[data-lesson="deflection-fork"]').click();
 await page.locator('#verComboNext').click();await page.locator('#verComboNext').click();
 await expect.poll(async()=>(await state(page)).ply).toBeGreaterThan(0);
 await page.locator('[data-ver-nav="board"]').click();
 const stopped=await state(page);expect(stopped.active).toBe(false);
 await page.waitForTimeout(1300);expect(await state(page)).toEqual(stopped);
 expect(await page.evaluate(()=>({state:VERChessReviewControls.state(),fens:VERChessReviewControls.positionFens(),storage:{...localStorage},board:document.querySelector('#board').innerHTML}))).toEqual(before);
 await expect(page.locator('#verComboBoard .last')).toHaveCount(0);
 await expect(page.locator('#verComboBoard .v5-board-arrows path')).toHaveCount(0);
 await page.locator('[data-ver-nav="learn"]').click();await page.locator('[data-lesson="pin"]').click();
 await expect(page.locator('#verLearnTitle')).toHaveText('Absolute pin');await expect(page.locator('#verComboPlayer')).toBeHidden();
});

test('touch dragging, cancellation and keyboard legal destinations work without scrolling',async({page,context})=>{
 await open(page);await page.locator('#verComboNext').click();
 const session=await context.newCDPSession(page),center=async n=>{const r=await square(page,n).boundingBox();return {x:r.x+r.width/2,y:r.y+r.height/2};};
 const from=await center('h1'),to=await center('h8');
 const y=await page.evaluate(()=>scrollY);
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[from]});
 await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[to]});
 await expect(page.locator('.ver-combo-ghost')).toHaveCount(1);
 await session.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 await expect(page.locator('.ver-combo-ghost')).toHaveCount(0);expect((await state(page)).fen).toBe(content.fen);
 expect(await page.evaluate(()=>scrollY)).toBe(y);
 await square(page,'h1').focus();await page.keyboard.press('ArrowUp');await expect(square(page,'h2')).toBeFocused();
 await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await expect(square(page,'h8')).toHaveClass(/ver-learn-legal/);
 await page.keyboard.press('Escape');await expect(square(page,'h1')).toHaveAttribute('aria-pressed','false');
 await page.keyboard.press('Space');await square(page,'h8').focus();await page.keyboard.press('Enter');
 await expect(page.locator('#verComboStage')).toHaveText('Animate');
});

test('a completed touch drag chooses the candidate, and exit clears a live drag',async({page,context})=>{
 await open(page);await page.locator('#verComboNext').click();
 const session=await context.newCDPSession(page),center=async n=>{const r=await square(page,n).boundingBox();return {x:r.x+r.width/2,y:r.y+r.height/2};};
 const from=await center('h1'),to=await center('h8');
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[from]});
 await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[to]});
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await expect(page.locator('#verComboStage')).toHaveText('Animate');
 await page.locator('#verComboExit').click();await expect(page.locator('.ver-combo-ghost')).toHaveCount(0);
 await page.locator('[data-lesson="deflection-fork"]').click();await page.locator('#verComboNext').click();
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[await center('h1')]});
 await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[await center('h8')]});
 await expect(page.locator('.ver-combo-ghost')).toHaveCount(1);
 await page.locator('#verComboExit').evaluate(b=>b.click());
 await expect(page.locator('.ver-combo-ghost')).toHaveCount(0);
 await session.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
});

test('flipping preserves candidate state and flipped touch coordinates select the same legal move',async({page})=>{
 await open(page);await page.locator('#verComboNext').click();
 await page.locator('#verComboFlip').click();await readyAt(page,0);
 await expect(page.locator('#verComboBoard .v5-square').first()).toHaveAttribute('aria-label','h1 R');
 expect((await state(page)).fen).toBe(content.fen);
 await square(page,'h1').tap();await square(page,'h8').tap();
 await expect(page.locator('#verComboStage')).toHaveText('Animate');await expect(square(page,'h8')).toHaveAttribute('aria-label','h8 R');
});

test('combination keyboard arrows never navigate the hidden imported game',async({page})=>{
 await page.goto('/');await page.locator('#fileInput').setInputFiles({name:'keyboard.pgn',mimeType:'text/plain',buffer:Buffer.from('1. e4 e5 *')});
 await page.locator('#v5Next').click();
 const before=await page.evaluate(()=>VERChessReviewControls.state());
 await page.locator('[data-ver-nav="learn"]').click();await page.locator('[data-lesson="deflection-fork"]').click();await page.locator('#verComboNext').click();
 await square(page,'h1').focus();await page.keyboard.press('ArrowLeft');
 expect(await page.evaluate(()=>VERChessReviewControls.state())).toEqual(before);
 await page.keyboard.press('ArrowRight');
 expect(await page.evaluate(()=>VERChessReviewControls.state())).toEqual(before);
 await page.locator('#verComboNext').focus();await page.keyboard.press('ArrowLeft');
 expect(await page.evaluate(()=>VERChessReviewControls.state())).toEqual(before);
});

test('the visibility lifecycle pauses a pending practice reply and Continue resumes exactly once',async({page})=>{
 await playback(page);await toEnd(page);await page.locator('#verComboNext').click();await page.locator('#verComboNext').click();
 await square(page,'h1').tap();await square(page,'h8').tap();
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 await page.waitForTimeout(1100);expect(await state(page)).toMatchObject({ply:1,playing:false,busy:false});
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 await page.locator('#verComboPlay').click();await readyAt(page,2);
 await page.waitForTimeout(800);expect((await state(page)).ply).toBe(2);
});

test('reduced motion keeps the full lesson functional and removes piece transitions',async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});await playback(page);await toEnd(page);
 expect(await page.locator('#verComboBoard .v5-piece').first().evaluate(el=>getComputedStyle(el).transitionDuration)).toBe('0s');
 await page.locator('#verComboNext').click();await page.locator('#verComboNext').click();
 await move(page,'h1','h8',2);await move(page,'e5','f7',4);await move(page,'f7','d8',5);
 await page.screenshot({path:info.outputPath('reduced-motion.png')});
});

test('all requested portrait sizes keep the entire combination board and thumb controls in view',async({page},info)=>{
 await open(page);
 async function check(stage,expanded=false){for(const [width,height] of [[320,600],[360,800],[393,852],[412,915]]){
  await page.setViewportSize({width,height});
  await expect.poll(async()=>(await boardGeometry(page)).visible).toBeGreaterThan(0.97);
  const m=await boardGeometry(page);expect(m.width).toBeGreaterThan(expanded?140:180);expect(Math.abs(m.width-m.height)).toBeLessThan(2);expect(m.overflow).toBeLessThanOrEqual(1);expect(m.playerBottom).toBeLessThanOrEqual(height);
  expect(m.rows).toBe(8);expect(m.columns).toBe(8);expect(m.minSquareWidth).toBeGreaterThan(m.width/8-1);
  const next=await page.locator('#verComboNext').boundingBox();expect(next.y+next.height).toBeLessThanOrEqual(height);expect(next.height).toBeGreaterThanOrEqual(44);
  await info.attach('combination-'+stage+'-'+width,{body:JSON.stringify({stage,expanded,viewport:{width,height},...m}),contentType:'application/json'});
  await page.screenshot({path:info.outputPath(stage+'-'+width+'x'+height+'.png')});
 }}
 await check('observe');
 await page.locator('#verComboNext').click();await check('discover');
 await page.locator('#verComboNext').click();await page.locator('#verComboPlay').click();await page.locator('#verComboReplay').click();
 await toEnd(page);await check('animate');
 await page.locator('#verComboNext').click();await check('explain');
 await page.locator('#verComboMore summary').click();await check('deeper',true);
 await page.locator('#verComboNext').click();await check('practice');
 await move(page,'h1','h8',2);await move(page,'e5','f7',4);await move(page,'f7','d8',5);
 await page.locator('#verComboNext').click();await check('review');
});

test('actual transform animation is measured with animation-frame samples',async({page},info)=>{
 await playback(page);
 const samples=await page.evaluate(()=>new Promise(resolve=>{
  const frames=[],start=performance.now();let previous=start;
  const rook=document.querySelector('#verComboBoard [data-piece="wR"]');
  function frame(time){frames.push({ms:time-previous,y:new DOMMatrixReadOnly(getComputedStyle(rook).transform).m42});previous=time;if(time-start<420)requestAnimationFrame(frame);else resolve(frames);}
  requestAnimationFrame(frame);document.querySelector('#verComboMoveNext').click();
 }));
 expect(samples.length).toBeGreaterThan(3);
 expect(await page.locator('#verComboBoard [data-piece="wR"]').evaluate(el=>getComputedStyle(el).transitionProperty)).toContain('transform');
 expect(new Set(samples.map(s=>Math.round(s.y))).size,'Rook must visibly interpolate, not teleport').toBeGreaterThan(3);
 const sorted=samples.slice(1).map(s=>s.ms).sort((a,b)=>a-b),report={samples:sorted.length,meanMs:sorted.reduce((a,b)=>a+b,0)/sorted.length,p95Ms:sorted[Math.floor(sorted.length*.95)],maxMs:sorted.at(-1),environment:'Headless Chromium; not a physical Android FPS certification'};
 await info.attach('animation-frame-measurement',{body:JSON.stringify(report,null,2),contentType:'application/json'});
});

test('short landscape keeps the new lesson board readable alongside its controls',async({page},info)=>{
 await page.setViewportSize({width:800,height:360});await open(page);
 await expect.poll(async()=>(await boardGeometry(page)).width).toBeGreaterThan(140);
 await page.locator('#verComboNext').click();await page.locator('#verComboNext').click();await page.locator('#verComboPlay').click();
 await expect.poll(async()=>(await boardGeometry(page)).width).toBeGreaterThan(140);
 expect((await boardGeometry(page)).visible).toBeGreaterThan(0.97);
 const next=await page.locator('#verComboNext').boundingBox();expect(next.y+next.height).toBeLessThanOrEqual(360);
 await page.screenshot({path:info.outputPath('landscape-800x360.png')});
});

test('a cold offline reopening offers both defenses and legal combination practice',async({browser})=>{
 const context=await browser.newContext({baseURL:'http://127.0.0.1:4173',viewport:{width:393,height:852},isMobile:true,hasTouch:true,serviceWorkers:'allow'});
 try {
  let page=await context.newPage();await page.goto('/');await page.evaluate(async()=>await navigator.serviceWorker.ready);await page.reload();
  const cached=await page.evaluate(async()=>{const name=(await caches.keys()).find(k=>k.startsWith('ver-chess-shell-')),c=await caches.open(name);return Promise.all(['ver-chess-combination.js','ver-chess-combination-content.js','ver-chess-combination.css'].map(async name=>Boolean(await c.match('./'+name))));});
  expect(cached).toEqual([true,true,true]);await context.setOffline(true);await page.close();page=await context.newPage();
  await page.emulateMedia({reducedMotion:'reduce'});await playback(page);await toEnd(page);
  await page.locator('#verComboNext').click();await page.locator('#verComboMore summary').click();await page.locator('#verComboDefense').selectOption('kg8');
  await page.locator('#verComboNext').click();await move(page,'h1','h8',2);await move(page,'e5','f7',4);await move(page,'f7','d8',5);
  expect(await state(page)).toMatchObject({defense:'kg8',solved:true});
 } finally {await context.setOffline(false);await context.close();}
});
