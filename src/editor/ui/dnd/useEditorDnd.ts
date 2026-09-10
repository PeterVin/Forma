import { useContext } from 'react';

import { EditorDndContext } from './editorDndContext';

export function useEditorDnd() {
  return useContext(EditorDndContext);
}
