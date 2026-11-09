const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 390, height: 820 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
const pgn = user => `[Event "Search regression"]\n[Site "Local"]\n[Date "2026.11.09"]\n[White "${user}"]\n[Black "Opponent"]\n[Result "1-0"]\n\n1. e4 e5 1-0`;

async function mockSearches(page, { chessStatus = 200, lichessStatus = 200 } = {}) {
  const requests = { chesscom: 0, lichess: 0 };
  let releaseChess, releaseLichess;
  const chessGate = new Promise(resolve => { releaseChess = resolve; });
  const lichessGate = new Promise(resolve => { releaseLichess = resolve; });
  await page.route('https://api.chess.com/**', async route => {
    requests.chesscom++;
    if (route.request().url().endsWith('/archives')) {
      await chessGate;
      if (chessStatus !== 200) { await route.fulfill({ status: chessStatus, body: '' }); return; }
      await route.fulfill({ json: { archives: ['https://api.chess.com/pub/player/chessuser/games/2026/11'] } });
    } else {
      await route.fulfill({ json: { games: [{ rules: 'chess', end_time: 1794222000, pgn: pgn('chessuser'), url: 'https://www.chess.com/game/live/123' }] } });
    }
  });
  await page.route('https://lichess.org/api/games/user/**', async route => {
    requests.lichess++;
    await lichessGate;
    await route.fulfill({ status: lichessStatus, contentType: 'application/x-chess-pgn', body: lichessStatus === 200 ? pgn('lichessuser') : '' });
  });
  await page.goto('/');
  await page.locator('#verV4ChessUsername').fill('chessuser');
  await page.locator('#verV4LichessUsername').fill('lichessuser');
  return { requests, releaseChess, releaseLichess };
}

test('Chess.com Find only loads Chess.com and leaves Lichess ready', async ({ page }) => {
  const mock = await mockSearches(page);
  try {
    await page.locator('#verV4ChessFind').click();
    await expect(page.locator('#verV4ChessFind')).toBeDisabled();
    await expect(page.locator('#verV4LichessFind')).toBeEnabled();
    await expect(page.locator('#verV4LichessFind')).toHaveText('Find');
    await expect(page.locator('#verV4LichessStatus')).toHaveText('Public finished games');
    await expect(page.locator('#verV4ChessForm')).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('#verV4LichessForm')).toHaveAttribute('aria-busy', 'false');
    await page.locator('#verV4ChessUsername').press('Enter');
    expect(mock.requests.chesscom).toBe(1);
    expect(mock.requests.lichess).toBe(0);
    mock.releaseChess();
    await expect(page.locator('#verV4ChessStatus')).toContainText('Found 1 finished game');
    await expect(page.locator('#verV4List')).toContainText('chessuser');
    await page.locator('.verv4-platforms').screenshot({ path: test.info().outputPath('horizontal-search.png') });
  } finally { mock.releaseChess(); mock.releaseLichess(); }
});

test('Lichess Find stays independent and recovers after a provider error', async ({ page }) => {
  const mock = await mockSearches(page, { lichessStatus: 429 });
  try {
    await page.locator('#verV4LichessFind').click();
    await expect(page.locator('#verV4ChessFind')).toBeEnabled();
    await expect(page.locator('#verV4ChessStatus')).toHaveText('Public finished games');
    expect(mock.requests.chesscom).toBe(0);
    mock.releaseLichess();
    await expect(page.locator('#verV4LichessStatus')).toContainText('Rate limited');
    await expect(page.locator('#verV4LichessFind')).toBeEnabled();
    await expect(page.locator('#verV4LichessForm')).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('#verV4ChessUsername')).toHaveValue('chessuser');
  } finally { mock.releaseChess(); mock.releaseLichess(); }
});

for (const firstFinished of ['chesscom', 'lichess']) {
  test(`independent searches keep the newest results when ${firstFinished} finishes first`, async ({ page }) => {
    const mock = await mockSearches(page);
    try {
      await page.locator('#verV4ChessFind').click();
      await page.locator('#verV4LichessFind').click();
      await expect(page.locator('#verV4ChessFind')).toBeDisabled();
      await expect(page.locator('#verV4LichessFind')).toBeDisabled();
      if (firstFinished === 'chesscom') {
        mock.releaseChess();
        await expect(page.locator('#verV4ChessStatus')).toContainText('Found 1');
        await expect(page.locator('#verV4LichessFind')).toBeDisabled();
        await expect(page.locator('#verV4List')).toContainText('Searching Lichess');
        mock.releaseLichess();
      } else {
        mock.releaseLichess();
        await expect(page.locator('#verV4LichessStatus')).toContainText('Found 1');
        await expect(page.locator('#verV4ChessFind')).toBeDisabled();
        mock.releaseChess();
      }
      await expect(page.locator('#verV4ChessFind')).toBeEnabled();
      await expect(page.locator('#verV4LichessFind')).toBeEnabled();
      await expect(page.locator('#verV4ResultTitle')).toHaveText('Results: Lichess @lichessuser');
      await expect(page.locator('#verV4Context')).toContainText('@lichessuser');
      await expect(page.locator('#verV4List')).toContainText('lichessuser');
      await expect(page.locator('#verV4List .verv4-game')).toHaveCount(1);
      await expect(page.locator('#verV4List .verv4-tag')).toHaveText('Lichess');
      await page.locator('#verV4All').click();
      await expect(page.locator('#verV4List .verv4-game')).toHaveCount(2);
    } finally { mock.releaseChess(); mock.releaseLichess(); }
  });
}

test('a late failure stays in its own card without replacing the latest successful results', async ({ page }) => {
  const mock = await mockSearches(page, { chessStatus: 404 });
  try {
    await page.locator('#verV4ChessFind').click();
    await page.locator('#verV4LichessFind').click();
    mock.releaseLichess();
    await expect(page.locator('#verV4LichessStatus')).toContainText('Found 1');
    mock.releaseChess();
    await expect(page.locator('#verV4ChessStatus')).toContainText('not found');
    await expect(page.locator('#verV4Context')).toContainText('Found 1 finished games for @lichessuser');
    await expect(page.locator('#verV4List')).toContainText('lichessuser');
  } finally { mock.releaseChess(); mock.releaseLichess(); }
});

test('switching to Saved games during a search preserves that view when the response arrives', async ({ page }) => {
  const mock = await mockSearches(page);
  try {
    await page.locator('#verV4ChessFind').click();
    await page.locator('#verV4All').click();
    mock.releaseChess();
    await expect(page.locator('#verV4ChessFind')).toBeEnabled();
    await expect(page.locator('#verV4ResultTitle')).toHaveText('Saved games');
    await expect(page.locator('#verV4Context')).toContainText('Showing saved public games');
    await expect(page.locator('#verV4List')).toContainText('chessuser');
  } finally { mock.releaseChess(); mock.releaseLichess(); }
});

test('the two search cards, fields and buttons align horizontally without phone overflow', async ({ page }) => {
  await page.goto('/');
  for (const width of [320, 390, 720, 1280]) {
    await page.setViewportSize({ width, height: 820 });
    for (const part of ['Form', 'Username', 'Find']) {
      const chess = await page.locator(`#verV4Chess${part}`).boundingBox();
      const lichess = await page.locator(`#verV4Lichess${part}`).boundingBox();
      expect(Math.abs(chess.y - lichess.y)).toBeLessThan(2);
      expect(chess.x + chess.width).toBeLessThan(lichess.x);
      expect(chess.height).toBeGreaterThanOrEqual(44);
      expect(lichess.x + lichess.width).toBeLessThanOrEqual(width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});
