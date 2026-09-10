import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import { Box, ButtonBase, Stack, Tooltip, Typography } from '@mui/material';
import { useDraggable } from '@dnd-kit/core';

import type { ComponentDefinition } from '../../../registry/types';
import type { DragSource } from '../dnd/types';

interface ComponentPaletteItemProps {
  readonly definition: ComponentDefinition;
  readonly onAdd: (definition: ComponentDefinition) => void;
}

export function ComponentPaletteItem({
  definition,
  onAdd,
}: ComponentPaletteItemProps) {
  const source: DragSource = {
    kind: 'palette',
    componentType: definition.type,
    label: definition.label,
  };
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${definition.type}`,
    data: { source },
  });

  const item = (
    <ButtonBase
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`Add ${definition.label}`}
      onClick={() => onAdd(definition)}
      sx={{
        width: '100%',
        justifyContent: 'flex-start',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        px: 1,
        py: 0.75,
        opacity: isDragging ? 0.45 : 1,
        bgcolor: 'background.paper',
        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ width: '100%', alignItems: 'center' }}
      >
        <Box sx={{ display: 'flex', color: 'primary.main' }}>
          {definition.icon ?? <WidgetsOutlinedIcon fontSize="small" />}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 650 }}>
            {definition.label}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {definition.category}
          </Typography>
        </Box>
        <DragIndicatorRoundedIcon fontSize="small" color="disabled" />
      </Stack>
    </ButtonBase>
  );

  return definition.description ? (
    <Tooltip title={definition.description} placement="right">
      {item}
    </Tooltip>
  ) : (
    item
  );
}
