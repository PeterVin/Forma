import { Stack, type StackProps } from '@mui/material';
import { z } from 'zod';

import type { ComponentDefinition } from '../types';
import { withSx } from './helpers';
import { looseComponentProps, responsiveProp } from './schemaHelpers';

const responsiveString = (values: readonly [string, ...string[]]) =>
  responsiveProp(z.enum(values));

export const StackPropsSchema = looseComponentProps({
  direction: responsiveString([
    'row',
    'row-reverse',
    'column',
    'column-reverse',
  ]).optional(),
  spacing: responsiveProp(z.number().min(0)).optional(),
  alignItems: responsiveString([
    'stretch',
    'center',
    'flex-start',
    'flex-end',
    'baseline',
  ]).optional(),
  justifyContent: responsiveString([
    'flex-start',
    'center',
    'flex-end',
    'space-between',
    'space-around',
    'space-evenly',
  ]).optional(),
});

export const StackDefinition: ComponentDefinition = {
  type: 'mui.stack',
  label: 'Stack',
  category: 'Layout',
  canHaveChildren: true,
  defaultProps: { spacing: 2 },
  propSchema: StackPropsSchema,
  inspector: [
    {
      key: 'direction',
      label: 'Direction',
      group: 'layout',
      target: 'props',
      editor: 'select',
      responsive: true,
      options: ['row', 'row-reverse', 'column', 'column-reverse'].map(
        (value) => ({
          label: value,
          value,
        }),
      ),
    },
    {
      key: 'spacing',
      label: 'Spacing',
      group: 'layout',
      target: 'props',
      editor: 'number',
      responsive: true,
    },
    {
      key: 'alignItems',
      label: 'Align items',
      group: 'layout',
      target: 'props',
      editor: 'select',
      responsive: true,
      options: ['stretch', 'center', 'flex-start', 'flex-end', 'baseline'].map(
        (value) => ({ label: value, value }),
      ),
    },
    {
      key: 'justifyContent',
      label: 'Justify content',
      group: 'layout',
      target: 'props',
      editor: 'select',
      responsive: true,
      options: [
        'flex-start',
        'center',
        'flex-end',
        'space-between',
        'space-around',
        'space-evenly',
      ].map((value) => ({ label: value, value })),
    },
  ],
  render: (node, children) => (
    <Stack {...(withSx(node) as unknown as StackProps)}>{children}</Stack>
  ),
};
