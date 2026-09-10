import { Box, type BoxProps } from '@mui/material';

import type { ComponentDefinition } from '../types';
import { withSx } from './helpers';

export const BoxDefinition: ComponentDefinition = {
  type: 'mui.box',
  label: 'Box',
  category: 'Layout',
  canHaveChildren: true,
  defaultProps: {},
  inspector: [
    {
      key: 'display',
      label: 'Display',
      group: 'layout',
      target: 'sx',
      editor: 'select',
      responsive: true,
      options: ['block', 'flex', 'grid', 'inline-flex', 'none'].map(
        (value) => ({
          label: value,
          value,
        }),
      ),
    },
    {
      key: 'width',
      label: 'Width',
      group: 'layout',
      target: 'sx',
      editor: 'text',
      responsive: true,
    },
    {
      key: 'height',
      label: 'Height',
      group: 'layout',
      target: 'sx',
      editor: 'text',
      responsive: true,
    },
    {
      key: 'padding',
      label: 'Padding',
      group: 'layout',
      target: 'sx',
      editor: 'number',
      responsive: true,
    },
    {
      key: 'margin',
      label: 'Margin',
      group: 'layout',
      target: 'sx',
      editor: 'number',
      responsive: true,
    },
  ],
  render: (node, children) => (
    <Box {...(withSx(node) as unknown as BoxProps)}>{children}</Box>
  ),
};
