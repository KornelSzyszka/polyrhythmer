import { expect, test } from '@playwright/test';

test('English is the default and each supported language persists without pausing playback', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: 'Find the common pulse.' })).toBeVisible();
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();

  for (const language of ['pl', 'en', 'de', 'it', 'es', 'pt-BR']) {
    await page.locator('#language').selectOption(language);
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(page.locator('#language')).toHaveValue(language);
    await expect(page.locator('#play')).toContainText(language === 'pl' ? 'Pauza' : language === 'en' ? 'Pause' : /.*/);
  }

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.locator('#language')).toHaveValue('pt-BR');
});
