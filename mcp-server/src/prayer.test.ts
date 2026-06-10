import { describe, it, expect } from 'vitest';
import { resolveMethod } from './services/methods.js';
import { getIsoTimestamp } from './services/time.js';

describe('Prayer Calculation Method Resolver', () => {
  it('should resolve method from numeric ID', () => {
    expect(resolveMethod(3)).toBe(3);
    expect(resolveMethod(20)).toBe(20);
  });

  it('should resolve method from slug', () => {
    expect(resolveMethod('kemenag')).toBe(20);
    expect(resolveMethod('mwl')).toBe(3);
    expect(resolveMethod('isna')).toBe(2);
    expect(resolveMethod('singapore')).toBe(11);
  });

  it('should auto-detect method from country', () => {
    expect(resolveMethod(undefined, 'indonesia')).toBe(20);
    expect(resolveMethod(undefined, 'singapore')).toBe(11);
    expect(resolveMethod(undefined, 'malaysia')).toBe(11);
  });

  it('should fallback to ISNA (2) for unknown inputs', () => {
    expect(resolveMethod('unknown')).toBe(2);
    expect(resolveMethod()).toBe(2);
  });
});

describe('Timezone and DST Utilities', () => {
  it('should resolve Jakarta UTC (no DST)', () => {
    const result = getIsoTimestamp('2026-06-11', '04:30', 'Asia/Jakarta');
    expect(result).toBe('2026-06-10T21:30:00.000Z');
  });

  it('should resolve London Summer (BST)', () => {
    const result = getIsoTimestamp('2026-06-11', '04:30', 'Europe/London');
    expect(result).toBe('2026-06-11T03:30:00.000Z');
  });

  it('should resolve London Winter (GMT)', () => {
    const result = getIsoTimestamp('2026-12-11', '04:30', 'Europe/London');
    expect(result).toBe('2026-12-11T04:30:00.000Z');
  });
});
