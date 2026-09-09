import { Stack, type StackProps } from '@mui/material';

import type { ComponentDefinition } from '../types';
import { withSx } from './helpers';

export const StackDefinition: ComponentDefinition = {
  type: 'mui.stack',
  label: 'Stack',
  category: 'Layout',
  canHaveChildren: true,
  defaultProps: { spacing: 2 },
  render: (node, children) => (
    <Stack {...(withSx(node) as unknown as StackProps)}>{children}</Stack>
  ),
};
