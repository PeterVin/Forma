import { Paper, type PaperProps } from '@mui/material';

import type { ComponentDefinition } from '../types';
import { withSx } from './helpers';

export const PaperDefinition: ComponentDefinition = {
  type: 'mui.paper',
  label: 'Paper',
  category: 'Surface',
  canHaveChildren: true,
  defaultProps: { elevation: 0 },
  render: (node, children) => (
    <Paper {...(withSx(node) as unknown as PaperProps)}>{children}</Paper>
  ),
};
