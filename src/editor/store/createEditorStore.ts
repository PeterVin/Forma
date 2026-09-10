import { createStore } from 'zustand/vanilla';

import type { ComponentRegistry } from '../../registry/ComponentRegistry';
import { executeCommand as runCommand } from '../commands/executeCommand';
import type { PageDocument } from '../document/types';
import {
  VIEWPORT_PRESETS,
  calculateFitZoom,
  clampViewportWidth,
  clampZoom,
  getBreakpointForWidth,
  getViewportPreset,
} from '../responsive/breakpoints';
import {
  DEFAULT_HISTORY_LIMIT,
  createEditorHistory,
  pushHistory,
  redoHistory,
  undoHistory,
} from './history';
import type { EditorStore, EditorStoreState } from './types';

export interface EditorStoreOptions {
  readonly historyLimit?: number;
}

export function createEditorStore(
  initialDocument: PageDocument,
  registry: ComponentRegistry,
  options: EditorStoreOptions = {},
): EditorStore {
  const historyLimit = options.historyLimit ?? DEFAULT_HISTORY_LIMIT;
  const initialHistory = createEditorHistory(structuredClone(initialDocument));
  const initialPreset =
    VIEWPORT_PRESETS.find((preset) => preset.id === 'desktop') ??
    VIEWPORT_PRESETS[0];

  return createStore<EditorStoreState>((set) => ({
    registry,
    history: initialHistory,
    selectedNodeId: null,
    mode: 'editor',
    viewport: {
      width: initialPreset.width,
      presetId: initialPreset.id,
      activeBreakpoint: initialPreset.breakpoint,
      zoom: 1,
      workspaceWidth: 0,
    },
    canUndo: false,
    canRedo: false,
    lastError: null,

    executeCommand: (command) =>
      set((state) => {
        const result = runCommand(
          state.history.present,
          command,
          state.registry,
        );
        if (!result.success) return { lastError: result.error.message };

        const history = pushHistory(state.history, result.value, historyLimit);
        const selectedNodeId =
          state.selectedNodeId && history.present.nodes[state.selectedNodeId]
            ? state.selectedNodeId
            : null;
        return {
          history,
          selectedNodeId,
          canUndo: history.past.length > 0,
          canRedo: history.future.length > 0,
          lastError: null,
        };
      }),

    undo: () =>
      set((state) => {
        const history = undoHistory(state.history);
        const selectedNodeId =
          state.selectedNodeId && history.present.nodes[state.selectedNodeId]
            ? state.selectedNodeId
            : null;
        return {
          history,
          selectedNodeId,
          canUndo: history.past.length > 0,
          canRedo: history.future.length > 0,
          lastError: null,
        };
      }),

    redo: () =>
      set((state) => {
        const history = redoHistory(state.history);
        const selectedNodeId =
          state.selectedNodeId && history.present.nodes[state.selectedNodeId]
            ? state.selectedNodeId
            : null;
        return {
          history,
          selectedNodeId,
          canUndo: history.past.length > 0,
          canRedo: history.future.length > 0,
          lastError: null,
        };
      }),

    selectNode: (nodeId) =>
      set((state) => ({
        selectedNodeId: state.history.present.nodes[nodeId]
          ? nodeId
          : state.selectedNodeId,
      })),
    clearSelection: () => set({ selectedNodeId: null }),
    setMode: (mode) => set({ mode }),
    setViewportPreset: (presetId) =>
      set((state) => {
        const preset = getViewportPreset(presetId);
        if (!preset) return state;
        return {
          viewport: {
            ...state.viewport,
            width: preset.width,
            presetId: preset.id,
            activeBreakpoint: preset.breakpoint,
          },
        };
      }),
    setViewportWidth: (requestedWidth) =>
      set((state) => {
        const width = Math.round(clampViewportWidth(requestedWidth));
        const preset = VIEWPORT_PRESETS.find((item) => item.width === width);
        return {
          viewport: {
            ...state.viewport,
            width,
            presetId: preset?.id ?? null,
            activeBreakpoint: getBreakpointForWidth(width),
          },
        };
      }),
    setZoom: (zoom) =>
      set((state) => ({
        viewport: { ...state.viewport, zoom: clampZoom(zoom) },
      })),
    fitViewport: () =>
      set((state) => ({
        viewport: {
          ...state.viewport,
          zoom: calculateFitZoom(
            state.viewport.workspaceWidth,
            state.viewport.width,
          ),
        },
      })),
    setWorkspaceWidth: (workspaceWidth) =>
      set((state) => ({
        viewport: {
          ...state.viewport,
          workspaceWidth: Math.max(0, workspaceWidth),
        },
      })),
    reportError: (message) => set({ lastError: message }),
    clearError: () => set({ lastError: null }),
  }));
}
