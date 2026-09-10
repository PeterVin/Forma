import FitScreenRoundedIcon from '@mui/icons-material/FitScreenRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState, type FocusEvent } from 'react';

import {
  MAX_VIEWPORT_WIDTH,
  MIN_VIEWPORT_WIDTH,
  VIEWPORT_PRESETS,
  ZOOM_STEP,
} from '../../responsive/breakpoints';
import { useEditorStore } from '../../store/useEditorStore';

export function ViewportControls() {
  const viewport = useEditorStore((state) => state.viewport);
  const setViewportPreset = useEditorStore((state) => state.setViewportPreset);
  const setViewportWidth = useEditorStore((state) => state.setViewportWidth);
  const setZoom = useEditorStore((state) => state.setZoom);
  const fitViewport = useEditorStore((state) => state.fitViewport);
  const [draftWidth, setDraftWidth] = useState(String(viewport.width));

  const commitWidth = (
    event?: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const value = Number(event?.target.value ?? draftWidth);
    if (Number.isFinite(value)) setViewportWidth(value);
    else setDraftWidth(String(viewport.width));
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <Select
        size="small"
        aria-label="Viewport preset"
        value={viewport.presetId ?? 'custom'}
        onChange={(event) => {
          if (event.target.value !== 'custom') {
            setViewportPreset(event.target.value);
            const preset = VIEWPORT_PRESETS.find(
              (item) => item.id === event.target.value,
            );
            if (preset) setDraftWidth(String(preset.width));
          }
        }}
        sx={{ minWidth: 112, '& .MuiSelect-select': { py: 0.75 } }}
      >
        {viewport.presetId === null ? (
          <MenuItem value="custom">Custom</MenuItem>
        ) : null}
        {VIEWPORT_PRESETS.map((preset) => (
          <MenuItem key={preset.id} value={preset.id}>
            {preset.label}
          </MenuItem>
        ))}
      </Select>
      <TextField
        size="small"
        aria-label="Viewport width"
        value={draftWidth}
        type="number"
        onChange={(event) => setDraftWidth(event.target.value)}
        onBlur={commitWidth}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            commitWidth();
            event.currentTarget.blur();
          }
        }}
        slotProps={{
          htmlInput: {
            min: MIN_VIEWPORT_WIDTH,
            max: MAX_VIEWPORT_WIDTH,
            step: 1,
          },
        }}
        sx={{ width: 92, '& input': { py: 0.75 } }}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ minWidth: 20 }}
      >
        px
      </Typography>
      <Tooltip title="Zoom out">
        <IconButton
          size="small"
          aria-label="Zoom out"
          onClick={() => setZoom(viewport.zoom - ZOOM_STEP)}
        >
          <RemoveRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Button
        size="small"
        aria-label="Reset zoom"
        onClick={() => setZoom(1)}
        sx={{ minWidth: 58, color: 'text.primary' }}
      >
        {Math.round(viewport.zoom * 100)}%
      </Button>
      <Tooltip title="Zoom in">
        <IconButton
          size="small"
          aria-label="Zoom in"
          onClick={() => setZoom(viewport.zoom + ZOOM_STEP)}
        >
          <AddRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Fit page width">
        <Button
          size="small"
          aria-label="Fit page width"
          startIcon={<FitScreenRoundedIcon />}
          onClick={fitViewport}
        >
          Fit
        </Button>
      </Tooltip>
    </Box>
  );
}
