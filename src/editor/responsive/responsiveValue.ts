import type { JsonValue } from '../document/types';
import { BREAKPOINT_KEYS, type BreakpointKey } from './types';

export type ResponsiveValue = Partial<Record<BreakpointKey, JsonValue>>;

function isRecord(value: JsonValue | undefined): value is ResponsiveValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isResponsiveValue(
  value: JsonValue | undefined,
): value is ResponsiveValue {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value);
  return (
    keys.length > 0 &&
    keys.every((key) => BREAKPOINT_KEYS.includes(key as BreakpointKey))
  );
}

export interface ResolvedResponsiveValue {
  readonly value: JsonValue | undefined;
  readonly sourceBreakpoint: BreakpointKey | null;
  readonly explicit: boolean;
}

export function resolveResponsiveValue(
  value: JsonValue | undefined,
  activeBreakpoint: BreakpointKey,
): JsonValue | undefined {
  return getResponsiveValueInfo(value, activeBreakpoint).value;
}

export function getResponsiveValueInfo(
  value: JsonValue | undefined,
  activeBreakpoint: BreakpointKey,
): ResolvedResponsiveValue {
  if (!isResponsiveValue(value)) {
    return { value, sourceBreakpoint: null, explicit: false };
  }

  const activeIndex = BREAKPOINT_KEYS.indexOf(activeBreakpoint);
  for (let index = activeIndex; index >= 0; index -= 1) {
    const breakpoint = BREAKPOINT_KEYS[index];
    const candidate = value[breakpoint];
    if (candidate !== undefined) {
      return {
        value: candidate,
        sourceBreakpoint: breakpoint,
        explicit: breakpoint === activeBreakpoint,
      };
    }
  }
  return { value: undefined, sourceBreakpoint: null, explicit: false };
}

export function setResponsiveValue(
  currentValue: JsonValue | undefined,
  activeBreakpoint: BreakpointKey,
  nextValue: JsonValue,
): ResponsiveValue {
  if (isResponsiveValue(currentValue)) {
    return { ...currentValue, [activeBreakpoint]: nextValue };
  }
  if (currentValue === undefined) {
    return { [activeBreakpoint]: nextValue };
  }
  if (activeBreakpoint === 'xs') {
    return { xs: nextValue };
  }
  return { xs: currentValue, [activeBreakpoint]: nextValue };
}

export function clearResponsiveOverride(
  value: JsonValue | undefined,
  breakpoint: BreakpointKey,
): JsonValue | undefined {
  if (!isResponsiveValue(value)) return value;
  const next = Object.fromEntries(
    Object.entries(value).filter(([key]) => key !== breakpoint),
  ) as ResponsiveValue;
  return Object.keys(next).length > 0 ? next : undefined;
}

export function resolveResponsiveArray(
  value: readonly JsonValue[],
  activeBreakpoint: BreakpointKey,
): JsonValue | undefined {
  const activeIndex = BREAKPOINT_KEYS.indexOf(activeBreakpoint);
  for (
    let index = Math.min(activeIndex, value.length - 1);
    index >= 0;
    index -= 1
  ) {
    if (value[index] !== undefined) return value[index];
  }
  return undefined;
}
