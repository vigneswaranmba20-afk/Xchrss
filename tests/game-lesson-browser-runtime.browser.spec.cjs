const {test,expect}=require('@playwright/test');

test('v7.4 lesson index runs in the actual mobile browser, including offline',async({page,context})=>{
 await page.setViewportSize({width:393,height:852});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 const board=page.locator('.board').first();
 await expect(board).toBeVisible();
 const original=await board.evaluate(el=>el.outerHTML);
 // Exercise browser globals, not the CommonJS helper imported by the test runner.
 await page.addScriptTag({url:'./ver-chess-lesson-match.js'});
 await page.addScriptTag({url:'./ver-chess-game-lesson-index.js'});
 const fen='3q3k/8/8/4N3/8/8/8/K7 w - - 0 1';
 const result=await page.evaluate(fen=>{
   const positions=Object.freeze([fen,fen.replace(' w ',' b '),'bad']);
   const lessons=Object.freeze([Object.freeze({id:'fork',name:'Knight fork',fen})]);
   const before=JSON.stringify({positions,lessons});
   const found=window.VERChessGameLessonIndex.findLessonMoments(positions,lessons);
   return {moments:found.map(x=>({ply:x.ply,ids:x.lessons.map(y=>y.id)})),
     frozen:Object.isFrozen(found)&&Object.isFrozen(found[0]),
     untouched:before===JSON.stringify({positions,lessons})};
 },fen);
 expect(result).toEqual({moments:[{ply:0,ids:['fork']}],frozen:true,untouched:true});
 await context.setOffline(true);
 const offline=await page.evaluate(fen=>
   window.VERChessGameLessonIndex.findLessonMoments([fen],[{id:'fork',fen}]).map(x=>x.ply),fen);
 expect(offline).toEqual([0]);
 expect(await board.evaluate(el=>el.outerHTML)).toBe(original);
});
