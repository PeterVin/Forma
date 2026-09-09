import { Container, type ContainerProps } from '@mui/material';

import type { ComponentDefinition } from '../types';
import { withSx } from './helpers';

export const ContainerDefinition: ComponentDefinition = {
  type: 'mui.container',
  label: 'Container',
  category: 'Layout',
  canHaveChildren: true,
  defaultProps: { maxWidth: 'lg' },
  render: (node, children) => (
    <Container {...(withSx(node) as unknown as ContainerProps)}>
      {children}
    </Container>
  ),
};
