const { test, expect } = require('@playwright/test');

// v7.4 read-only game positions: protect the golden board and PGN state.
test('review FEN snapshots are immutable and do not alter mobile board', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto('./');
  const result = await page.evaluate(() => {
    const api = window.VERChessReviewControls;
    if (!api || typeof api.positionFens !== 'function') return { missing: true };
    const board = document.getElementById('board');
    const original = board?.innerHTML;
    const initial = api.state();
    const positions = api.positionFens();
    const first = positions[0];
    let rejected = false;
    try { positions.push('invalid'); } catch (_) { rejected = true; }
    return {
      frozen: Object.isFrozen(positions),
      rejected,
      count: positions.length,
      expectedCount: initial.total + 1,
      first,
      unchanged: board?.innerHTML === original,
      sameState: JSON.stringify(api.state()) === JSON.stringify(initial)
    };
  });
  expect(result.missing).not.toBe(true);
  expect(result.frozen).toBe(true);
  expect(result.rejected).toBe(true);
  expect(result.count).toBe(result.expectedCount);
  expect(result.first).toMatch(/^[prnbqkPRNBQK1-8/]+ [wb] /);
  expect(result.unchanged).toBe(true);
  expect(result.sameState).toBe(true);
});
