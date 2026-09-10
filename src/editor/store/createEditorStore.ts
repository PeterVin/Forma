import { createStore } from 'zustand/vanilla';

import type { ComponentRegistry } from '../../registry/ComponentRegistry';
import { executeCommand as runCommand } from '../commands/executeCommand';
import type { PageDocument } from '../document/types';
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

  return createStore<EditorStoreState>((set) => ({
    registry,
    history: initialHistory,
    selectedNodeId: null,
    mode: 'editor',
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
    clearError: () => set({ lastError: null }),
  }));
}
