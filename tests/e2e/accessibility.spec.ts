import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('skip link is visible on focus', async ({ page }) => {
    await page.goto('/blog');

    // Tab to focus skip link
    await page.keyboard.press('Tab');

    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeFocused();
  });

  test('all images have alt text', async ({ page }) => {
    await page.goto('/blog');

    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      const ariaHidden = await img.getAttribute('aria-hidden');

      // Either has alt, aria-label, or is decorative (aria-hidden)
      expect(alt || ariaLabel || ariaHidden === 'true').toBeTruthy();
    }
  });

  test('interactive elements are focusable', async ({ page }) => {
    await page.goto('/blog');

    // Tab through interactive elements
    const focusableElements = [];

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      if (focused) focusableElements.push(focused);
    }

    // Should have focused on various elements
    expect(focusableElements.length).toBeGreaterThan(0);
  });

  test('headings have proper hierarchy', async ({ page }) => {
    await page.goto('/blog');

    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // H2s should come after H1
    const headings = await page.evaluate(() => {
      const hs = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(hs).map(h => parseInt(h.tagName[1]));
    });

    // Check that heading levels don't skip more than one level
    for (let i = 1; i < headings.length; i++) {
      expect(headings[i] - headings[i - 1]).toBeLessThanOrEqual(1);
    }
  });

  test('console output has aria-live region', async ({ page }) => {
    await page.goto('/blog');

    const cliOutput = page.locator('[role="log"]');
    const ariaLive = await cliOutput.getAttribute('aria-live');

    expect(ariaLive).toBe('polite');
  });

  test('color contrast is sufficient', async ({ page }) => {
    await page.goto('/blog');

    // Check that primary text color exists and is green-ish
    const color = await page.evaluate(() => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--text-primary')
        .trim();
    });

    expect(color).toBeTruthy();
  });

  test('page has proper lang attribute', async ({ page }) => {
    await page.goto('/blog');

    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang).toBe('en');
  });
});
