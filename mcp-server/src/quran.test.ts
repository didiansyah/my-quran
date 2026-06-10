import { describe, it, expect } from 'vitest';
import { findSurahFuzzy, parseSurahRef } from './services/alquran-cloud.js';

describe('Quran Reference Parsing', () => {
  it('should parse surah number', () => {
    expect(parseSurahRef('1')).toEqual({ surah: 1 });
    expect(parseSurahRef('114')).toEqual({ surah: 114 });
  });

  it('should parse surah name', () => {
    expect(parseSurahRef('Al-Fatihah')).toEqual({ surah: 1 });
    expect(parseSurahRef('Al-Baqarah')).toEqual({ surah: 2 });
  });

  it('should parse surah:ayah reference', () => {
    expect(parseSurahRef('1:1')).toEqual({ surah: 1, ayah: 1 });
    expect(parseSurahRef('Al-Baqarah:255')).toEqual({ surah: 2, ayah: 255 });
  });

  it('should handle fuzzy surah names', () => {
    expect(findSurahFuzzy('fatihah')).toBe(1);
    expect(findSurahFuzzy('baqarah')).toBe(2);
    expect(findSurahFuzzy('baqoroh')).toBe(2);
    expect(findSurahFuzzy('imran')).toBe(3);
    expect(findSurahFuzzy('ikhlas')).toBe(112);
  });

  it('should return null for invalid references', () => {
    expect(parseSurahRef('invalid')).toBeNull();
    expect(parseSurahRef('115')).toBeNull();
  });
});
