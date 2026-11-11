const { test, expect } = require('@playwright/test');

const sizes = [[320,600],[360,800],[393,852],[412,915],[800,360]];
const pgn = '[Event "Android QA"]\n[White "MobileWhite"]\n[Black "MobileBlack"]\n\n1. e4 e5 2. Nf3 Nc6 *';

async function geometry(page) {
  return page.evaluate(() => {
    const board = document.querySelector('#board'), b = board.getBoundingClientRect();
    let left = Math.max(0,b.left), right = Math.min(innerWidth,b.right);
    let top = Math.max(0,b.top,document.querySelector('.verv4-appnav').getBoundingClientRect().bottom);
    let bottom = Math.min(innerHeight,b.bottom,document.querySelector('#v5Dock').getBoundingClientRect().top);
    // Match the protected review-stage clipping model. Body's short content box
    // is not the clipping box for the fixed mobile main (the viewport is).
    for(const el of document.querySelectorAll('.board-wrap,.ver-board-panel,main.main,.main > .left')) {
      const style=getComputedStyle(el),r=el.getBoundingClientRect();
      if(/hidden|auto|scroll|clip/.test(style.overflowY)){top=Math.max(top,r.top);bottom=Math.min(bottom,r.bottom);}
      if(/hidden|auto|scroll|clip/.test(style.overflowX)){left=Math.max(left,r.left);right=Math.min(right,r.right);}
    }
    return {width:b.width,height:b.height,visible:Math.max(0,right-left)*Math.max(0,bottom-top)/(b.width*b.height),
      overflow:document.documentElement.scrollWidth-innerWidth,leftScroll:document.querySelector('.main > .left').scrollTop};
  });
}

for(const [width,height] of sizes) test(`Android-like navigation and imported board ${width}×${height}`,async({browser},info)=>{
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:2,serviceWorkers:'block'});
  try {
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/');
    for(const id of ['verV4ChessFind','verV4LichessFind']) {
      await expect(page.locator('#'+id)).toBeVisible();
      const r=await page.locator('#'+id).boundingBox();
      expect(r.height).toBeGreaterThanOrEqual(40);
      expect(r.x+r.width).toBeLessThanOrEqual(width);
    }
    await page.screenshot({path:info.outputPath('find.png')});
    await page.locator('#fileInput').setInputFiles({name:'android.pgn',mimeType:'application/x-chess-pgn',buffer:Buffer.from(pgn)});
    await expect(page.locator('#playerNames')).toContainText('MobileWhite');
    await expect(page.locator('#board .v5-square')).toHaveCount(64);
    await expect.poll(async()=>(await geometry(page)).visible).toBeGreaterThan(0.97);
    await page.locator('#v5Next').tap();
    await expect(page.locator('#v5MoveNumber')).toHaveText('1 / 4');
    await page.locator('#v5Previous').tap();
    await expect(page.locator('#v5MoveNumber')).toHaveText('0 / 4');
    await page.locator('#flipBtn').tap();
    await expect(page.locator('#board .v5-square').first()).toHaveAttribute('aria-label','h1 R');
    await page.locator('#v5Next').tap();
    await page.locator('#v5Reset').tap();
    await expect(page.locator('#v5MoveNumber')).toHaveText('0 / 4');
    const m=await geometry(page);
    expect(m.visible).toBeGreaterThan(0.97);
    expect(m.overflow).toBeLessThanOrEqual(1);
    expect(m.leftScroll).toBe(0);
    await info.attach('board-geometry',{body:JSON.stringify({width,height,...m}),contentType:'application/json'});
    await page.screenshot({path:info.outputPath('board.png')});
    await page.evaluate(()=>{analysis=[{cpWhite:140,bestUci:'d2d4',pv:['d2d4']},{cpWhite:5,bestUci:'g8f6',pv:[]}];jump(1);});
    await page.locator('#v6CoachReadFull').tap();
    await page.locator('#v7Best').tap();
    await expect(page.locator('#board .v5-square[aria-label="d4 P"]')).toHaveCount(1);
    await expect.poll(async()=>(await geometry(page)).visible).toBeGreaterThan(0.97);
    await page.screenshot({path:info.outputPath('read-full.png')});
    await page.locator('#v7Close').tap();
    await expect(page.locator('#v5MoveNumber')).toHaveText('1 / 4');
    await page.locator('#v5Reset').tap();
    await page.locator('[data-ver-nav="insights"]').tap();
    await expect(page.locator('#verReviewLessonSuggestions')).toBeVisible();
    await page.screenshot({path:info.outputPath('insights.png')});
    await page.locator('[data-ver-nav="learn"]').tap();
    await page.locator('[data-lesson="fork"]').tap();
    await page.locator('#verLearnBoard').scrollIntoViewIfNeeded();
    await expect(page.locator('#verLearnBoard .v5-square')).toHaveCount(64);
    const square=n=>page.locator('#verLearnBoard .v5-square[aria-label^="'+n+' "]');
    await square('e5').tap();await square('f7').tap();
    await expect(square('f7')).toHaveAttribute('aria-label','f7 N');
    await page.screenshot({path:info.outputPath('learn.png')});
    await page.locator('[data-ver-nav="board"]').tap();
    await expect.poll(async()=>(await geometry(page)).visible).toBeGreaterThan(0.97);
    await expect(page.locator('#v5MoveNumber')).toHaveText('0 / 4');
    expect(errors).toEqual([]);
  } finally {await context.close();}
});

test('portrait resizing preserves the imported game state',async({browser})=>{
  const context=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  try {
    const page=await context.newPage();await page.goto('/');
    await page.locator('#fileInput').setInputFiles({name:'resize.pgn',mimeType:'text/plain',buffer:Buffer.from(pgn)});
    await page.locator('#v5Next').tap();
    const before=await page.evaluate(()=>({state:VERChessReviewControls.state(),fens:VERChessReviewControls.positionFens()}));
    for(const [width,height] of sizes.slice(0,4)) {
      await page.setViewportSize({width,height});
      await expect.poll(async()=>(await geometry(page)).visible).toBeGreaterThan(0.97);
      expect(await page.evaluate(()=>({state:VERChessReviewControls.state(),fens:VERChessReviewControls.positionFens()}))).toEqual(before);
    }
  } finally {await context.close();}
});
