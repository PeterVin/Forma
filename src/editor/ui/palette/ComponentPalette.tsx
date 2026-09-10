import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Box,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import { createNodeFromDefinition } from '../../../registry/createNodeFromDefinition';
import type { ComponentDefinition } from '../../../registry/types';
import { useEditorStore } from '../../store/useEditorStore';
import { resolveClickAddParent } from '../dnd/dropPosition';
import { ComponentCategory } from './ComponentCategory';

const categoryOrder = ['Layout', 'Surface', 'Content', 'Inputs'] as const;
const categoryLabels: Record<string, string> = { Surface: 'Surfaces' };

export function ComponentPalette() {
  const [query, setQuery] = useState('');
  const document = useEditorStore((state) => state.history.present);
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const registry = useEditorStore((state) => state.registry);
  const executeCommand = useEditorStore((state) => state.executeCommand);
  const selectNode = useEditorStore((state) => state.selectNode);
  const reportError = useEditorStore((state) => state.reportError);

  const groups = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const visible = registry
      .getAll()
      .filter((definition) => !definition.palette?.hidden)
      .filter((definition) =>
        [definition.label, definition.type, definition.category]
          .join(' ')
          .toLocaleLowerCase()
          .includes(normalizedQuery),
      )
      .sort(
        (left, right) =>
          (left.palette?.order ?? 100) - (right.palette?.order ?? 100) ||
          left.label.localeCompare(right.label),
      );
    const categories = [
      ...categoryOrder,
      ...new Set(visible.map((item) => item.category)),
    ].filter((category, index, all) => all.indexOf(category) === index);
    return categories
      .map((category) => ({
        category,
        definitions: visible.filter(
          (definition) => definition.category === category,
        ),
      }))
      .filter((group) => group.definitions.length > 0);
  }, [query, registry]);

  const addComponent = (definition: ComponentDefinition): void => {
    const parentId = resolveClickAddParent(document, registry, selectedNodeId);
    if (!parentId) {
      reportError('Select a container before adding this component.');
      return;
    }
    const node = createNodeFromDefinition(definition);
    executeCommand({ type: 'node.add', parentId, node });
    selectNode(node.id);
  };

  return (
    <Box sx={{ minHeight: 0, overflow: 'auto', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          value={query}
          label="Search components"
          placeholder="Search components…"
          onChange={(event) => setQuery(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
      <Stack spacing={0.25}>
        {groups.map((group) => (
          <ComponentCategory
            key={group.category}
            label={categoryLabels[group.category] ?? group.category}
            definitions={group.definitions}
            onAdd={addComponent}
          />
        ))}
      </Stack>
      {groups.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ px: 2, py: 3 }}
        >
          No matching components
        </Typography>
      ) : null}
    </Box>
  );
}
