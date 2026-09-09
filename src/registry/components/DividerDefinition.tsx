import { Divider, type DividerProps } from '@mui/material';

import type { ComponentDefinition } from '../types';
import { withSx } from './helpers';

export const DividerDefinition: ComponentDefinition = {
  type: 'mui.divider',
  label: 'Divider',
  category: 'Content',
  canHaveChildren: false,
  defaultProps: {},
  render: (node) => <Divider {...(withSx(node) as unknown as DividerProps)} />,
};
