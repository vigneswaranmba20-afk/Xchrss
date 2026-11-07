const { test, expect } = require('@playwright/test');

const MOBILE_VIEWPORTS = [
  { width: 320, height: 600 },
  { width: 360, height: 720 },
  { width: 390, height: 820 },
  { width: 430, height: 900 }
];

const SAMPLE_PGN = [
  '[Event "Stability regression"]',
  '[Site "Local test"]',
  '[Date "2026.11.07"]',
  '[White "TestWhite"]',
  '[Black "TestBlack"]',
  '[Result "1-0"]',
  '',
  '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 1-0'
].join('\n');

async function openChess(context) {
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-ver-nav="games"]')).toBeVisible();
  await expect(page.locator('#verV4ChessUsername')).toBeVisible();
  return page;
}

async function openBoard(page) {
  await page.locator('[data-ver-nav="board"]').click();
  await expect(page.locator('body')).toHaveAttribute('data-ver-view', 'board');
  await expect(page.locator('#board .v5-square')).toHaveCount(64);
  // Allow requestAnimationFrame and ResizeObserver to update their dimensions.
  await expect.poll(async () => {
    return page.locator('#board').evaluate(el => el.getBoundingClientRect().width);
  }).toBeGreaterThan(100);
}

async function measureBoard(page) {
  return page.evaluate(() => {
    const rect = selector => document.querySelector(selector)?.getBoundingClientRect();
    const b = rect('#board');
    const wrap = rect('.board-wrap');
    const panel = rect('.ver-board-panel');
    const main = rect('main.main');
    const nav = rect('.verv4-appnav');
    const dock = rect('#v5Dock');
    if (![b, wrap, panel, main, nav, dock].every(Boolean)) {
      throw Error('A required Board element is missing from the DOM');
    }

    const visibleTop = Math.max(0, b.top, wrap.top, panel.top, main.top, nav.bottom);
    const visibleBottom = Math.min(
      window.innerHeight, b.bottom, wrap.bottom, panel.bottom, main.bottom, dock.top
    );
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    const visibleLeft = Math.max(0, b.left, wrap.left, panel.left, main.left);
    const visibleRight = Math.min(window.innerWidth, b.right, wrap.right, panel.right, main.right);
    const visibleWidth = Math.max(0, visibleRight - visibleLeft);

    return {
      width: b.width, height: b.height,
      visibleFraction: b.width > 0 && b.height > 0
        ? (visibleWidth * visibleHeight) / (b.width * b.height)
        : 0,
      boardTop: b.top, boardBottom: b.bottom,
      navBottom: nav.bottom, dockTop: dock.top,
      squares: document.querySelectorAll('#board .v5-square').length,
      pieces: document.querySelectorAll('#board .v5-piece').length,
      boardDisplay: getComputedStyle(document.querySelector('#board')).display,
      panelDisplay: getComputedStyle(document.querySelector('.ver-board-panel')).display
    };
  });
}

async function importSampleGame(page) {
  await page.locator('[data-ver-nav="games"]').click();
  await page.locator('.v6-optional-pgn > summary').click();
  await page.locator('.ver-pgn-details > summary').click();
  await page.locator('#pgnText').fill(SAMPLE_PGN);
  await page.locator('#pasteBtn').click();
  await expect(page.locator('body')).toHaveAttribute('data-ver-view', 'board');
  await expect(page.locator('#playerNames')).toContainText('TestWhite');
  await expect(page.locator('#playerNames')).toContainText('TestBlack');
  await expect(page.locator('#v5MoveNumber')).toContainText('0 / 6');
}

test.describe('Mobile board release blocker — full visibility', () => {
  for (const viewport of MOBILE_VIEWPORTS) {
    test('all 64 squares visible at ' + viewport.width + '×' + viewport.height, async ({ browser }) => {
      const context = await browser.newContext({
        viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
        serviceWorkers: 'block'
      });
      try {
        const page = await openChess(context);
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await openBoard(page);

        await expect.poll(async () => {
          const result = await measureBoard(page);
          return result.visibleFraction;
        }).toBeGreaterThan(0.97);

        const m = await measureBoard(page);
        // An invisible 0-height board or a tiny 100px board MUST fail this check.
        const minimumComfortableSize = Math.min(
          viewport.width - 24, viewport.height - 270
        ) * 0.84;
        expect(m.width, 'Board width').toBeGreaterThan(minimumComfortableSize);
        expect(m.height, 'Board height').toBeGreaterThan(minimumComfortableSize);
        expect(Math.abs(m.width - m.height), 'Board remains square').toBeLessThan(3);
        expect(m.visibleFraction, 'Board is not clipped by parent or dock').toBeGreaterThan(0.97);
        expect(m.boardTop, 'Board must sit below tabs').toBeGreaterThanOrEqual(m.navBottom - 2);
        expect(m.boardBottom, 'Board must end before thumb controls').toBeLessThanOrEqual(m.dockTop + 2);
        expect(m.squares).toBe(64);
        expect(m.pieces, 'Starting position has 32 pieces').toBe(32);
        expect(m.boardDisplay).not.toBe('none');
        expect(errors, 'Uncaught browser exceptions').toEqual([]);
        if (viewport.width === 390) {
          await page.screenshot({ path: 'test-results/stability-board-390x820.png' });
        }
      } finally {
        await context.close();
      }
    });
  }
});


test('Board survives mobile viewport contraction and expansion without clipping', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 820 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    serviceWorkers: 'block'
  });
  try {
    const page = await openChess(context);
    await openBoard(page);
    const sizes = [
      { width: 390, height: 680 },
      { width: 390, height: 820 },
      { width: 360, height: 720 }
    ];
    for (const size of sizes) {
      await page.setViewportSize(size);
      await expect.poll(async () => (await measureBoard(page)).visibleFraction).toBeGreaterThan(0.97);
      const m = await measureBoard(page);
      expect(m.squares).toBe(64);
      expect(m.pieces).toBe(32);
      expect(m.width).toBeGreaterThan(Math.min(size.width - 24, size.height - 270) * 0.8);
      expect(m.boardBottom).toBeLessThanOrEqual(m.dockTop + 2);
    }
  } finally {
    await context.close();
  }
});

test('Reset Board has consistent styled appearance rather than native white button', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 820 }, isMobile: true,
    hasTouch: true, serviceWorkers: 'block'
  });
  try {
    const page = await openChess(context);
    await openBoard(page);
    const reset = page.locator('#v5Reset');
    await expect(reset).toBeVisible();
    await expect(reset).toContainText('Reset board');
    const style = await reset.evaluate(el => ({
      background: getComputedStyle(el).backgroundColor,
      radius: getComputedStyle(el).borderRadius
    }));
    expect(style.background).toBe('rgb(217, 194, 127)');
    expect(parseFloat(style.radius)).toBeGreaterThan(8);
  } finally {
    await context.close();
  }
});

test('PGN import, two-thumb navigation, Reset and Flip remain functional', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 820 }, deviceScaleFactor: 2,
    isMobile: true, hasTouch: true, serviceWorkers: 'block'
  });
  try {
    const page = await openChess(context);
    await importSampleGame(page);

    await page.locator('#v5Next').click();
    await expect(page.locator('#v5MoveNumber')).toContainText('1 / 6');
    await page.locator('#v5Next').click();
    await expect(page.locator('#v5MoveNumber')).toContainText('2 / 6');

    await page.locator('#v5Previous').click();
    await expect(page.locator('#v5MoveNumber')).toContainText('1 / 6');

    await page.locator('#v5Reset').click();
    await expect(page.locator('#v5MoveNumber')).toContainText('0 / 6');

    await expect(page.locator('#flipBtn')).toBeVisible();
    await page.locator('#flipBtn').click();
    await expect(page.locator('#board .v5-square')).toHaveCount(64);
    expect((await measureBoard(page)).visibleFraction).toBeGreaterThan(0.97);
    await expect(page.locator('#v5Analyze')).toBeVisible();
  } finally {
    await context.close();
  }
});

test('Games / Board / Insights work without losing the selected game', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 820 }, isMobile: true,
    hasTouch: true, serviceWorkers: 'block'
  });
  try {
    const page = await openChess(context);
    await importSampleGame(page);
    await page.locator('[data-ver-nav="insights"]').click();
    await expect(page.locator('body')).toHaveAttribute('data-ver-view', 'insights');
    await expect(page.locator('#verFingerprintPanel')).toBeVisible();
    await page.locator('[data-ver-nav="games"]').click();
    await expect(page.locator('#verV4ChessUsername')).toBeVisible();
    await page.locator('[data-ver-nav="board"]').click();
    await expect(page.locator('body')).toHaveAttribute('data-ver-view', 'board');
    await expect(page.locator('#playerNames')).toContainText('TestWhite');
    expect((await measureBoard(page)).visibleFraction).toBeGreaterThan(0.97);
  } finally {
    await context.close();
  }
});

test('Installed PWA can still load its app shell offline', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 820 }, isMobile: true,
    hasTouch: true, serviceWorkers: 'allow'
  });
  try {
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'load' });
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload({ waitUntil: 'load' });
    await expect(page.locator('[data-ver-nav="games"]')).toBeVisible();
    // The first controlled navigation needs to populate navigationFirst cache.
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await openBoard(page);
    expect((await measureBoard(page)).visibleFraction).toBeGreaterThan(0.97);
  } finally {
    await context.setOffline(false);
    await context.close();
  }
});

test('Both account searches appear on Games and Lichess search loads completed PGNs', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 820 }, isMobile: true,
    hasTouch: true, serviceWorkers: 'block'
  });
  try {
    const page = await openChess(context);
    await expect(page.locator('#verV4ChessForm')).toBeVisible();
    await expect(page.locator('#verV4LichessForm')).toBeVisible();
    await expect(page.locator('#verV4LichessUsername')).toBeVisible();
    await expect(page.locator('#verV4LichessFind')).toBeVisible();
    await page.route('https://lichess.org/api/games/user/**', async route => {
      await route.fulfill({
        status: 200, contentType: 'application/x-chess-pgn',
        headers: { 'access-control-allow-origin': '*' },
        body: SAMPLE_PGN
      });
    });
    await page.locator('#verV4LichessUsername').fill('thibault');
    await page.locator('#verV4LichessFind').click();
    await expect(page.locator('#verV4LichessStatus')).toContainText('Found 1 finished game');
    await expect(page.locator('#verV4List')).toContainText('TestWhite');
  } finally {
    await context.close();
  }
});

test('Full coach comments are accessible without shrinking the mobile chessboard', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 820 }, isMobile: true,
    hasTouch: true, serviceWorkers: 'block'
  });
  try {
    const page = await openChess(context);
    await importSampleGame(page);
    const first = await measureBoard(page);
    const complete = 'The decisive continuation keeps pressure on the pinned defender. '.repeat(5) +
      'The final sentence must remain visible in full.';
    await page.evaluate(message => {
      window.VERChessFloatingCoach.update({
        ply: 1, flag: 'mistake', label: '1. e4', best: 'd4', message
      });
    }, complete);
    const read = page.locator('#v6CoachReadFull');
    await expect(read).toBeVisible();
    await read.click();
    await expect(page.locator('#v6CoachDialog')).toBeVisible();
    await expect(page.locator('#v6CoachFullText')).toContainText('The final sentence must remain visible in full.');
    await page.locator('#v6CoachDialog button:has-text("Back to board")').click();
    await expect(page.locator('#v6CoachDialog')).not.toBeVisible();
    const after = await measureBoard(page);
    expect(after.visibleFraction).toBeGreaterThan(0.97);
    expect(Math.abs(first.width - after.width)).toBeLessThan(3);
  } finally {
    await context.close();
  }
});
