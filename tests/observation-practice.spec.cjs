const { test, expect } = require('@playwright/test');
test('Learn observation practice answers three detector-checked positions without touching Board', async ({page}) => {
 await page.setViewportSize({width:393,height:852});
 await page.goto('/');
 await expect(page.locator('#board')).toHaveCount(1);
 const original=await page.locator('#board').innerHTML();
 const practice=page.locator('#verObservationPractice');
 await expect(practice).toHaveCount(1);
 await expect(practice.locator('#verObservationCount')).toHaveText('Position 1 of 3');
 await page.locator('[data-ver-nav="learn"]').click();
 await expect(practice).toBeVisible();
 await expect(practice.locator('#verObservationBoard')).toBeVisible();
 await practice.locator('[data-answer="no"]').click();
 await expect(practice.locator('#verObservationFeedback')).toContainText('Try again.');
 await expect(practice.locator('#verObservationNext')).toBeDisabled();
 await practice.locator('[data-answer="yes"]').click();
 await expect(practice.locator('#verObservationFeedback')).toContainText('Correct.');
 await practice.locator('#verObservationNext').click();
 await expect(practice.locator('#verObservationCount')).toHaveText('Position 2 of 3');
 await practice.locator('[data-answer="no"]').click();
 await expect(practice.locator('#verObservationFeedback')).toContainText('Correct.');
 await practice.locator('#verObservationNext').click();
 await expect(practice.locator('#verObservationCount')).toHaveText('Position 3 of 3');
 await practice.locator('[data-answer="no"]').click();
 await expect(practice.locator('#verObservationFeedback')).toContainText('Correct.');
 await expect(page.locator('#board')).toHaveCount(1);
 expect(await page.locator('#board').innerHTML()).toBe(original);
});
test('loaded observation practice remains usable without network and honors reduced motion', async ({page,context}) => {
 await page.setViewportSize({width:393,height:852});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 await page.locator('[data-ver-nav="learn"]').click();
 const practice=page.locator('#verObservationPractice');
 await expect(practice).toBeVisible();
 await context.setOffline(true);
 await practice.locator('[data-answer="yes"]').click();
 await expect(practice.locator('#verObservationFeedback')).toContainText('Correct.');
 await practice.locator('#verObservationNext').click();
 await expect(practice.locator('#verObservationCount')).toHaveText('Position 2 of 3');
 await context.setOffline(false);
});

test('installed observation practice reloads from cached assets with no network', async ({page,context}) => {
 await page.setViewportSize({width:393,height:852});
 await page.goto('/');
 await page.evaluate(async () => {
   await navigator.serviceWorker.ready;
   const expected=['ver-chess-motifs.js','ver-chess-back-rank.js','ver-chess-observation-quiz.js','ver-chess-observation-practice.js','ver-chess-observation-practice.css'];
   const shellCaches=(await caches.keys()).filter(name=>name.startsWith('ver-chess-shell-'));
   if(shellCaches.length!==1)throw Error('Expected one active app-shell cache');
   const cache=await caches.open(shellCaches[0]);
   for(const asset of expected){
     if(!await cache.match(new URL(asset,location.href)))throw Error('Not precached: '+asset);
   }
 });
 await context.setOffline(true);
 try {
   await page.reload();
   await page.locator('[data-ver-nav="learn"]').click();
   const practice=page.locator('#verObservationPractice');
   await expect(practice).toBeVisible();
   await expect(practice.locator('#verObservationCount')).toHaveText('Position 1 of 3');
   await practice.locator('[data-answer="yes"]').click();
   await expect(practice.locator('#verObservationFeedback')).toContainText('Correct.');
 } finally {
   await context.setOffline(false);
 }
});


test('keyboard focus remains usable after a correct observation answer', async ({page}) => {
 await page.setViewportSize({width:393,height:852});
 await page.goto('/');
 await page.locator('[data-ver-nav="learn"]').click();
 const practice=page.locator('#verObservationPractice');
 await expect(practice).toBeVisible();
 await practice.locator('[data-answer="yes"]').focus();
 await page.keyboard.press('Enter');
 await expect(practice.locator('#verObservationFeedback')).toContainText('Correct.');
 await expect(practice.locator('#verObservationNext')).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(practice.locator('#verObservationCount')).toHaveText('Position 2 of 3');
 await expect(practice.locator('[data-answer="yes"]')).toBeFocused();
 await expect(practice.locator('[data-answer="yes"]')).toBeEnabled();
});


test('answer buttons expose the current question and position to assistive technology', async ({page}) => {
 await page.setViewportSize({width:393,height:852});
 await page.goto('/');
 await page.locator('[data-ver-nav="learn"]').click();
 const practice=page.locator('#verObservationPractice');
 const yes=practice.locator('[data-answer="yes"]');
 const no=practice.locator('[data-answer="no"]');
 await expect(yes).toHaveAttribute('aria-describedby','verObservationCount verObservationPrompt');
 await expect(no).toHaveAttribute('aria-describedby','verObservationCount verObservationPrompt');
 await expect(practice.locator('#verObservationCount')).toHaveText('Position 1 of 3');
 const firstPrompt=await practice.locator('#verObservationPrompt').textContent();
 expect(firstPrompt.trim().length).toBeGreaterThan(0);
 await yes.click();
 await practice.locator('#verObservationNext').click();
 await expect(practice.locator('#verObservationCount')).toHaveText('Position 2 of 3');
 await expect(yes).toBeFocused();
 await expect(yes).toHaveAttribute('aria-describedby','verObservationCount verObservationPrompt');
 const secondPrompt=await practice.locator('#verObservationPrompt').textContent();
 expect(secondPrompt.trim().length).toBeGreaterThan(0);
});


test('practice review reports first attempts without claiming chess accuracy and resets', async ({page}) => {
 await page.setViewportSize({width:393,height:852});
 await page.goto('/');
 await page.locator('[data-ver-nav="learn"]').click();
 const practice=page.locator('#verObservationPractice');
 const review=practice.locator('#verObservationReview');
 await expect(review).toBeEmpty();
 await practice.locator('[data-answer="no"]').click(); // first position: incorrect
 await practice.locator('[data-answer="yes"]').click();
 await practice.locator('#verObservationNext').click();
 await practice.locator('[data-answer="no"]').click(); // second position: correct
 await practice.locator('#verObservationNext').click();
 await practice.locator('[data-answer="no"]').click(); // third position: correct
 await expect(review).toContainText('2 of 3 positions correct on the first attempt');
 await expect(review).toContainText('not chess move accuracy');
 await practice.locator('#verObservationNext').click();
 await expect(review).toBeEmpty();
 await expect(practice.locator('#verObservationCount')).toHaveText('Position 1 of 3');
 await practice.locator('[data-answer="yes"]').click();
 await practice.locator('#verObservationNext').click();
 await practice.locator('[data-answer="no"]').click();
 await practice.locator('#verObservationNext').click();
 await practice.locator('[data-answer="no"]').click();
 await expect(review).toContainText('3 of 3 positions correct on the first attempt');
});
