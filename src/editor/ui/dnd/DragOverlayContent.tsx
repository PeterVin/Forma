import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import { Paper, Stack, Typography } from '@mui/material';

import type { DragSource } from './types';

interface DragOverlayContentProps {
  readonly source: DragSource;
}

export function DragOverlayContent({ source }: DragOverlayContentProps) {
  return (
    <Paper
      elevation={6}
      sx={{ px: 1.5, py: 1, border: '1px solid', borderColor: 'primary.main' }}
    >
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
        <DragIndicatorRoundedIcon fontSize="small" color="primary" />
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {source.label}
        </Typography>
      </Stack>
    </Paper>
  );
}
