import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-playwright/test';

test.describe('Accessibility', () => {
  const pages = ['/', '/about', '/projects', '/blog'];

  for (const pagePath of pages) {
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

