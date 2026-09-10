import { Box } from '@mui/material';
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';

import { useEditorStore } from '../../store/useEditorStore';

interface EditorNodeWrapperProps {
  readonly nodeId: string;
  readonly children: ReactNode;
}

export function EditorNodeWrapper({
  nodeId,
  children,
}: EditorNodeWrapperProps) {
  const selected = useEditorStore((state) => state.selectedNodeId === nodeId);
  const selectNode = useEditorStore((state) => state.selectNode);

  const select = (event: MouseEvent | KeyboardEvent): void => {
    event.stopPropagation();
    selectNode(nodeId);
  };

  return (
    <Box
      component="span"
      className="editor-node-wrapper"
      data-editor-node-id={nodeId}
      data-selected={selected ? 'true' : 'false'}
      onClick={select}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') select(event);
      }}
      sx={{
        display: 'contents',
        '& > :first-of-type': {
          outline: selected ? '2px solid' : '1px solid transparent',
          outlineColor: selected ? 'primary.main' : 'transparent',
          outlineOffset: selected ? '2px' : '1px',
        },
        '&:hover > :first-of-type': {
          outlineColor: selected ? 'primary.main' : 'rgba(49, 90, 125, 0.42)',
        },
      }}
    >
      {children}
    </Box>
  );
}
