import type { ReactNode } from 'react';

import { EditorStoreContext } from './editorStoreContext';
import type { EditorStore } from './types';

interface EditorStoreProviderProps {
  readonly store: EditorStore;
  readonly children: ReactNode;
}

export function EditorStoreProvider({
  store,
  children,
}: EditorStoreProviderProps) {
  return (
    <EditorStoreContext.Provider value={store}>
      {children}
    </EditorStoreContext.Provider>
  );
}
