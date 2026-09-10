import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Box, Stack, Typography } from '@mui/material';

export function EmptyContainerDropZone() {
  return (
    <Box
      data-empty-drop-zone="true"
      sx={{
        minHeight: 72,
        display: 'grid',
        placeItems: 'center',
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 1,
        color: 'text.secondary',
        pointerEvents: 'none',
      }}
    >
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
        <AddRoundedIcon fontSize="small" />
        <Typography variant="caption">Drop components here</Typography>
      </Stack>
    </Box>
  );
}
