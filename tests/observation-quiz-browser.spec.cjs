const { test, expect } = require('@playwright/test');

// Keep quiz globals isolated from the existing application's globals.
// The quiz is not yet wired into the production UI.
async function loadQuizFrame(page) {
  await page.evaluate(() => {
    const iframe = document.createElement('iframe');
    iframe.id = 'observation-quiz-test-frame';
    iframe.title = 'Isolated observation quiz test';
    document.body.appendChild(iframe);
  });
  const handle = await page.locator('#observation-quiz-test-frame').elementHandle();
  const frame = await handle.contentFrame();
  // Back-rank detector depends on the motif parser; load in dependency order.
  await frame.addScriptTag({ url: '/ver-chess-motifs.js' });
  await frame.addScriptTag({ url: '/ver-chess-back-rank.js' });
  await frame.addScriptTag({ url: '/ver-chess-observation-quiz.js' });
  return frame;
}

// Exercise the real browser bundles at an Android-sized viewport without
// changing the verified production board or relying on a remote chess service.
test('offline back-rank quiz stays deterministic on a mobile browser', async ({ page, context }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto('/');
  const frame = await loadQuizFrame(page);
  const initial = await frame.evaluate(() => {
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
  const offline = await frame.evaluate(() => {
    const quiz = globalThis.VERChessObservationQuiz;
    return quiz.questions.map(q => ({
      id: q.id,
      expected: q.expected,
      yes: quiz.assess(q.id, true),
      no: quiz.assess(q.id, false)
    }));
  });
  expect(offline).toEqual(initial);
  // The Learn board is intentionally hidden while its tab is inactive.\n  // Assert the board remains mounted; dedicated navigation tests verify visibility.\n  await expect(page.locator('#verLearnBoard')).toHaveCount(1);
});

test('browser quiz rejects malformed input without touching game state', async ({ page }) => {
  await page.goto('/');
  const frame = await loadQuizFrame(page);
  const result = await frame.evaluate(() => {
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
