const {test,expect}=require('@playwright/test');
const matcher=require('../ver-chess-lesson-match.js');
test('v7.4 exact lesson matching is conservative and does not alter the review board',async({page})=>{
  await page.setViewportSize({width:393,height:852});
  await page.goto('/');
  const boardBefore=await page.locator('.board').first().evaluate(el=>el.outerHTML);
  const lessons=[{id:'fork',name:'Knight fork',fen:'3q3k/8/8/4N3/8/8/8/K7 w - - 0 1'}];
  expect(matcher.matchExactPosition('3q3k/8/8/4N3/8/8/8/K7 w - - 4 9',lessons)).toHaveLength(1);
  expect(matcher.matchExactPosition('3q3k/8/8/4N3/8/8/8/K7 b - - 0 1',lessons)).toEqual([]);
  expect(matcher.matchExactPosition('invalid',lessons)).toEqual([]);
  expect(await page.locator('.board').first().evaluate(el=>el.outerHTML)).toBe(boardBefore);
});
