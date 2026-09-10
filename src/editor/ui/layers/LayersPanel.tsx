import { Box, Divider, Typography } from '@mui/material';

import { useEditorStore } from '../../store/useEditorStore';
import { LayerNode } from './LayerNode';

export function LayersPanel() {
  const document = useEditorStore((state) => state.history.present);
  const registry = useEditorStore((state) => state.registry);
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const selectNode = useEditorStore((state) => state.selectNode);
  const root = document.nodes[document.rootNodeId];

  return (
    <Box
      component="aside"
      aria-label="Layers"
      sx={{
        minWidth: 0,
        minHeight: 0,
        overflow: 'auto',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ px: 2, py: 1.75 }}>
        <Typography variant="subtitle2">Layers</Typography>
        <Typography variant="caption" color="text.secondary">
          {document.name}
        </Typography>
      </Box>
      <Divider />
      <Box role="tree" aria-label="Page layers" sx={{ py: 1 }}>
        {root ? (
          <LayerNode
            node={root}
            document={document}
            registry={registry}
            selectedNodeId={selectedNodeId}
            onSelect={selectNode}
          />
        ) : null}
      </Box>
    </Box>
  );
}
