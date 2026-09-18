import { test, expect } from '@playwright/test';

test('complete practice session persists and works offline', async ({ page, context }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Znajdź wspólny puls.' })).toBeVisible();
  await page.getByRole('button',{name:'5:4',exact:true}).click();
  await page.getByLabel('TEMPO', {exact:true}).fill('120');
  await page.getByLabel('TEMPO', {exact:true}).press('Tab');
  await page.getByRole('button',{name:'Start',exact:true}).click();
  await expect(page.getByRole('button',{name:'Pauza',exact:true})).toBeVisible();
  await page.locator('#subdivision').selectOption('3');
  await expect(page.locator('#subdivision')).toHaveValue('3');
  await page.getByRole('button',{name:'Wycisz warstwę 1',exact:true}).click();
  await page.getByRole('switch',{name:'Dron tonalny'}).click();
  await page.locator('#root').selectOption('5');
  await page.getByRole('button',{name:'Oś czasu',exact:true}).click();
  await page.getByRole('button',{name:'Pauza',exact:true}).click();
  await expect(page.locator('#transport-status')).toContainText('Pauza');
  await expect(page.locator('#offline-status')).toContainText('Gotowy offline');
  await page.reload();
  await expect(page.locator('#bpm')).toHaveValue('120');
  await expect(page.getByRole('button',{name:'Wycisz warstwę 1',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.getByRole('switch',{name:'Dron tonalny'})).toHaveAttribute('aria-checked','true');
  await expect(page.locator('#root')).toHaveValue('5');
  await expect(page.getByRole('button',{name:'Start',exact:true})).toBeVisible();
  await context.setOffline(true); await page.reload();
  await expect(page.locator('#offline-status')).toContainText('Tryb offline');
  await page.getByRole('button',{name:'Start',exact:true}).click();
  await expect(page.locator('#transport-status')).toContainText('Odtwarzanie');
  await page.getByRole('button',{name:'Stop',exact:true}).click();
  expect(errors).toEqual([]);
});

test('layer limits, validation, help and mobile layout', async ({page}) => {
  await page.setViewportSize({width:390,height:844}); await page.goto('/');
  for (let i = 0; i < 10; i++) await page.getByRole('button',{name:'Dodaj warstwę'}).click();
  await expect(page.getByRole('button',{name:'Dodaj warstwę'})).toBeDisabled();
  await expect(page.locator('.layer-tab')).toHaveCount(3);
  await expect(page.locator('.layer-tab').nth(2)).toHaveAttribute('aria-selected', 'true');
  await page.locator('.layer-tab').nth(1).click();
  await expect(page.getByLabel('Uderzenia warstwy 5')).toBeVisible();
  await page.getByRole('button',{name:'Więcej uderzeń warstwy 5'}).click();
  await expect(page.getByLabel('Uderzenia warstwy 5')).toHaveValue('6');
  await page.reload();
  await expect(page.locator('.layer-tab')).toHaveCount(3);
  await expect(page.locator('.layer-tab').first()).toHaveAttribute('aria-selected', 'true');
  await page.locator('.layer-tab').nth(1).click();
  await expect(page.getByLabel('Uderzenia warstwy 5')).toHaveValue('6');
  await page.locator('#bpm').fill('301'); await page.locator('#bpm').press('Tab');
  await expect(page.locator('#tempo-error')).toContainText('20 do 300');
  await page.locator('#bpm').fill('80'); await page.locator('#bpm').press('Tab');
  await expect(page.locator('#tempo-error')).toBeEmpty();
  await page.getByRole('button',{name:'Jak korzystać'}).click();
  await expect(page.getByRole('dialog')).toBeVisible(); await page.keyboard.press('Escape');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/mobile.png',fullPage:true});
});

test('layer color and order persist, including moves between tabs', async ({page}) => {
  await page.goto('/');
  await page.getByLabel('Kolor warstwy 1').fill('#ff00aa');
  await expect(page.locator('.visual-legend span').first()).toHaveAttribute('style', /#ff00aa/);
  await expect(page.locator('#visual svg')).toContainText('3:2');

  await expect(page.getByRole('button',{name:'Przesuń warstwę 1 wyżej'})).toBeDisabled();
  await page.getByRole('button',{name:'Przesuń warstwę 1 niżej'}).click();
  await expect(page.getByLabel('Uderzenia warstwy 1')).toHaveValue('2');
  await expect(page.getByLabel('Uderzenia warstwy 2')).toHaveValue('3');
  await expect(page.getByLabel('Kolor warstwy 2')).toHaveValue('#ff00aa');
  await expect(page.locator('#visual svg')).toHaveAttribute('aria-label', /2:3/);

  await page.reload();
  await expect(page.getByLabel('Kolor warstwy 2')).toHaveValue('#ff00aa');
  await expect(page.getByLabel('Uderzenia warstwy 2')).toHaveValue('3');

  for (let i = 0; i < 3; i++) await page.getByRole('button',{name:'Dodaj warstwę'}).click();
  await page.locator('.layer-tab').first().click();
  await page.getByRole('button',{name:'Przesuń warstwę 2 niżej'}).click();
  await page.getByRole('button',{name:'Przesuń warstwę 3 niżej'}).click();
  await page.getByRole('button',{name:'Przesuń warstwę 4 niżej'}).click();
  await expect(page.locator('.layer-tab').nth(1)).toHaveAttribute('aria-selected','true');
  await expect(page.getByLabel('Kolor warstwy 5')).toHaveValue('#ff00aa');
});

test('visual motion switches between one pointer and smooth layer runners in every view', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('button',{name:'Wskazówka',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Kropki',exact:true}).click();
  await expect(page.locator('#visual .visual-runner')).toHaveCount(2);
  await expect(page.locator('#visual [id$="-head"]')).toHaveCount(0);
  const firstRunner = page.locator('#visual .visual-runner').first();
  const before = `${await firstRunner.getAttribute('cx')}:${await firstRunner.getAttribute('cy')}`;
  await page.getByRole('button',{name:'Start',exact:true}).click();
  await expect.poll(async () => `${await firstRunner.getAttribute('cx')}:${await firstRunner.getAttribute('cy')}`).not.toBe(before);
  await page.getByRole('button',{name:'Pauza',exact:true}).click();
  await page.getByRole('button',{name:'Oś czasu',exact:true}).click();
  await expect(page.locator('#visual .visual-runner')).toHaveCount(2);
  await page.getByRole('button',{name:'Wielokąty',exact:true}).click();
  await expect(page.getByRole('button',{name:'Wielokąty',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#visual svg')).toHaveAttribute('aria-label','Wielokąty rytmu 3:2');
  await expect(page.locator('#visual .polygon-layer')).toHaveCount(2);
  await expect(page.locator('#visual [data-beat]')).toHaveCount(5);
  await expect(page.locator('#visual .visual-runner')).toHaveCount(2);
  await page.reload();
  await expect(page.getByRole('button',{name:'Kropki',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.getByRole('button',{name:'Wielokąty',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.screenshot({path:'test-results/polygons.png',fullPage:true});
});

test('support subdivision updates its visual dots without changing layer beats', async ({page}) => {
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

test('legacy appearance preferences default safely to the pointer', async ({page}) => {
  await page.addInitScript(() => localStorage.setItem('polyrhythmer.preferences.v1', JSON.stringify({
    version: 1, developerMode: true, activePaletteId: 'forest', palettes: [],
  })));
  await page.goto('/');
  await expect(page.getByRole('button',{name:'Wskazówka',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.getByRole('button',{name:'Przełącz tryb deweloperski'})).toHaveAttribute('aria-pressed','true');
});

test('developer palettes persist and do not interrupt transport', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button',{name:'Start',exact:true}).click();
  await expect(page.getByRole('button',{name:'Palety wyglądu'})).toBeVisible();
  await page.getByRole('button',{name:'Przełącz tryb deweloperski'}).click();
  await expect(page.getByRole('button',{name:'Przełącz tryb deweloperski'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Palety wyglądu'}).click();
  await page.locator('#palette-name').fill('Moja paleta');
  await page.locator('#palette-accent').fill('#ff00aa');
  await page.getByRole('button',{name:'Zapisz paletę'}).click();
  await expect(page.getByRole('button',{name:'Pauza',exact:true})).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-palette', /^custom-/);
  await page.reload();
  await page.getByRole('button',{name:'Palety wyglądu'}).click();
  const customRow = page.locator('.palette-row').filter({hasText:'Moja paleta'});
  await expect(customRow).toBeVisible();
  await customRow.getByRole('button',{name:'Wybierz paletę Moja paleta'}).click();
  await expect(page.locator('#palette-accent')).toHaveValue('#ff00aa');
  await customRow.getByRole('button',{name:'Edytuj'}).click();
  await page.locator('#palette-name').fill('Poprawiona paleta');
  await page.getByRole('button',{name:'Zapisz paletę'}).click();
  await expect(page.locator('.palette-row').filter({hasText:'Poprawiona paleta'})).toBeVisible();
  await page.locator('.palette-row').filter({hasText:'Poprawiona paleta'}).getByRole('button',{name:'Usuń'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'forest');
});

test('palette names ask before overwriting an existing custom palette', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button',{name:'Palety wyglądu'}).click();
  await page.locator('#palette-name').fill('Duplikat');
  await page.locator('#palette-accent').fill('#112233');
  await page.getByRole('button',{name:'Zapisz paletę'}).click();
  await page.locator('#palette-name').fill('Duplikat');
  await page.locator('#palette-accent').fill('#332211');
  page.once('dialog', dialog => { expect(dialog.message()).toContain('już istnieje'); void dialog.accept(); });
  await page.getByRole('button',{name:'Zapisz paletę'}).click();
  await expect(page.locator('.palette-row').filter({hasText:'Duplikat'})).toHaveCount(1);
  await expect(page.locator('html')).toHaveAttribute('data-palette', /^custom-/);
});

test('corrupt storage recovers and unavailable storage does not crash', async ({page}) => {
  await page.addInitScript(()=>localStorage.setItem('polyrhythmer.session.v1','{broken'));
  await page.goto('/'); await expect(page.locator('#message')).toContainText('Przywrócono');
  await expect(page.locator('#bpm')).toHaveValue('90');
  await page.evaluate(()=>{Storage.prototype.setItem = ()=>{throw new Error('denied')};});
  await page.getByRole('button',{name:'7:5',exact:true}).click();
  await expect(page.locator('#message')).toContainText('Zapis lokalny jest niedostępny');
});

test('real audio nodes are released after repeated transport and drone changes', async ({page}) => {
  await page.addInitScript(()=>{
    const create = AudioContext.prototype.createOscillator;
    const stats = {active:0, peak:0, starts:[] as number[]};
    (window as unknown as {audioStats:typeof stats}).audioStats = stats;
    AudioContext.prototype.createOscillator = function() {
      const oscillator = create.call(this); stats.active++; stats.peak = Math.max(stats.peak,stats.active);
      oscillator.addEventListener('ended',()=>stats.active--);
      const start = oscillator.start.bind(oscillator);
      oscillator.start = (when=0)=>{stats.starts.push(when); start(when);};
      return oscillator;
    };
  });
  await page.goto('/');
  for (let i=0;i<5;i++) {
    await page.getByRole('button',{name:'Start',exact:true}).click();
    await page.getByRole('switch',{name:'Dron tonalny'}).click();
    await page.locator('#root').selectOption(String(i));
    await page.getByRole('button',{name:'5:4',exact:true}).click();
    await page.getByRole('button',{name:'Stop',exact:true}).click();
    await expect.poll(()=>page.evaluate(()=>(window as unknown as {audioStats:{active:number}}).audioStats.active)).toBe(0);
  }
  const stats=await page.evaluate(()=>(window as unknown as {audioStats:{starts:number[];peak:number}}).audioStats);
  expect(stats.starts.some(t=>t>0)).toBe(true); expect(stats.peak).toBeLessThan(25);
});

test('desktop screenshot', async({page})=>{
  await page.setViewportSize({width:1440,height:1100}); await page.goto('/');
  await page.screenshot({path:'test-results/desktop.png',fullPage:true});
});
