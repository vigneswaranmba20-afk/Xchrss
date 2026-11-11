const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 390, height: 820 }, isMobile: true, hasTouch: true });
const square = (page, name) => page.locator(`#verLearnBoard .v5-square[aria-label^="${name} "]`);

async function openLesson(page, id = 'fork') {
  await page.goto('/');
  await page.locator('[data-ver-nav="learn"]').click();
  await page.locator(`[data-lesson="${id}"]`).click();
  await page.locator('#verLearnBoard').scrollIntoViewIfNeeded();
}

test('lesson accepts a touch move from Observe and explains the actual position', async ({ page }) => {
  await openLesson(page);
  await square(page, 'e5').tap();
  await square(page, 'f7').tap();
  await expect(square(page, 'f7')).toHaveAttribute('aria-label', 'f7 N');
  await expect(square(page, 'e5')).toHaveAttribute('aria-label', 'e5 empty');
  await expect(page.locator('#verLearnText')).toContainText('Nf7+');
  await expect(page.locator('#verLearnText')).toContainText('queen on d8');
  await page.locator('#verLearnPlayer').screenshot({ path: test.info().outputPath('playable-lesson.png') });
  await page.locator('#verLearnFlip').click();
  await expect(square(page, 'f7')).toHaveAttribute('aria-label', 'f7 N');
  await expect(page.locator('#verLearnText')).toContainText('Nf7+');
  await page.locator('#verLearnRetry').click();
  await expect(square(page, 'e5')).toHaveAttribute('aria-label', 'e5 N');
  await expect(square(page, 'f7')).toHaveAttribute('aria-label', 'f7 empty');
});

test('illegal moves stay put, legal wrong moves get feedback, and retry restores the puzzle', async ({ page }) => {
  await openLesson(page);
  await square(page, 'h8').tap();
  await expect(page.locator('#verLearnFeedback')).toContainText('White to move');
  await square(page, 'e5').tap();
  await expect(square(page, 'f7')).toHaveClass(/ver-learn-legal/);
  await square(page, 'e6').tap();
  await expect(page.locator('#verLearnFeedback')).toContainText('not legal');
  await expect(square(page, 'e5')).toHaveAttribute('aria-label', 'e5 N');
  await square(page, 'c6').tap();
  await expect(square(page, 'c6')).toHaveAttribute('aria-label', 'c6 N');
  await expect(page.locator('#verLearnText')).toContainText('You played Nc6');
  await expect(page.locator('#verLearnFeedback')).toContainText('Not quite');
  await page.locator('#verLearnRetry').click();
  await square(page, 'e5').tap();
  await square(page, 'f7').tap();
  await expect(page.locator('#verLearnFeedback')).toContainText('Correct');
});

test('flipped pin lesson supports dragging and preserves the reviewed game', async ({ page }) => {
  await openLesson(page, 'pin');
  const gameBefore = await page.locator('#board').innerHTML();
  await page.locator('#verLearnFlip').click();
  await page.locator('#verLearnBoard').scrollIntoViewIfNeeded();
  const from = await square(page, 'e2').boundingBox(), to = await square(page, 'c4').boundingBox();
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 10 });
  await expect(page.locator('.ver-learn-drag-piece')).toHaveCount(1);
  await page.mouse.up();
  await expect(page.locator('.ver-learn-drag-piece')).toHaveCount(0);
  await expect(square(page, 'c4')).toHaveAttribute('aria-label', 'c4 B');
  await expect(page.locator('#verLearnText')).toContainText('absolute pin');
  expect(await page.locator('#board').innerHTML()).toBe(gameBefore);
});

test('touch drag works and an interrupted drag leaves the position intact', async ({ page, context }) => {
  await openLesson(page);
  const session = await context.newCDPSession(page);
  const center = async name => {
    const r = await square(page, name).boundingBox();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  };
  const from = await center('e5'), to = await center('f7');
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [from] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [to] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await expect(square(page, 'e5')).toHaveAttribute('aria-label', 'e5 N');
  await expect(page.locator('.ver-learn-drag-piece')).toHaveCount(0);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [from] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [to] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(square(page, 'f7')).toHaveAttribute('aria-label', 'f7 N');
});

test('board and quiz share practice results, and replay resets the gate', async ({ page }) => {
  await openLesson(page);
  for (let i = 0; i < 4; i++) await page.locator('#verLearnNext').click();
  await expect(page.locator('#verLearnNext')).toBeDisabled();
  await page.locator('#verLearnChoicesQuiz button').filter({ hasText: 'Nc6' }).click();
  await expect(square(page, 'c6')).toHaveAttribute('aria-label', 'c6 N');
  await expect(page.locator('#verLearnNext')).toBeDisabled();
  await page.locator('#verLearnRetry').click();
  await square(page, 'e5').tap();
  await square(page, 'f7').tap();
  await expect(page.locator('#verLearnNext')).toBeEnabled();
  await page.locator('#verLearnFlip').click();
  await expect(page.locator('#verLearnNext')).toBeEnabled();
  await expect(square(page, 'f7')).toHaveAttribute('aria-label', 'f7 N');
  await page.locator('#verLearnReplay').click();
  await expect(square(page, 'e5')).toHaveAttribute('aria-label', 'e5 N');
  await expect(page.locator('#verLearnNext')).toBeDisabled();
  await page.locator('#verLearnChoicesQuiz button').filter({ hasText: 'Nf7+' }).click();
  await expect(square(page, 'f7')).toHaveAttribute('aria-label', 'f7 N');
  await expect(page.locator('#verLearnNext')).toBeEnabled();
});

test('keyboard controls can solve the lesson without a pointer', async ({ page }) => {
  await openLesson(page, 'pin');
  await square(page, 'e2').focus();
  await page.keyboard.press('Enter');
  await expect(square(page, 'e2')).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(square(page, 'e2')).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.press('Space');
  await square(page, 'c4').focus();
  await page.keyboard.press('Enter');
  await expect(square(page, 'c4')).toHaveAttribute('aria-label', 'c4 B');
});

test('installed app can move lesson pieces while offline', async ({ page, context }) => {
  await openLesson(page, 'pin');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await page.locator('[data-ver-nav="learn"]').click();
  await page.locator('[data-lesson="pin"]').click();
  await square(page, 'e2').tap();
  await square(page, 'c4').tap();
  await expect(square(page, 'c4')).toHaveAttribute('aria-label', 'c4 B');
  await expect(page.locator('#verLearnFeedback')).toContainText('Correct');
});

for(const id of ['fork','pin'])test(`legacy ${id} keyboard focus preserves the imported review position`,async({page})=>{
  await page.goto('/');
  await page.locator('#fileInput').setInputFiles({name:'keyboard.pgn',mimeType:'text/plain',buffer:Buffer.from('1. e4 e5 *')});
  await page.locator('#v5Next').click();
  const before=await page.evaluate(()=>VERChessReviewControls.state());
  await page.locator('[data-ver-nav="learn"]').click();await page.locator(`[data-lesson="${id}"]`).click();
  await square(page,id==='fork'?'e5':'e2').focus();await page.keyboard.press('ArrowLeft');
  expect(await page.evaluate(()=>VERChessReviewControls.state())).toEqual(before);
  await page.locator('[data-ver-nav="learn"]').focus();await page.keyboard.press('ArrowLeft');
  expect(await page.evaluate(()=>VERChessReviewControls.state())).toEqual(before);
  await page.locator('[data-ver-nav="board"]').click();await page.evaluate(()=>document.activeElement.blur());
  await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(()=>VERChessReviewControls.state().at)).toBe(before.at+1);
});
