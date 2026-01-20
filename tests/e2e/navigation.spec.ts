import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('can navigate from splash to blog', async ({ page }) => {
    await page.goto('/');

    // Press Enter to continue
    await page.keyboard.press('Enter');

    // Should be on blog page
    await expect(page).toHaveURL('/blog');
    await expect(page.locator('h1')).toContainText('blog');
  });

  test('navigation links work', async ({ page }) => {
    await page.goto('/blog');

    // Click on projects link
    await page.click('a[href="/projects"]');
    await expect(page).toHaveURL('/projects');

    // Click on about link
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL('/about');

    // Click on home link
    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/');
  });

  test('404 page shows for invalid routes', async ({ page }) => {
    await page.goto('/invalid-route');

    await expect(page.locator('h1')).toContainText('Not Found');
  });

  test('theme toggle works', async ({ page }) => {
    await page.goto('/blog');

    // Get initial theme
    const initialTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );

    // Click theme toggle
    await page.click('.theme-toggle');

    // Theme should change
    const newTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );

    expect(newTheme).not.toBe(initialTheme);
  });
});
