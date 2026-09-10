import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';

import { LayersPanel } from './layers/LayersPanel';
import { ComponentPalette } from './palette/ComponentPalette';

export function EditorSidebar() {
  const [tab, setTab] = useState<'components' | 'layers'>('components');

  return (
    <Box
      component="aside"
      aria-label="Editor sidebar"
      sx={{
        minWidth: 0,
        minHeight: 0,
        display: 'grid',
        gridTemplateRows: '49px 1fr',
      }}
    >
      <Tabs
        value={tab}
        variant="fullWidth"
        aria-label="Editor sidebar panels"
        onChange={(_, value: 'components' | 'layers') => setTab(value)}
      >
        <Tab value="components" label="Components" />
        <Tab value="layers" label="Layers" />
      </Tabs>
      {tab === 'components' ? <ComponentPalette /> : <LayersPanel />}
    </Box>
  );
}
