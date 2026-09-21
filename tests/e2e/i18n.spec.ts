import { expect, test } from '@playwright/test';

test('English is the default and each supported language persists without pausing playback', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.intro')).toHaveCount(0);
  await expect(page.locator('.section-tag')).toContainText('6 common steps');
  await expect(page.locator('#mode')).toContainText('Minor');
  await expect(page.locator('#chord')).toContainText('Triad');
  await expect(page.locator('.beat-stepper').first()).toContainText('beats / cycle');
  await expect(page.locator('.event-details summary')).not.toContainText('common steps');
  await expect(page.locator('#cycle-counter')).toContainText('CYCLE 01');
  const textArtifacts =
    (await page.locator('body').innerText()).match(/[^\n]*[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ][^\n]*/g) ?? [];
  expect(textArtifacts).toEqual([]);
  await page.getByRole('button', { name: 'How it works' }).click();
  const helpArtifacts =
    (await page.getByRole('dialog').innerText()).match(/[^\n]*[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ][^\n]*/g) ?? [];
  expect(helpArtifacts).toEqual([]);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Appearance settings' }).click();
  const paletteArtifacts =
    (await page.getByRole('dialog').innerText()).match(/[^\n]*[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ][^\n]*/g) ?? [];
  expect(paletteArtifacts).toEqual([]);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();

  for (const language of ['pl', 'en', 'de', 'it', 'es', 'pt-BR']) {
    await page.locator('#language').selectOption(language);
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(page.locator('#language')).toHaveValue(language);
    await expect(page.locator('#play')).toContainText(
      language === 'pl' ? 'Pauza' : language === 'en' ? 'Pause' : /.*/,
    );
    if (language === 'en') {
      const artifacts =
        (await page.locator('body').innerText()).match(/[^\n]*[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ][^\n]*/g) ?? [];
      expect(artifacts).toEqual([]);
    }
  }

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.locator('#language')).toHaveValue('pt-BR');
});

test('English uses a Union Jack and a restrained keyboard focus', async ({ page }) => {
  await page.goto('/');

  const flagStyle = await page.locator('.language-flag-gb').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundImage: style.backgroundImage,
      height: style.height,
      width: style.width,
    };
  });
  expect(flagStyle.backgroundImage).toContain('data:image/svg+xml');
  expect(flagStyle.backgroundImage).toContain('%23012169');
  expect(flagStyle.backgroundImage).toContain('%23c8102e');
  expect(flagStyle).toMatchObject({ height: '10px', width: '20px' });

  await page.locator('#language').focus();
  const focusStyle = await page.locator('#language').evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineOffset: style.outlineOffset, outlineWidth: style.outlineWidth };
  });
  expect(focusStyle).toEqual({ outlineOffset: '1px', outlineWidth: '1px' });
  await page.screenshot({ path: 'test-results/language-en.png' });
});
