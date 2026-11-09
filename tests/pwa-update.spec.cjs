const { test, expect } = require('@playwright/test');

// In Chromium, GitHub Pages-like HTTP localhost is a secure context for service workers.
test.use({ viewport: { width: 390, height: 820 }, isMobile: true, hasTouch: true, serviceWorkers: 'allow' });

test('updated assets replace stale app-shell cache while online and remain available offline', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect(page.locator('#verV4ChessFind')).toBeVisible();
  await page.evaluate(async () => {
    const name = (await caches.keys()).find(key => key.startsWith('ver-chess-shell-v7-7-'));
    if (!name) throw Error('Current app-shell cache was not installed');
    const cache = await caches.open(name);
    await cache.put('./ver-chess-v4-library.js', new Response('/* deliberately stale */', {
      headers: { 'Content-Type': 'application/javascript' }
    }));
  });
  const fresh = await page.evaluate(async () => (await fetch('./ver-chess-v4-library.js?v=7.7')).text());
  expect(fresh).toContain('Two visible public account searches');
  expect(fresh).not.toContain('deliberately stale');
  await context.setOffline(true);
  const offline = await page.evaluate(async () => (await fetch('./ver-chess-v4-library.js?v=7.7')).text());
  expect(offline).toContain('Two visible public account searches');
  await context.setOffline(false);
});

test('installed app offers a user-controlled reload instead of interrupting the game', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await page.evaluate(() => navigator.serviceWorker.dispatchEvent(new Event('controllerchange')));
  await expect(page.locator('#verUpdateBanner')).toContainText('newer VER Chess version');
  await expect(page.getByRole('button', { name: 'Reload update' })).toBeVisible();
  await expect(page.locator('#verV4ChessFind')).toBeVisible();
});
