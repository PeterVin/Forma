import type { BreakpointKey, BreakpointValues, ViewportPreset } from './types';

export const DEFAULT_BREAKPOINT_VALUES: BreakpointValues = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

export const VIEWPORT_PRESETS: readonly ViewportPreset[] = [
  { id: 'mobile', label: 'Mobile', width: 390, breakpoint: 'xs' },
  { id: 'tablet', label: 'Tablet', width: 768, breakpoint: 'sm' },
  { id: 'laptop', label: 'Laptop', width: 1024, breakpoint: 'md' },
  { id: 'desktop', label: 'Desktop', width: 1440, breakpoint: 'lg' },
  { id: 'wide', label: 'Wide', width: 1920, breakpoint: 'xl' },
];

export const MIN_VIEWPORT_WIDTH = 320;
export const MAX_VIEWPORT_WIDTH = 2560;
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 2;
export const ZOOM_STEP = 0.25;

export function clampViewportWidth(width: number): number {
  return Math.min(MAX_VIEWPORT_WIDTH, Math.max(MIN_VIEWPORT_WIDTH, width));
}

export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function getBreakpointForWidth(
  width: number,
  values: BreakpointValues = DEFAULT_BREAKPOINT_VALUES,
): BreakpointKey {
  let active: BreakpointKey = 'xs';
  for (const breakpoint of Object.keys(values) as BreakpointKey[]) {
    if (width >= values[breakpoint]) active = breakpoint;
  }
  return active;
}

export function getViewportPreset(id: string): ViewportPreset | undefined {
  return VIEWPORT_PRESETS.find((preset) => preset.id === id);
}

export function calculateFitZoom(
  workspaceWidth: number,
  viewportWidth: number,
  margin = 64,
): number {
  if (workspaceWidth <= 0 || viewportWidth <= 0) return 1;
  return clampZoom((workspaceWidth - margin) / viewportWidth);
}
