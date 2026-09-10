import { Box, Divider } from '@mui/material';

import type { EditorStore } from '../store/types';
import { EditorStoreProvider } from '../store/EditorStoreProvider';
import { useEditorStore } from '../store/useEditorStore';
import { EditorCanvas } from './canvas/EditorCanvas';
import { EditorToolbar } from './EditorToolbar';
import { PropertyInspector } from './inspector/PropertyInspector';
import { LayersPanel } from './layers/LayersPanel';

function EditorWorkspace() {
  const mode = useEditorStore((state) => state.mode);

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
        <Box
          sx={{
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: '240px 1px minmax(0, 1fr) 1px 300px',
          }}
        >
          <LayersPanel />
          <Divider orientation="vertical" />
          <EditorCanvas />
          <Divider orientation="vertical" />
          <PropertyInspector />
        </Box>
      ) : (
        <EditorCanvas />
      )}
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
