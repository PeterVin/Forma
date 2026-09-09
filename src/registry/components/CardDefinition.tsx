import { Card, type CardProps } from '@mui/material';

import type { ComponentDefinition } from '../types';
import { withSx } from './helpers';

export const CardDefinition: ComponentDefinition = {
  type: 'mui.card',
  label: 'Card',
  category: 'Surface',
  canHaveChildren: true,
  defaultProps: { variant: 'outlined' },
  render: (node, children) => (
    <Card {...(withSx(node) as unknown as CardProps)}>{children}</Card>
  ),
};
