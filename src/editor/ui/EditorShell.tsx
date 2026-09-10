import { Box, Divider, Snackbar } from '@mui/material';
import { useEffect } from 'react';

import type { EditorStore } from '../store/types';
import { EditorStoreProvider } from '../store/EditorStoreProvider';
import { useEditorStore } from '../store/useEditorStore';
import { EditorCanvas } from './canvas/EditorCanvas';
import { DndProvider } from './dnd/DndProvider';
import { EditorSidebar } from './EditorSidebar';
import { EditorToolbar } from './EditorToolbar';
import { PropertyInspector } from './inspector/PropertyInspector';

function EditorWorkspace() {
  const mode = useEditorStore((state) => state.mode);
  const document = useEditorStore((state) => state.history.present);
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const executeCommand = useEditorStore((state) => state.executeCommand);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const lastError = useEditorStore((state) => state.lastError);
  const clearError = useEditorStore((state) => state.clearError);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (mode !== 'editor') return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.matches('input, textarea, select') || target.isContentEditable)
      ) {
        return;
      }

      const mod = event.ctrlKey || event.metaKey;
      if (mod && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (
        mod &&
        event.key.toLowerCase() === 'd' &&
        selectedNodeId &&
        selectedNodeId !== document.rootNodeId
      ) {
        event.preventDefault();
        executeCommand({ type: 'node.duplicate', nodeId: selectedNodeId });
        return;
      }
      if (
        (event.key === 'Delete' || event.key === 'Backspace') &&
        selectedNodeId &&
        selectedNodeId !== document.rootNodeId
      ) {
        event.preventDefault();
        executeCommand({ type: 'node.remove', nodeId: selectedNodeId });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [document.rootNodeId, executeCommand, mode, redo, selectedNodeId, undo]);

  return (
    <Box
      sx={{
        height: '100vh',
        minWidth: 960,
        display: 'grid',
        gridTemplateRows: '56px 1fr',
      }}
    >
      <Box
        sx={{ borderBottom: '1px solid', borderColor: 'divider', zIndex: 2 }}
      >
        <EditorToolbar />
      </Box>
      {mode === 'editor' ? (
        <DndProvider>
          <Box
            sx={{
              minHeight: 0,
              display: 'grid',
              gridTemplateColumns: '260px 1px minmax(0, 1fr) 1px 320px',
            }}
          >
            <EditorSidebar />
            <Divider orientation="vertical" />
            <EditorCanvas />
            <Divider orientation="vertical" />
            <PropertyInspector />
          </Box>
        </DndProvider>
      ) : (
        <EditorCanvas />
      )}
      <Snackbar
        open={Boolean(lastError)}
        message={lastError}
        autoHideDuration={4000}
        onClose={clearError}
      />
    </Box>
  );
}

interface EditorShellProps {
  readonly store: EditorStore;
}

export function EditorShell({ store }: EditorShellProps) {
  return (
    <EditorStoreProvider store={store}>
      <EditorWorkspace />
    </EditorStoreProvider>
  );
}
