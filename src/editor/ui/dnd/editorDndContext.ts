import { createContext } from 'react';

import type { DragSource, DropTarget } from './types';

export interface EditorDndContextValue {
  readonly activeSource: DragSource | null;
  readonly dropTarget: DropTarget | null;
}

export const EditorDndContext = createContext<EditorDndContextValue>({
  activeSource: null,
  dropTarget: null,
});
