import { Box, type BoxProps } from '@mui/material';

import type { ComponentDefinition } from '../types';
import { withSx } from './helpers';

export const BoxDefinition: ComponentDefinition = {
  type: 'mui.box',
  label: 'Box',
  category: 'Layout',
  canHaveChildren: true,
  defaultProps: {},
  render: (node, children) => (
    <Box {...(withSx(node) as unknown as BoxProps)}>{children}</Box>
  ),
};
