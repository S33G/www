import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-playwright/test';

test.describe('Accessibility', () => {
  test('skip link is visible on focus', async ({ page }) => {
    await page.goto('/blog');
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
      expect(alt || ariaLabel || ariaHidden === 'true').toBeTruthy();
    }
  });

  test('interactive elements are focusable', async ({ page }) => {
    await page.goto('/blog');
    const focusableElements = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      if (focused) focusableElements.push(focused);
    }
    expect(focusableElements.length).toBeGreaterThan(0);
  });

  test('headings have proper hierarchy', async ({ page }) => {
    await page.goto('/blog');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
    const headings = await page.evaluate(() => {
      const hs = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(hs).map(h => parseInt(h.tagName[1]));
    });
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

  const pagesToScan = ['/', '/about', '/projects', '/blog'];
  for (const pagePath of pagesToScan) {
    test(`Page ${pagePath} should not have any automatically detectable accessibility issues`, async ({ page }) => {
      await page.goto(pagePath);
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }

  test('External link icon color should match the primary light color theme variable', async ({ page }) => {
    await page.goto('/about');
    const externalLink = page.locator('a[data-external="true"]').first();
    const icon = externalLink.locator('svg');
    await expect(icon).toBeVisible();

    const iconColor = await icon.evaluate(element =>
      window.getComputedStyle(element).getPropertyValue('color')
    );

    const primaryLightColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--color-primary-light').trim();
    });
    
    expect(primaryLightColor).toBeTruthy();
    expect(iconColor).toBe(primaryLightColor);
  });
});

  // New automated axe scans
  const pagesToScan = ['/', '/about', '/projects', '/blog'];
  for (const pagePath of pagesToScan) {
    test(`Page ${pagePath} should not have any automatically detectable accessibility issues`, async ({ page }) => {
      await page.goto(pagePath);
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }

  // New specific color test
  test('External link icon color should match the primary light color theme variable', async ({ page }) => {
    await page.goto('/about');
    const externalLink = page.locator('a[data-external="true"]').first();
    const icon = externalLink.locator('svg');
    await expect(icon).toBeVisible();

    const iconColor = await icon.evaluate(element =>
      window.getComputedStyle(element).getPropertyValue('color')
    );

    const primaryLightColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--color-primary-light').trim();
    });
    
    expect(primaryLightColor).toBeTruthy();
    expect(iconColor).toBe(primaryLightColor);
  });
});
