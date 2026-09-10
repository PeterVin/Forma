import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import type { JsonValue } from '../../document/types';
import { useEditorStore } from '../../store/useEditorStore';
import type { PropertyGroup } from '../../../registry/types';
import {
  clearResponsiveOverride,
  getResponsiveValueInfo,
  setResponsiveValue,
} from '../../responsive/responsiveValue';
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
  const activeBreakpoint = useEditorStore(
    (state) => state.viewport.activeBreakpoint,
  );
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
                const rawValue =
                  property.target === 'props'
                    ? node.props[property.key]
                    : node.style.sx?.[property.key];
                const responsiveInfo = property.responsive
                  ? getResponsiveValueInfo(rawValue, activeBreakpoint)
                  : null;
                const value = property.responsive
                  ? responsiveInfo?.value
                  : rawValue;
                const commitValue = (nextValue: JsonValue): void => {
                  const storedValue = property.responsive
                    ? setResponsiveValue(rawValue, activeBreakpoint, nextValue)
                    : nextValue;
                  executeCommand({
                    type:
                      property.target === 'props'
                        ? 'node.updateProps'
                        : 'node.updateSx',
                    nodeId: node.id,
                    patch: { [property.key]: storedValue },
                  });
                };
                const clearOverride = (): void => {
                  const nextValue = clearResponsiveOverride(
                    rawValue,
                    activeBreakpoint,
                  );
                  if (nextValue === undefined) {
                    executeCommand({
                      type:
                        property.target === 'props'
                          ? 'node.updateProps'
                          : 'node.updateSx',
                      nodeId: node.id,
                      patch: { [property.key]: undefined },
                    });
                    return;
                  }
                  executeCommand({
                    type:
                      property.target === 'props'
                        ? 'node.updateProps'
                        : 'node.updateSx',
                    nodeId: node.id,
                    patch: { [property.key]: nextValue },
                  });
                };
                return (
                  <Stack
                    key={`${node.id}.${property.target}.${property.key}.${JSON.stringify(value)}`}
                    spacing={0.5}
                  >
                    {property.responsive ? (
                      <Stack
                        direction="row"
                        spacing={0.75}
                        sx={{ alignItems: 'center' }}
                      >
                        <Chip
                          size="small"
                          label={activeBreakpoint}
                          color={
                            responsiveInfo?.explicit ? 'primary' : 'default'
                          }
                          variant={
                            responsiveInfo?.explicit ? 'filled' : 'outlined'
                          }
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ flex: 1 }}
                        >
                          {responsiveInfo?.explicit
                            ? 'Override at this breakpoint'
                            : responsiveInfo?.sourceBreakpoint
                              ? `Inherited from ${responsiveInfo.sourceBreakpoint}`
                              : 'Shared value'}
                        </Typography>
                        {responsiveInfo?.explicit ? (
                          <Tooltip title="Clear breakpoint override">
                            <IconButton
                              size="small"
                              aria-label={`Clear ${property.label} ${activeBreakpoint} override`}
                              onClick={clearOverride}
                            >
                              <RestartAltRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : null}
                      </Stack>
                    ) : null}
                    <PropertyField
                      definition={property}
                      value={value as JsonValue | undefined}
                      onCommit={commitValue}
                    />
                  </Stack>
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
