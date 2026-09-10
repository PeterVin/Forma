import { Typography, type TypographyProps } from '@mui/material';
import { z } from 'zod';

import type { ComponentDefinition } from '../types';
import { contentProps } from './helpers';

export const TypographyPropsSchema = z
  .object({
    content: z.string().optional(),
    variant: z
      .enum([
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'subtitle1',
        'subtitle2',
        'body1',
        'body2',
        'caption',
        'overline',
      ])
      .optional(),
    align: z.enum(['inherit', 'left', 'center', 'right', 'justify']).optional(),
    color: z.string().optional(),
    noWrap: z.boolean().optional(),
  })
  .passthrough();

const variantOptions = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'subtitle1',
  'subtitle2',
  'body1',
  'body2',
  'caption',
  'overline',
].map((value) => ({ label: value, value }));

export const TypographyDefinition: ComponentDefinition = {
  type: 'mui.typography',
  label: 'Typography',
  category: 'Content',
  canHaveChildren: false,
  defaultProps: { content: 'Text', variant: 'body1' },
  propSchema: TypographyPropsSchema,
  inspector: [
    {
      key: 'content',
      label: 'Text',
      group: 'content',
      target: 'props',
      editor: 'text',
    },
    {
      key: 'variant',
      label: 'Variant',
      group: 'appearance',
      target: 'props',
      editor: 'select',
      options: variantOptions,
    },
    {
      key: 'align',
      label: 'Align',
      group: 'appearance',
      target: 'props',
      editor: 'select',
      options: ['inherit', 'left', 'center', 'right', 'justify'].map(
        (value) => ({
          label: value,
          value,
        }),
      ),
    },
    {
      key: 'color',
      label: 'Color',
      group: 'appearance',
      target: 'props',
      editor: 'text',
    },
    {
      key: 'noWrap',
      label: 'No wrap',
      group: 'appearance',
      target: 'props',
      editor: 'boolean',
    },
  ],
  render: (node) => {
    const { content, muiProps } = contentProps(node);
    return (
      <Typography {...(muiProps as unknown as TypographyProps)}>
        {content}
      </Typography>
    );
  },
};
