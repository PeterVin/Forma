import { Box } from '@mui/material';

import type { DropPosition } from './types';

interface DropIndicatorProps {
  readonly position: DropPosition | null;
}

export function DropIndicator({ position }: DropIndicatorProps) {
  if (!position) return null;
  return (
    <Box
      aria-hidden="true"
      data-drop-indicator={position}
      sx={{
        position: 'absolute',
        zIndex: 8,
        pointerEvents: 'none',
        ...(position === 'inside'
          ? {
              inset: 1,
              border: '2px dashed',
              borderColor: 'primary.main',
              borderRadius: 1,
              bgcolor: 'rgba(49, 90, 125, 0.05)',
            }
          : {
              left: 0,
              right: 0,
              [position === 'before' ? 'top' : 'bottom']: -2,
              height: 3,
              borderRadius: 2,
              bgcolor: 'primary.main',
              boxShadow: '0 0 0 2px rgba(255,255,255,0.8)',
            }),
      }}
    />
  );
}
