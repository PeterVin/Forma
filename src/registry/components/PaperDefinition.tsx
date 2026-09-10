import { Paper, type PaperProps } from '@mui/material';
import { z } from 'zod';

import type { ComponentDefinition } from '../types';
import { withSx } from './helpers';

export const PaperPropsSchema = z
  .object({
    elevation: z.number().int().min(0).max(24).optional(),
    variant: z.enum(['elevation', 'outlined']).optional(),
  })
  .passthrough();

export const PaperDefinition: ComponentDefinition = {
  type: 'mui.paper',
  label: 'Paper',
  category: 'Surface',
  canHaveChildren: true,
  defaultProps: { elevation: 0 },
  propSchema: PaperPropsSchema,
  inspector: [
    {
      key: 'elevation',
      label: 'Elevation',
      group: 'appearance',
      target: 'props',
      editor: 'number',
    },
    {
      key: 'variant',
      label: 'Variant',
      group: 'appearance',
      target: 'props',
      editor: 'select',
      options: ['elevation', 'outlined'].map((value) => ({
        label: value,
        value,
      })),
    },
    {
      key: 'padding',
      label: 'Padding',
      group: 'layout',
      target: 'sx',
      editor: 'number',
    },
  ],
  render: (node, children) => (
    <Paper {...(withSx(node) as unknown as PaperProps)}>{children}</Paper>
  ),
};
