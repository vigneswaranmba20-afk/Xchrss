const {test,expect}=require('@playwright/test');
test('v7.4 read-only Learn suggestions load on mobile and remain usable offline',async({page,context})=>{
 await page.setViewportSize({width:393,height:852});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('./');
 const board=page.locator('#board');
 const original=await board.evaluate(el=>el.outerHTML);
 const initial=await page.evaluate(()=>({state:VERChessReviewControls.state(),fens:VERChessReviewControls.positionFens()}));
 await expect(page.locator('#verReviewLessonSuggestions')).toBeAttached();
 await expect(page.locator('#verReviewLessonResults')).toContainText('No exact lesson positions');
 await context.setOffline(true);
 const result=await page.evaluate(()=>{
  VERChessReviewLessonSuggestions.refresh();
  return {index:typeof VERChessGameLessonIndex.findLessonMoments,matcher:typeof VERChessLessonMatch.matchExactPosition,state:VERChessReviewControls.state(),fens:VERChessReviewControls.positionFens()};
 });
 expect(result.index).toBe('function');
 expect(result.matcher).toBe('function');
 expect(result.state).toEqual(initial.state);
 expect(result.fens).toEqual(initial.fens);
 expect(await board.evaluate(el=>el.outerHTML)).toBe(original);
});
