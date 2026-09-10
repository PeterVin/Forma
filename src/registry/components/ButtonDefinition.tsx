import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Button, type ButtonProps } from '@mui/material';
import { z } from 'zod';

import type { ComponentDefinition } from '../types';
import { contentProps } from './helpers';

export const ButtonPropsSchema = z
  .object({
    content: z.string().optional(),
    variant: z.enum(['text', 'outlined', 'contained']).optional(),
    color: z
      .enum([
        'inherit',
        'primary',
        'secondary',
        'success',
        'error',
        'info',
        'warning',
      ])
      .optional(),
    size: z.enum(['small', 'medium', 'large']).optional(),
    disabled: z.boolean().optional(),
    fullWidth: z.boolean().optional(),
    endIcon: z.enum(['arrowForward']).optional(),
  })
  .passthrough();

export const ButtonDefinition: ComponentDefinition = {
  type: 'mui.button',
  label: 'Button',
  category: 'Inputs',
  canHaveChildren: false,
  defaultProps: { content: 'Button', variant: 'contained' },
  propSchema: ButtonPropsSchema,
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
      options: ['text', 'outlined', 'contained'].map((value) => ({
        label: value,
        value,
      })),
    },
    {
      key: 'color',
      label: 'Color',
      group: 'appearance',
      target: 'props',
      editor: 'select',
      options: ['primary', 'secondary', 'success', 'error'].map((value) => ({
        label: value,
        value,
      })),
    },
    {
      key: 'size',
      label: 'Size',
      group: 'appearance',
      target: 'props',
      editor: 'select',
      options: ['small', 'medium', 'large'].map((value) => ({
        label: value,
        value,
      })),
    },
    {
      key: 'disabled',
      label: 'Disabled',
      group: 'advanced',
      target: 'props',
      editor: 'boolean',
    },
    {
      key: 'fullWidth',
      label: 'Full width',
      group: 'layout',
      target: 'props',
      editor: 'boolean',
    },
  ],
  render: (node) => {
    const { content, muiProps } = contentProps(node);
    const { endIcon, ...buttonProps } = muiProps;
    return (
      <Button
        {...(buttonProps as unknown as ButtonProps)}
        endIcon={
          endIcon === 'arrowForward' ? (
            <ArrowForwardRoundedIcon fontSize="small" />
          ) : undefined
        }
      >
        {content}
      </Button>
    );
  },
};
