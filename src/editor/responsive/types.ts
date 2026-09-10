export const BREAKPOINT_KEYS = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export type BreakpointKey = (typeof BREAKPOINT_KEYS)[number];

export type BreakpointValues = Readonly<Record<BreakpointKey, number>>;

export interface ViewportPreset {
  readonly id: string;
  readonly label: string;
  readonly width: number;
  readonly breakpoint: BreakpointKey;
}

export interface EditorViewportState {
  readonly width: number;
  readonly presetId: string | null;
  readonly activeBreakpoint: BreakpointKey;
  readonly zoom: number;
  readonly workspaceWidth: number;
}
