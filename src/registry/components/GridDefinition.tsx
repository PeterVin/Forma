import { Grid, type GridProps } from '@mui/material';

import type { ComponentDefinition } from '../types';
import { withSx } from './helpers';

export const GridDefinition: ComponentDefinition = {
  type: 'mui.grid',
  label: 'Grid',
  category: 'Layout',
  canHaveChildren: true,
  defaultProps: {},
  render: (node, children) => (
    <Grid {...(withSx(node) as unknown as GridProps)}>{children}</Grid>
  ),
};
