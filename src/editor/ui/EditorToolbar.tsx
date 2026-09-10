import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import {
  Box,
  Divider,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';

import { useEditorStore } from '../store/useEditorStore';
import type { EditorMode } from '../store/types';

export function EditorToolbar() {
  const canUndo = useEditorStore((state) => state.canUndo);
  const canRedo = useEditorStore((state) => state.canRedo);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const mode = useEditorStore((state) => state.mode);
  const setMode = useEditorStore((state) => state.setMode);

  return (
    <Toolbar
      component="header"
      variant="dense"
      sx={{ minHeight: 56, bgcolor: 'background.paper', gap: 1.5 }}
    >
      <Typography variant="h6" sx={{ fontSize: '1rem', mr: 1 }}>
        MUI Studio
      </Typography>
      <Divider orientation="vertical" flexItem sx={{ my: 1 }} />
      <Box sx={{ display: 'flex' }}>
        <Tooltip title="Undo">
          <span>
            <IconButton aria-label="Undo" disabled={!canUndo} onClick={undo}>
              <UndoRoundedIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Redo">
          <span>
            <IconButton aria-label="Redo" disabled={!canRedo} onClick={redo}>
              <RedoRoundedIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      <Box sx={{ flex: 1 }} />
      <ToggleButtonGroup
        exclusive
        size="small"
        value={mode}
        aria-label="Editor mode"
        onChange={(_, value: EditorMode | null) => {
          if (value) setMode(value);
        }}
      >
        <ToggleButton value="editor" aria-label="Editor mode">
          Editor
        </ToggleButton>
        <ToggleButton value="preview" aria-label="Preview mode">
          Preview
        </ToggleButton>
      </ToggleButtonGroup>
    </Toolbar>
  );
}
