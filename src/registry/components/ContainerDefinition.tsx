import { Container, type ContainerProps } from '@mui/material';
import { z } from 'zod';

import type { ComponentDefinition } from '../types';
import { withSx } from './helpers';

export const ContainerPropsSchema = z
  .object({
    maxWidth: z
      .union([z.enum(['xs', 'sm', 'md', 'lg', 'xl']), z.literal(false)])
      .optional(),
    disableGutters: z.boolean().optional(),
  })
  .passthrough();

export const ContainerDefinition: ComponentDefinition = {
  type: 'mui.container',
  label: 'Container',
  category: 'Layout',
  canHaveChildren: true,
  defaultProps: { maxWidth: 'lg' },
  propSchema: ContainerPropsSchema,
  inspector: [
    {
      key: 'maxWidth',
      label: 'Maximum width',
      group: 'layout',
      target: 'props',
      editor: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'].map((value) => ({
        label: value,
        value,
      })),
    },
    {
      key: 'disableGutters',
      label: 'Disable gutters',
      group: 'layout',
      target: 'props',
      editor: 'boolean',
    },
  ],
  render: (node, children) => (
    <Container {...(withSx(node) as unknown as ContainerProps)}>
      {children}
    </Container>
  ),
};
