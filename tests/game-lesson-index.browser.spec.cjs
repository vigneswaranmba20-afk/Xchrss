const {test,expect}=require('@playwright/test');
const {findLessonMoments}=require('../ver-chess-game-lesson-index.js');
test('v7.4 read-only game-to-lesson index preserves mobile review board',async({page})=>{
 await page.setViewportSize({width:393,height:852});
 await page.goto('/');
 const before=await page.locator('.board').first().evaluate(el=>el.outerHTML);
 const fork='3q3k/8/8/4N3/8/8/8/K7 w - - 0 1';
 const lessons=[{id:'fork',name:'Knight fork',fen:fork}];
 const positions=[fork,fork.replace(' w ',' b '),'bad'];
 const snapshot=JSON.stringify({lessons,positions});
 expect(findLessonMoments(positions,lessons).map(x=>x.ply)).toEqual([0]);
 expect(JSON.stringify({lessons,positions})).toBe(snapshot);
 expect(await page.locator('.board').first().evaluate(el=>el.outerHTML)).toBe(before);
});
