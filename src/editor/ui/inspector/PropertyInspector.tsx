import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Alert, Box, Button, Divider, Stack, Typography } from '@mui/material';

import type { JsonValue } from '../../document/types';
import { useEditorStore } from '../../store/useEditorStore';
import type { PropertyGroup } from '../../../registry/types';
import { PropertyField } from './PropertyField';

const groupOrder: readonly PropertyGroup[] = [
  'content',
  'appearance',
  'layout',
  'advanced',
];

const groupLabels: Record<PropertyGroup, string> = {
  content: 'Content',
  appearance: 'Appearance',
  layout: 'Layout',
  advanced: 'Advanced',
};

export function PropertyInspector() {
  const document = useEditorStore((state) => state.history.present);
  const registry = useEditorStore((state) => state.registry);
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const executeCommand = useEditorStore((state) => state.executeCommand);
  const lastError = useEditorStore((state) => state.lastError);
  const node = selectedNodeId ? document.nodes[selectedNodeId] : undefined;
  const definition = node ? registry.get(node.type) : undefined;

  if (!node || !definition) {
    return (
      <Box
        component="aside"
        aria-label="Properties"
        sx={{ bgcolor: 'background.paper', p: 2.5 }}
      >
        <Typography variant="subtitle2">Properties</Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mt: 2 }}>
          No component selected
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="aside"
      aria-label="Properties"
      sx={{
        minWidth: 0,
        minHeight: 0,
        overflow: 'auto',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography variant="h6">{definition.label}</Typography>
        <Typography variant="caption" color="text.secondary">
          {node.id}
        </Typography>
      </Box>
      <Divider />

      <Stack spacing={2.5} sx={{ p: 2.5 }}>
        {lastError ? <Alert severity="error">{lastError}</Alert> : null}
        {groupOrder.map((group) => {
          const properties = definition.inspector?.filter(
            (property) => property.group === group,
          );
          if (!properties?.length) return null;
          return (
            <Stack key={group} spacing={1.5}>
              <Typography variant="overline" color="text.secondary">
                {groupLabels[group]}
              </Typography>
              {properties.map((property) => {
                const value =
                  property.target === 'props'
                    ? node.props[property.key]
                    : node.style.sx?.[property.key];
                return (
                  <PropertyField
                    key={`${node.id}.${property.target}.${property.key}.${JSON.stringify(value)}`}
                    definition={property}
                    value={value as JsonValue | undefined}
                    onCommit={(nextValue) =>
                      executeCommand({
                        type:
                          property.target === 'props'
                            ? 'node.updateProps'
                            : 'node.updateSx',
                        nodeId: node.id,
                        patch: { [property.key]: nextValue },
                      })
                    }
                  />
                );
              })}
            </Stack>
          );
        })}

        <Divider />
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ContentCopyRoundedIcon />}
            aria-label="Duplicate component"
            disabled={node.id === document.rootNodeId}
            onClick={() =>
              executeCommand({ type: 'node.duplicate', nodeId: node.id })
            }
          >
            Duplicate
          </Button>
          <Button
            size="small"
            color="error"
            variant="outlined"
            startIcon={<DeleteOutlineRoundedIcon />}
            aria-label="Delete component"
            disabled={node.id === document.rootNodeId}
            onClick={() =>
              executeCommand({ type: 'node.remove', nodeId: node.id })
            }
          >
            Delete
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
