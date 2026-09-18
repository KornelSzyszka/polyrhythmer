import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('polyrhythmer.preferences.v1'))
      localStorage.setItem(
        'polyrhythmer.preferences.v1',
        JSON.stringify({
          version: 1,
          language: 'pl',
          developerMode: false,
          visualMotion: 'pointer',
          activePaletteId: 'forest',
          palettes: [],
        }),
      );
  });
});

test('complete practice session persists and works offline', async ({ page, context }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.intro')).toHaveCount(0);
  await expect(page.locator('.section-tag')).toContainText('6 wspólnych kroków');
  await page.getByRole('button', { name: '5:4', exact: true }).click();
  await page.getByLabel('TEMPO', { exact: true }).fill('120');
  await page.getByLabel('TEMPO', { exact: true }).press('Tab');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pauza', exact: true })).toBeVisible();
  await page.locator('#subdivision').selectOption('3');
  await expect(page.locator('#subdivision')).toHaveValue('3');
  await page.getByRole('switch', { name: 'Dron tonalny' }).click();
  await page.locator('#root').selectOption('5');
  await page.getByRole('button', { name: 'Oś czasu', exact: true }).click();
  await page.getByRole('button', { name: 'Pauza', exact: true }).click();
  await expect(page.locator('#transport-status')).toContainText('Pauza');
  await expect(page.locator('#offline-status')).toContainText('Gotowy offline');
  await page.reload();
  await expect(page.locator('#bpm')).toHaveValue('120');
  await expect(page.getByRole('switch', { name: 'Dron tonalny' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(page.locator('#root')).toHaveValue('5');
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#offline-status')).toContainText('Tryb offline');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.locator('#transport-status')).toContainText('Odtwarzanie');
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  expect(errors).toEqual([]);
});

test('layer limits, validation, help and mobile layout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.layer')).toHaveCount(4);
  await expect(page.locator('.layer-switch')).toHaveCount(4);
  await expect(page.locator('.layer-switch').nth(2)).toHaveAttribute('aria-checked', 'false');
  await page.locator('.layer-switch').nth(2).click();
  await page.getByLabel('Uderzenia warstwy 3').fill('6');
  await page.getByLabel('Uderzenia warstwy 3').press('Tab');
  await expect(page.locator('#visual svg')).toHaveAttribute('aria-label', /3:2:6/);
  await page.reload();
  await expect(page.locator('.layer')).toHaveCount(4);
  await expect(page.locator('.layer-switch').nth(2)).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByLabel('Uderzenia warstwy 3')).toHaveValue('6');
  await page.locator('#bpm').fill('301');
  await page.locator('#bpm').press('Tab');
  await expect(page.locator('#tempo-error')).toContainText('20 do 300');
  await page.locator('#bpm').fill('80');
  await page.locator('#bpm').press('Tab');
  await expect(page.locator('#tempo-error')).toBeEmpty();
  await page.getByRole('button', { name: 'Jak korzystać' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
});

test('compact layer panel keeps a fixed size for four layers', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/');

  const panel = page.locator('.rhythm-panel');
  const initialBox = await panel.boundingBox();
  expect(initialBox).not.toBeNull();
  await expect(page.locator('.layer')).toHaveCount(4);
  const fourLayerBox = await panel.boundingBox();
  expect(fourLayerBox).not.toBeNull();
  expect(fourLayerBox!.width).toBe(initialBox!.width);
  expect(fourLayerBox!.height).toBe(initialBox!.height);

  for (let index = 1; index <= 4; index++) {
    await expect(page.getByLabel(`Kolor warstwy ${index}`)).toBeVisible();
    await expect(page.getByLabel(`Uderzenia warstwy ${index}`)).toBeVisible();
  }
  await expect(panel.getByLabel(/Wycisz warstwę/)).toHaveCount(0);
  await expect(panel.getByLabel(/Solo warstwy/)).toHaveCount(0);
  await expect(panel.getByRole('switch')).toHaveCount(4);
  await expect(panel.getByRole('button', { name: 'Dodaj warstwę' })).toHaveCount(0);
  await expect(panel.getByLabel(/Usuń warstwę/)).toHaveCount(0);
  const firstLayerBox = await page.locator('.layer').first().boundingBox();
  const firstSwitchBox = await panel.getByRole('switch').first().boundingBox();
  expect(firstLayerBox).not.toBeNull();
  expect(firstSwitchBox).not.toBeNull();
  expect(
    Math.abs(firstLayerBox!.x + firstLayerBox!.width - firstSwitchBox!.x - firstSwitchBox!.width),
  ).toBeLessThanOrEqual(1);
  await expect(panel.getByLabel(/Przesuń warstwę/)).toHaveCount(0);
  await expect(
    panel.locator('[id^="sound-"], [id^="gain-"], [id^="accent-"], [id^="pan-"]'),
  ).toHaveCount(0);

  await expect(page.getByLabel('Uderzenia warstwy 1')).toBeVisible();
  await expect(page.locator('.layer')).toHaveCount(4);
  await page.reload();
  await expect(page.locator('.layer')).toHaveCount(4);
  await expect(panel.getByRole('switch')).toHaveCount(4);
  expect(await panel.evaluate((element) => element.scrollHeight <= element.clientHeight)).toBe(
    true,
  );
  await page.screenshot({ path: 'test-results/compact-layers.png', fullPage: true });
});

test('desktop panels are equal and visible spacing follows the golden scale', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/');

  const instrumentBox = await page.locator('.instrument').boundingBox();
  const rhythmBox = await page.locator('.rhythm-panel').boundingBox();
  expect(instrumentBox).not.toBeNull();
  expect(rhythmBox).not.toBeNull();
  expect.soft(Math.abs(instrumentBox!.height - rhythmBox!.height)).toBeLessThanOrEqual(1);
  expect(
    await page
      .locator('.instrument')
      .evaluate((element) => element.scrollHeight <= element.clientHeight),
  ).toBe(true);

  const spacingViolations = await page.evaluate(() => {
    const rootStyle = getComputedStyle(document.documentElement);
    const tokenNames = [
      '--space-3xs',
      '--space-2xs',
      '--space-xs',
      '--space-sm',
      '--space-md',
      '--space-lg',
      '--space-xl',
      '--space-2xl',
    ];
    const allowed = [
      0,
      ...tokenNames.map((name) => Number.parseFloat(rootStyle.getPropertyValue(name))),
    ];
    const properties = [
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'rowGap',
      'columnGap',
    ] as const;

    return [...document.querySelectorAll<HTMLElement>('.shell, .shell *')]
      .filter((element) => element.getClientRects().length > 0)
      .flatMap((element) => {
        const style = getComputedStyle(element);
        const selector = `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${[...element.classList].map((name) => `.${name}`).join('')}`;
        return properties.flatMap((property) => {
          const isAutoCenteringMargin =
            (property === 'marginLeft' || property === 'marginRight') &&
            element.matches('.shell, #visual');
          if (isAutoCenteringMargin) return [];
          const value = Number.parseFloat(style[property]);
          if (!Number.isFinite(value)) return [];
          const matchesToken = allowed.some((token) => Math.abs(Math.abs(value) - token) <= 0.02);
          return matchesToken ? [] : [{ selector, property, value }];
        });
      });
  });

  expect(spacingViolations).toEqual([]);
});

test('layer colors and enabled state persist across fixed slots', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Kolor warstwy 1').fill('#ff00aa');
  await expect(page.locator('.visual-legend span').first()).toHaveAttribute('style', /#ff00aa/);
  await expect(page.locator('#visual svg')).toContainText('3:2');

  await page.reload();
  await expect(page.getByLabel('Kolor warstwy 1')).toHaveValue('#ff00aa');
  await expect(page.getByLabel('Uderzenia warstwy 1')).toHaveValue('3');

  await page.locator('.layer-switch').nth(2).click();
  await page.getByLabel('Kolor warstwy 3').fill('#00aaff');
  await page.reload();
  await expect(page.locator('.layer-switch').nth(2)).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByLabel('Kolor warstwy 3')).toHaveValue('#00aaff');
});

test('note colours and timbres persist while harmony reacts in every visual view', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('switch', { name: 'Dron tonalny' }).click();
  await page.locator('#root').selectOption('0');
  await page.locator('#chord').selectOption('triad');
  await page.locator('.note-palette summary').click();
  await expect(page.locator('.note-palette')).toHaveAttribute('open', '');
  await page.getByLabel('Kolor nuty C', { exact: true }).fill('#22aaff');
  await expect(page.locator('.note-palette')).toHaveAttribute('open', '');
  await page.getByLabel('Barwa nuty C', { exact: true }).selectOption('sawtooth');

  await expect(page.locator('#visual .radial-harmony')).toHaveCount(1);
  await expect(page.locator('#visual [id^="harmony-note-"]')).toHaveCount(3);
  const restingTransform = await page.locator('#visual #harmony-field').getAttribute('transform');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pauza', exact: true })).toBeVisible();
  await expect
    .poll(() => page.locator('#visual #harmony-field').getAttribute('transform'))
    .not.toBe(restingTransform);
  await page.screenshot({ path: 'test-results/harmony-circle.png', fullPage: true });

  await page.getByRole('button', { name: 'Oś czasu', exact: true }).click();
  await expect(page.locator('#visual .harmony-aurora')).toHaveCount(3);
  await expect(page.locator('#visual #harmony-focus')).toHaveAttribute('fill', /#[0-9a-f]{6}/);
  await page.screenshot({ path: 'test-results/harmony-timeline.png', fullPage: true });

  await page.getByRole('button', { name: 'Wielokąty', exact: true }).click();
  await expect(page.locator('#visual .radial-harmony')).toHaveCount(1);
  await page.screenshot({ path: 'test-results/harmony-polygons.png', fullPage: true });
  await page.locator('#stop').click();
  await page.reload();
  await page.locator('.note-palette summary').click();
  await expect(page.getByLabel('Kolor nuty C', { exact: true })).toHaveValue('#22aaff');
  await expect(page.getByLabel('Barwa nuty C', { exact: true })).toHaveValue('sawtooth');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/harmony-mobile-390.png', fullPage: true });
  await page.setViewportSize({ width: 320, height: 720 });
  await page.screenshot({ path: 'test-results/harmony-mobile-320.png', fullPage: true });
});

test('visual motion switches between one pointer and smooth layer runners in every view', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Wskazówka', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Kropki', exact: true }).click();
  await expect(page.locator('#visual .visual-runner')).toHaveCount(2);
  await expect(page.locator('#visual [id$="-head"]')).toHaveCount(0);
  const firstRunner = page.locator('#visual .visual-runner').first();
  const before = `${await firstRunner.getAttribute('cx')}:${await firstRunner.getAttribute('cy')}`;
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect
    .poll(
      async () => `${await firstRunner.getAttribute('cx')}:${await firstRunner.getAttribute('cy')}`,
    )
    .not.toBe(before);
  await page.getByRole('button', { name: 'Pauza', exact: true }).click();
  await page.getByRole('button', { name: 'Oś czasu', exact: true }).click();
  await expect(page.locator('#visual .visual-runner')).toHaveCount(2);
  await page.getByRole('button', { name: 'Wielokąty', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Wielokąty', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('#visual svg')).toHaveAttribute('aria-label', 'Wielokąty rytmu 3:2');
  await expect(page.locator('#visual .polygon-layer')).toHaveCount(2);
  await expect(page.locator('#visual [data-beat]')).toHaveCount(5);
  await expect(page.locator('#visual .visual-runner')).toHaveCount(2);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Kropki', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Wielokąty', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.screenshot({ path: 'test-results/polygons.png', fullPage: true });
});

test('support subdivision updates its visual dots without changing layer beats', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('#visual .subdivision-marker')).toHaveCount(0);
  await expect(page.locator('#visual [data-beat]')).toHaveCount(5);

  await page.locator('#subdivision').selectOption('3');
  await expect(page.locator('#visual .subdivision-marker')).toHaveCount(12);
  await expect(page.locator('#visual .subdivision-accent')).toHaveCount(4);
  await expect(page.locator('#visual [data-beat]')).toHaveCount(5);

  await page.locator('#subdivision').selectOption('2');
  await expect(page.locator('#visual .subdivision-marker')).toHaveCount(8);
  await expect(page.locator('#visual .subdivision-accent')).toHaveCount(4);
});

test('legacy appearance preferences default safely to the pointer', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'polyrhythmer.preferences.v1',
      JSON.stringify({
        version: 1,
        language: 'pl',
        developerMode: true,
        activePaletteId: 'forest',
        palettes: [],
      }),
    ),
  );
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Wskazówka', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Przełącz tryb deweloperski' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('developer palettes persist and do not interrupt transport', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Palety wyglądu' })).toBeVisible();
  await page.getByRole('button', { name: 'Przełącz tryb deweloperski' }).click();
  await expect(page.getByRole('button', { name: 'Przełącz tryb deweloperski' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Palety wyglądu' }).click();
  await page.locator('#palette-name').fill('Moja paleta');
  await page.locator('#palette-accent').fill('#ff00aa');
  await page.getByRole('button', { name: 'Zapisz paletę' }).click();
  await expect(page.getByRole('button', { name: 'Pauza', exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-palette', /^custom-/);
  await page.reload();
  await page.getByRole('button', { name: 'Palety wyglądu' }).click();
  const customRow = page.locator('.palette-row').filter({ hasText: 'Moja paleta' });
  await expect(customRow).toBeVisible();
  await customRow.getByRole('button', { name: 'Wybierz paletę Moja paleta' }).click();
  await expect(page.locator('#palette-accent')).toHaveValue('#ff00aa');
  await customRow.getByRole('button', { name: 'Edytuj' }).click();
  await page.locator('#palette-name').fill('Poprawiona paleta');
  await page.getByRole('button', { name: 'Zapisz paletę' }).click();
  await expect(page.locator('.palette-row').filter({ hasText: 'Poprawiona paleta' })).toBeVisible();
  await page
    .locator('.palette-row')
    .filter({ hasText: 'Poprawiona paleta' })
    .getByRole('button', { name: 'Usuń' })
    .click();
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'forest');
});

test('high-contrast palette updates CSS and SVG without interrupting playback', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.getByRole('button', { name: 'Palety wyglądu' }).click();
  await page.getByRole('button', { name: 'Wybierz paletę Wysoki kontrast' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'high-contrast');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  await expect(page.locator('#visual #circle-head circle')).toHaveAttribute('fill', '#ffffff');
  await expect(page.getByRole('button', { name: 'Pauza', exact: true })).toBeVisible();
});

test('palette names ask before overwriting an existing custom palette', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Palety wyglądu' }).click();
  await page.locator('#palette-name').fill('Duplikat');
  await page.locator('#palette-accent').fill('#112233');
  await page.getByRole('button', { name: 'Zapisz paletę' }).click();
  await page.locator('#palette-name').fill('Duplikat');
  await page.locator('#palette-accent').fill('#332211');
  page.once('dialog', (dialog) => {
    expect(dialog.message()).toContain('już istnieje');
    void dialog.accept();
  });
  await page.getByRole('button', { name: 'Zapisz paletę' }).click();
  await expect(page.locator('.palette-row').filter({ hasText: 'Duplikat' })).toHaveCount(1);
  await expect(page.locator('html')).toHaveAttribute('data-palette', /^custom-/);
});

test('corrupt storage recovers and unavailable storage does not crash', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('polyrhythmer.session.v1', '{broken'));
  await page.goto('/');
  await expect(page.locator('#message')).toContainText('Przywrócono');
  await expect(page.locator('#bpm')).toHaveValue('90');
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error('denied');
    };
  });
  await page.getByRole('button', { name: '7:5', exact: true }).click();
  await expect(page.locator('#message')).toContainText('Zapis lokalny jest niedostępny');
});

test('real audio nodes are released after repeated transport and drone changes', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const create = AudioContext.prototype.createOscillator;
    const stats = { active: 0, peak: 0, starts: [] as number[] };
    (window as unknown as { audioStats: typeof stats }).audioStats = stats;
    AudioContext.prototype.createOscillator = function () {
      const oscillator = create.call(this);
      stats.active++;
      stats.peak = Math.max(stats.peak, stats.active);
      oscillator.addEventListener('ended', () => stats.active--);
      const start = oscillator.start.bind(oscillator);
      oscillator.start = (when = 0) => {
        stats.starts.push(when);
        start(when);
      };
      return oscillator;
    };
  });
  await page.goto('/');
  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: 'Start', exact: true }).click();
    await page.getByRole('switch', { name: 'Dron tonalny' }).click();
    await page.locator('#root').selectOption(String(i));
    await page.getByRole('button', { name: '5:4', exact: true }).click();
    await page.getByRole('button', { name: 'Stop', exact: true }).click();
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as unknown as { audioStats: { active: number } }).audioStats.active,
        ),
      )
      .toBe(0);
  }
  const stats = await page.evaluate(
    () => (window as unknown as { audioStats: { starts: number[]; peak: number } }).audioStats,
  );
  expect(stats.starts.some((t) => t > 0)).toBe(true);
  expect(stats.peak).toBeLessThan(25);
});

test('desktop screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/');
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: true });
});
