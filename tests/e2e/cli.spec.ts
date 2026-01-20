import { test, expect } from '@playwright/test';

test.describe('CLI', () => {
  test('can type commands in CLI', async ({ page }) => {
    await page.goto('/blog');

    // Focus CLI input
    const cliInput = page.locator('.cli-input');
    await cliInput.focus();

    // Type help command
    await cliInput.fill('help');
    await page.keyboard.press('Enter');

    // Should show help output
    await expect(page.locator('.cli-output')).toContainText('AVAILABLE COMMANDS');
  });

  test('ls command lists content', async ({ page }) => {
    await page.goto('/blog');

    const cliInput = page.locator('.cli-input');
    await cliInput.focus();
    await cliInput.fill('ls');
    await page.keyboard.press('Enter');

    // Should show directory listing
    await expect(page.locator('.cli-output')).toContainText('blog');
  });

  test('clear command clears output', async ({ page }) => {
    await page.goto('/blog');

    const cliInput = page.locator('.cli-input');
    await cliInput.focus();

    // Add some output
    await cliInput.fill('help');
    await page.keyboard.press('Enter');

    // Clear
    await cliInput.fill('clear');
    await page.keyboard.press('Enter');

    // Output should be cleared (only command line items)
    const outputLines = await page.locator('.cli-output-line').count();
    expect(outputLines).toBe(0);
  });

  test('unknown command shows error', async ({ page }) => {
    await page.goto('/blog');

    const cliInput = page.locator('.cli-input');
    await cliInput.focus();
    await cliInput.fill('invalidcmd');
    await page.keyboard.press('Enter');

    // Should show error
    await expect(page.locator('.cli-output-line--error')).toContainText('Command not found');
  });

  test('arrow keys navigate history', async ({ page }) => {
    await page.goto('/blog');

    const cliInput = page.locator('.cli-input');
    await cliInput.focus();

    // Type commands
    await cliInput.fill('help');
    await page.keyboard.press('Enter');
    await cliInput.fill('ls');
    await page.keyboard.press('Enter');

    // Navigate up
    await page.keyboard.press('ArrowUp');
    await expect(cliInput).toHaveValue('ls');

    await page.keyboard.press('ArrowUp');
    await expect(cliInput).toHaveValue('help');

    // Navigate down
    await page.keyboard.press('ArrowDown');
    await expect(cliInput).toHaveValue('ls');
  });

  test('whoami shows info', async ({ page }) => {
    await page.goto('/blog');

    const cliInput = page.locator('.cli-input');
    await cliInput.focus();
    await cliInput.fill('whoami');
    await page.keyboard.press('Enter');

    // Should show bio info
    await expect(page.locator('.cli-output')).toContainText('Developer');
  });
});
