import { expect, test } from '@playwright/test';

test('click sound section stays compact and persists its sound profile', async ({ page }) => {
  await page.goto('/');

  const section = page.locator('#click-settings');
  await expect(section).toBeVisible();
  await expect(page.locator('#click-sound')).toHaveValue('soft');

  await section.click();
  await expect(page.locator('#click-dialog')).toBeVisible();
  await page.locator('#click-pitch').fill('3');
  await page.locator('#click-pitch').dispatchEvent('input');
  await page.locator('#click-variation').fill('24');
  await page.locator('#click-variation').dispatchEvent('input');
  await page.locator('#click-sound').selectOption('glass');
  await page.reload();

  await expect(page.locator('#click-sound')).toHaveValue('glass');
  await expect(page.locator('#click-pitch')).toHaveValue('3');
  await expect(page.locator('#click-variation')).toHaveValue('24');
});
