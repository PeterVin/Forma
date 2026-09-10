import type { StoreApi } from 'zustand';

import type { ComponentRegistry } from '../../registry/ComponentRegistry';
import type { EditorCommand } from '../commands/types';
import type { EditorHistory } from './history';

export type EditorMode = 'editor' | 'preview';

export interface EditorStoreState {
  readonly registry: ComponentRegistry;
  readonly history: EditorHistory;
  readonly selectedNodeId: string | null;
  readonly mode: EditorMode;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly lastError: string | null;
  readonly executeCommand: (command: EditorCommand) => void;
  readonly undo: () => void;
  readonly redo: () => void;
  readonly selectNode: (nodeId: string) => void;
  readonly clearSelection: () => void;
  readonly setMode: (mode: EditorMode) => void;
  readonly reportError: (message: string) => void;
  readonly clearError: () => void;
}

export type EditorStore = StoreApi<EditorStoreState>;
