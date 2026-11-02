import { describe, it, expect } from 'vitest';
import {
  getMethodVariant,
  formatBytes,
  formatIsoDate,
} from '../src/utils/formatters';

describe('Formatters & Design Helpers', () => {
  it('maps HTTP methods to corresponding badge variants', () => {
    expect(getMethodVariant('GET')).toBe('get');
    expect(getMethodVariant('POST')).toBe('post');
    expect(getMethodVariant('PUT')).toBe('put');
    expect(getMethodVariant('PATCH')).toBe('patch');
    expect(getMethodVariant('DELETE')).toBe('delete');
    expect(getMethodVariant('UNKNOWN')).toBe('default');
  });

  it('formats byte sizes cleanly', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
  });

  it('formats ISO dates correctly', () => {
    const formatted = formatIsoDate('2026-01-15T12:00:00.000Z');
    expect(formatted).toContain('2026');
  });
});
