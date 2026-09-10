import { useContext } from 'react';
import { useStore } from 'zustand';

import { EditorStoreContext } from './editorStoreContext';
import type { EditorStoreState } from './types';

export function useEditorStore<T>(selector: (state: EditorStoreState) => T): T {
  const store = useContext(EditorStoreContext);
  if (!store) throw new Error('Editor components require EditorStoreProvider.');
  return useStore(store, selector);
}
