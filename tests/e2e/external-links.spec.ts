import { test, expect } from '@playwright/test';

test.describe('External Link Handler', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
    await page.evaluate(() => localStorage.clear());
  });

  test('external link shows confirmation dialog', async ({ page }) => {
    await page.goto('/about');

    // Wait for the page to hydrate
    await page.waitForSelector('a[data-external="true"]');

    // Click the first external link
    await page.click('a[data-external="true"]');

    // Assert dialog is visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Assert domain is shown in dialog
    await expect(
      page.locator('.external-link-confirmation-domain')
    ).toContainText('github.com');
  });

  test('cancel closes dialog and restores focus', async ({ page }) => {
    await page.goto('/about');

    // Wait for the page to hydrate
    await page.waitForSelector('a[data-external="true"]');

    // Get the external link element
    const externalLink = page.locator('a[data-external="true"]').first();

    // Click the external link
    await externalLink.click();

    // Assert dialog is visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Click "Go Back" button
    await page.click('button:has-text("Go Back")');

    // Assert dialog is hidden
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Assert the original link is focused
    await expect(externalLink).toBeFocused();
  });

  test('continue opens external URL in new tab', async ({ page, context }) => {
    await page.goto('/about');
    await page.waitForSelector('a[data-external="true"]');

    await page.click('a[data-external="true"]');
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    const popupPromise = context.waitForEvent('page');
    await page.click('button:has-text("Continue")');

    const popup = await popupPromise;
    expect(popup).toBeDefined();

    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    await popup.close();
  });

  test('"don\'t ask again" stores preference in localStorage', async ({
    page,
    context,
  }) => {
    await page.goto('/about');
    await page.waitForSelector('a[data-external="true"]');

    await page.click('a[data-external="true"]');
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await page.check('input[type="checkbox"]');

    const popupPromise = context.waitForEvent('page');
    await page.click('button:has-text("Continue")');
    const popup = await popupPromise;
    await popup.close();

    const localStorageValue = await page.evaluate(() =>
      localStorage.getItem('external-link-no-confirm')
    );
    expect(localStorageValue).toBe('true');

    await page.click('a[data-external="true"]');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('escape key closes dialog', async ({ page }) => {
    await page.goto('/about');

    // Wait for the page to hydrate
    await page.waitForSelector('a[data-external="true"]');

    // Click the external link
    await page.click('a[data-external="true"]');

    // Assert dialog is visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Press Escape key
    await page.keyboard.press('Escape');

    // Assert dialog is hidden
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('internal links are unaffected', async ({ page }) => {
    await page.goto('/blog');

    // Wait for navigation links to be available
    await page.waitForSelector('a[href="/projects"]');

    // Click an internal navigation link
    await page.click('a[href="/projects"]');

    // Assert no dialog appears
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Assert navigation occurred
    await expect(page).toHaveURL('/projects');
  });

  test('focus trap within dialog', async ({ page }) => {
    await page.goto('/about');

    // Wait for the page to hydrate
    await page.waitForSelector('a[data-external="true"]');

    // Click the external link
    await page.click('a[data-external="true"]');

    // Assert dialog is visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Get all focusable elements within the dialog
    const focusableElements = page.locator(
      '[role="dialog"] button, [role="dialog"] input'
    );
    const count = await focusableElements.count();

    // Verify there are focusable elements
    expect(count).toBeGreaterThan(0);

    // Tab through elements and verify focus stays within dialog
    for (let i = 0; i < count + 1; i++) {
      await page.keyboard.press('Tab');

      const isInDialog = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        const focused = document.activeElement;
        return dialog && dialog.contains(focused);
      });

      expect(isInDialog).toBe(true);
    }

    // Test Shift+Tab wraps from first element to last
    await page.keyboard.press('Shift+Tab');

    const focusedAfterShiftTab = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const focused = document.activeElement;
      return dialog && dialog.contains(focused);
    });

    expect(focusedAfterShiftTab).toBe(true);
  });
});
