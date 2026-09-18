import { describe, expect, it } from 'vitest';

import { PREFERENCE_LANGUAGES, translateText } from '../../src/i18n';
import { defaultPreferences, isPreferences } from '../../src/persistence/preferences';

describe('language preferences', () => {
  it('defaults to English and accepts every supported locale', () => {
    expect(defaultPreferences().language).toBe('en');
    for (const language of PREFERENCE_LANGUAGES)
      expect(isPreferences({ ...defaultPreferences(), language })).toBe(true);
  });

  it('translates the primary heading and transport labels outside Polish', () => {
    expect(translateText('Znajdź wspólny puls', 'en')).toBe('Find the common pulse');
    for (const language of PREFERENCE_LANGUAGES.filter((language) => language !== 'pl'))
      expect(translateText('Pauza', language)).not.toBe('Pauza');
  });

  it('translates selectable drone values and dynamic rhythm counters', () => {
    expect(translateText('Molowy', 'en')).toBe('Minor');
    expect(translateText('Trójdźwięk', 'en')).toBe('Triad');
    expect(translateText('uderzeń / cykl', 'en')).toBe('beats / cycle');
    expect(translateText('30 wspólnych kroków ↗', 'en')).toBe('30 common steps ↗');
    expect(translateText('SESJA / 001', 'en')).toBe('SESSION / 001');
    expect(translateText('Tryb lokalny', 'en')).toBe('Local mode');
    expect(translateText('CYKL 01', 'en')).toBe('CYCLE 01');
  });
});
