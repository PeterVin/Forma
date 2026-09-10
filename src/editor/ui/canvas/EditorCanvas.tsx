import { Box } from '@mui/material';

import { DocumentRenderer } from '../../../renderer/DocumentRenderer';
import { useEditorStore } from '../../store/useEditorStore';
import { EditorDocumentRenderer } from './EditorDocumentRenderer';

export function EditorCanvas() {
  const document = useEditorStore((state) => state.history.present);
  const registry = useEditorStore((state) => state.registry);
  const mode = useEditorStore((state) => state.mode);
  const clearSelection = useEditorStore((state) => state.clearSelection);

  return (
    <Box
      component="main"
      aria-label={mode === 'editor' ? 'Editor canvas' : 'Page preview'}
      onClick={mode === 'editor' ? clearSelection : undefined}
      sx={{
        minWidth: 0,
        minHeight: 0,
        overflow: 'auto',
        bgcolor: '#EEF1F4',
        p: mode === 'editor' ? { xs: 2, lg: 4 } : 0,
      }}
    >
      <Box
        sx={{
          minHeight: '100%',
          maxWidth: mode === 'editor' ? 1440 : 'none',
          mx: 'auto',
          bgcolor: 'background.default',
          boxShadow:
            mode === 'editor' ? '0 8px 30px rgba(23, 33, 43, 0.12)' : 'none',
          borderRadius: mode === 'editor' ? 1.5 : 0,
          overflow: 'hidden',
        }}
      >
        {mode === 'editor' ? (
          <EditorDocumentRenderer document={document} registry={registry} />
        ) : (
          <DocumentRenderer document={document} registry={registry} />
        )}
      </Box>
    </Box>
  );
}
