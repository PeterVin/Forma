import { Box } from '@mui/material';
import { useEffect, useMemo, useRef } from 'react';

import { DocumentRenderer } from '../../../renderer/DocumentRenderer';
import { resolveDocumentForViewport } from '../../responsive/resolveNodeForViewport';
import { useEditorStore } from '../../store/useEditorStore';
import { EditorDocumentRenderer } from './EditorDocumentRenderer';
import { PageFrame } from './PageFrame';

export function EditorCanvas() {
  const document = useEditorStore((state) => state.history.present);
  const registry = useEditorStore((state) => state.registry);
  const mode = useEditorStore((state) => state.mode);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const viewport = useEditorStore((state) => state.viewport);
  const setWorkspaceWidth = useEditorStore((state) => state.setWorkspaceWidth);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const resolvedDocument = useMemo(
    () => resolveDocumentForViewport(document, viewport.activeBreakpoint),
    [document, viewport.activeBreakpoint],
  );

  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return;
    const measure = (): void => setWorkspaceWidth(workspace.clientWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(workspace);
    return () => observer.disconnect();
  }, [setWorkspaceWidth]);

  return (
    <Box
      component="main"
      ref={workspaceRef}
      aria-label={mode === 'editor' ? 'Editor canvas' : 'Page preview'}
      onClick={mode === 'editor' ? clearSelection : undefined}
      sx={{
        minWidth: 0,
        minHeight: 0,
        overflow: 'auto',
        bgcolor: '#EEF1F4',
        overscrollBehavior: 'contain',
      }}
    >
      <PageFrame
        viewportWidth={viewport.width}
        zoom={viewport.zoom}
        workspaceRef={workspaceRef}
      >
        {mode === 'editor' ? (
          <EditorDocumentRenderer
            document={resolvedDocument}
            registry={registry}
          />
        ) : (
          <DocumentRenderer document={resolvedDocument} registry={registry} />
        )}
      </PageFrame>
    </Box>
  );
}
