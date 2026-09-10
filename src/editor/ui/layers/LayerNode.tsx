import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { Box, IconButton, ListItemButton, ListItemText } from '@mui/material';
import { useState } from 'react';

import type { EditorNode, PageDocument } from '../../document/types';
import type { ComponentRegistry } from '../../../registry/ComponentRegistry';

interface LayerNodeProps {
  readonly node: EditorNode;
  readonly document: PageDocument;
  readonly registry: ComponentRegistry;
  readonly selectedNodeId: string | null;
  readonly onSelect: (nodeId: string) => void;
  readonly depth?: number;
}

export function LayerNode({
  node,
  document,
  registry,
  selectedNodeId,
  onSelect,
  depth = 0,
}: LayerNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const label = registry.get(node.type)?.label ?? node.type;

  return (
    <Box role="treeitem" aria-expanded={hasChildren ? expanded : undefined}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          minHeight: 36,
          pl: 0.5 + depth * 1.5,
        }}
      >
        {hasChildren ? (
          <IconButton
            size="small"
            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${label}`}
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((current) => !current);
            }}
            sx={{ mr: 0.5 }}
          >
            {expanded ? (
              <ExpandLessRoundedIcon fontSize="small" />
            ) : (
              <ExpandMoreRoundedIcon fontSize="small" />
            )}
          </IconButton>
        ) : (
          <Box sx={{ width: 32, flexShrink: 0 }} />
        )}
        <ListItemButton
          selected={selectedNodeId === node.id}
          onClick={() => onSelect(node.id)}
          data-layer-node-id={node.id}
          sx={{ minWidth: 0, minHeight: 36, py: 0, pr: 1 }}
        >
          <ListItemText
            primary={label}
            secondary={node.id}
            slotProps={{
              primary: {
                variant: 'body2',
                noWrap: true,
                sx: { fontWeight: 600 },
              },
              secondary: { variant: 'caption', noWrap: true },
            }}
          />
        </ListItemButton>
      </Box>

      {hasChildren && expanded ? (
        <Box role="group">
          {node.children.flatMap((childId) => {
            const child = document.nodes[childId];
            return child ? (
              <LayerNode
                key={child.id}
                node={child}
                document={document}
                registry={registry}
                selectedNodeId={selectedNodeId}
                onSelect={onSelect}
                depth={depth + 1}
              />
            ) : (
              []
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
}
