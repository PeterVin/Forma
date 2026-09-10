import { CardContent, type CardContentProps } from '@mui/material';

import type { ComponentDefinition } from '../types';
import { withSx } from './helpers';

export const CardContentDefinition: ComponentDefinition = {
  type: 'mui.cardContent',
  label: 'Card content',
  category: 'Surface',
  canHaveChildren: true,
  constraints: { allowedParents: ['mui.card'] },
  defaultProps: {},
  render: (node, children) => (
    <CardContent {...(withSx(node) as unknown as CardContentProps)}>
      {children}
    </CardContent>
  ),
};
