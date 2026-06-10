import { describe, it, expect } from 'vitest';
import { resolveMethod } from './services/methods.js';

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

  it('should resolve method from numeric string', () => {
    expect(resolveMethod('5')).toBe(5);
  });

  it('should auto-detect method from country', () => {
    expect(resolveMethod(undefined, 'indonesia')).toBe(20);
    expect(resolveMethod(undefined, 'singapore')).toBe(11);
    expect(resolveMethod(undefined, 'malaysia')).toBe(11);
    expect(resolveMethod(undefined, 'turkey')).toBe(13);
  });

  it('should prioritize explicit method over country auto-detect', () => {
    expect(resolveMethod('mwl', 'indonesia')).toBe(3);
  });

  it('should fallback to ISNA (2) for unknown inputs', () => {
    expect(resolveMethod('unknown')).toBe(2);
    expect(resolveMethod(undefined, 'unknown_country')).toBe(2);
    expect(resolveMethod()).toBe(2);
  });
});
