import { describe, expect, it } from 'vitest';

import {
  calculateFitZoom,
  clampViewportWidth,
  clampZoom,
  getBreakpointForWidth,
  VIEWPORT_PRESETS,
} from './breakpoints';

describe('editor viewport helpers', () => {
  it('defines the five requested viewport presets', () => {
    expect(
      VIEWPORT_PRESETS.map(({ label, width, breakpoint }) => ({
        label,
        width,
        breakpoint,
      })),
    ).toEqual([
      { label: 'Mobile', width: 390, breakpoint: 'xs' },
      { label: 'Tablet', width: 768, breakpoint: 'sm' },
      { label: 'Laptop', width: 1024, breakpoint: 'md' },
      { label: 'Desktop', width: 1440, breakpoint: 'lg' },
      { label: 'Wide', width: 1920, breakpoint: 'xl' },
    ]);
  });

  it('maps manual widths to MUI breakpoints and clamps the supported range', () => {
    expect(getBreakpointForWidth(390)).toBe('xs');
    expect(getBreakpointForWidth(768)).toBe('sm');
    expect(getBreakpointForWidth(1024)).toBe('md');
    expect(getBreakpointForWidth(1440)).toBe('lg');
    expect(getBreakpointForWidth(1920)).toBe('xl');
    expect(clampViewportWidth(200)).toBe(320);
    expect(clampViewportWidth(3000)).toBe(2560);
  });

  it('fits width and clamps zoom between 25% and 200%', () => {
    expect(calculateFitZoom(1000, 1440)).toBeCloseTo(0.65);
    expect(calculateFitZoom(5000, 390)).toBe(2);
    expect(clampZoom(0.1)).toBe(0.25);
    expect(clampZoom(4)).toBe(2);
  });
});
