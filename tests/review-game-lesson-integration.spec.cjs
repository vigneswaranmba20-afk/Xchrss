const { test, expect } = require('@playwright/test');

// Exercise the real review position source and offline lesson matcher together.
// No production board, saved-game, or engine changes.
test('v7.4 review snapshots feed exact-position lessons without changing mobile board', async ({ page, context }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await page.addScriptTag({ url: './ver-chess-lesson-match.js' });
  await page.addScriptTag({ url: './ver-chess-game-lesson-index.js' });
  const before = await page.locator('#board').evaluate(el => el.outerHTML);
  const initial = await page.evaluate(() => ({
    state: window.VERChessReviewControls.state(),
    fens: window.VERChessReviewControls.positionFens()
  }));
  expect(initial.fens.length).toBe(initial.state.total + 1);
  expect(initial.fens.length).toBeGreaterThan(0);
  await context.setOffline(true);
  const result = await page.evaluate(() => {
    const review = window.VERChessReviewControls;
    const index = window.VERChessGameLessonIndex;
    const fens = review.positionFens();
    const lessons = Object.freeze([
      Object.freeze({ id: 'current', name: 'Same position', fen: fens[0] }),
      Object.freeze({ id: 'wrong-turn', name: 'Different turn', fen: fens[0].replace(/ ([wb]) /, (_, side) => ' ' + (side === 'w' ? 'b' : 'w') + ' ') })
    ]);
    const original = JSON.stringify({ fens, lessons });
    const matches = index.findLessonMoments(fens, lessons);
    return {
      matches: matches.filter(x => x.ply === 0).flatMap(x => x.lessons.map(l => l.id)),
      immutable: Object.isFrozen(fens) && Object.isFrozen(matches),
      unchangedInputs: JSON.stringify({ fens, lessons }) === original,
      state: review.state()
    };
  });
  expect(result.matches).toEqual(['current']);
  expect(result.immutable).toBe(true);
  expect(result.unchangedInputs).toBe(true);
  expect(result.state).toEqual(initial.state);
  expect(await page.locator('#board').evaluate(el => el.outerHTML)).toBe(before);
});
