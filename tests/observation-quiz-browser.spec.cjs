const { test, expect } = require('@playwright/test');

// Exercise the real browser bundles at an Android-sized viewport without
// changing the verified production board or relying on a remote chess service.
test('offline back-rank quiz stays deterministic on a mobile browser', async ({ page, context }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto('/');
  await page.addScriptTag({ url: '/ver-chess-back-rank.js' });
  await page.addScriptTag({ url: '/ver-chess-observation-quiz.js' });
  const initial = await page.evaluate(() => {
    const quiz = globalThis.VERChessObservationQuiz;
    return quiz.questions.map(q => ({
      id: q.id,
      expected: q.expected,
      yes: quiz.assess(q.id, true),
      no: quiz.assess(q.id, false)
    }));
  });
  expect(initial).toHaveLength(3);
  for (const item of initial) {
    expect(item.yes.correct).toBe(item.expected);
    expect(item.no.correct).toBe(!item.expected);
    expect(item.yes.explanation).toMatch(/does not establish/i);
    expect(item.yes).not.toHaveProperty('accuracy');
    expect(item.yes).not.toHaveProperty('evaluation');
  }
  await context.setOffline(true);
  const offline = await page.evaluate(() => {
    const quiz = globalThis.VERChessObservationQuiz;
    return quiz.questions.map(q => ({
      id: q.id,
      expected: q.expected,
      yes: quiz.assess(q.id, true),
      no: quiz.assess(q.id, false)
    }));
  });
  expect(offline).toEqual(initial);
  await expect(page.locator('.board').first()).toBeVisible();
});

test('browser quiz rejects malformed input without touching game state', async ({ page }) => {
  await page.goto('/');
  await page.addScriptTag({ url: '/ver-chess-back-rank.js' });
  await page.addScriptTag({ url: '/ver-chess-observation-quiz.js' });
  const result = await page.evaluate(() => {
    const quiz = globalThis.VERChessObservationQuiz;
    const errors = [];
    for (const [id, answer] of [['missing', true], [quiz.questions[0].id, 'yes']]) {
      try { quiz.assess(id, answer); } catch (error) { errors.push(error.message); }
    }
    return errors;
  });
  expect(result).toHaveLength(2);
  expect(result[0]).toMatch(/unknown/i);
  expect(result[1]).toMatch(/boolean/i);
});
