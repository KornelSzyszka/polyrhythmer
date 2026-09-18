import { describe, expect, it } from 'vitest';

import { PREFERENCE_LANGUAGES, translateText } from '../../src/i18n';
import { defaultPreferences, isPreferences } from '../../src/persistence/preferences';

describe('language preferences', () => {
  it('defaults to English and accepts every supported locale', () => {
    expect(defaultPreferences().language).toBe('en');
    for (const language of PREFERENCE_LANGUAGES) expect(isPreferences({ ...defaultPreferences(), language })).toBe(true);
  });

  it('translates the primary heading and transport labels outside Polish', () => {
    expect(translateText('Znajdź wspólny puls', 'en')).toBe('Find the common pulse');
    for (const language of PREFERENCE_LANGUAGES.filter(language => language !== 'pl')) expect(translateText('Pauza', language)).not.toBe('Pauza');
  });
});
