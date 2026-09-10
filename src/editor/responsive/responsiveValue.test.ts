import { describe, expect, it } from 'vitest';

import {
  clearResponsiveOverride,
  getResponsiveValueInfo,
  isResponsiveValue,
  resolveResponsiveValue,
  setResponsiveValue,
} from './responsiveValue';

describe('responsive values', () => {
  it('resolves mobile-first values from the closest lower breakpoint', () => {
    const value = { xs: 'column', md: 'row', xl: 'row-reverse' };
    expect(resolveResponsiveValue(value, 'xs')).toBe('column');
    expect(resolveResponsiveValue(value, 'sm')).toBe('column');
    expect(resolveResponsiveValue(value, 'md')).toBe('row');
    expect(resolveResponsiveValue(value, 'lg')).toBe('row');
    expect(resolveResponsiveValue(value, 'xl')).toBe('row-reverse');
  });

  it('reports whether a value is explicit or inherited', () => {
    expect(getResponsiveValueInfo({ xs: 1, lg: 4 }, 'lg')).toEqual({
      value: 4,
      sourceBreakpoint: 'lg',
      explicit: true,
    });
    expect(getResponsiveValueInfo({ xs: 1, lg: 4 }, 'md')).toEqual({
      value: 1,
      sourceBreakpoint: 'xs',
      explicit: false,
    });
  });

  it('converts a scalar into a responsive object without losing its base value', () => {
    expect(setResponsiveValue(2, 'md', 4)).toEqual({ xs: 2, md: 4 });
    expect(setResponsiveValue(undefined, 'lg', 5)).toEqual({ lg: 5 });
    expect(setResponsiveValue('block', 'xs', 'flex')).toEqual({ xs: 'flex' });
  });

  it('updates and clears only the active breakpoint override', () => {
    const updated = setResponsiveValue({ xs: 1, md: 3 }, 'lg', 4);
    expect(updated).toEqual({ xs: 1, md: 3, lg: 4 });
    expect(clearResponsiveOverride(updated, 'md')).toEqual({ xs: 1, lg: 4 });
    expect(clearResponsiveOverride({ xs: 1 }, 'xs')).toBeUndefined();
  });

  it('does not confuse arbitrary object props with breakpoint maps', () => {
    expect(isResponsiveValue({ color: 'red' })).toBe(false);
    expect(isResponsiveValue({ xs: 1, future: 2 })).toBe(false);
    expect(isResponsiveValue({ xs: 1, md: 2 })).toBe(true);
  });
});
