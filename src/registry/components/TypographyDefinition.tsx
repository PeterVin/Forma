import { Typography, type TypographyProps } from '@mui/material';

import type { ComponentDefinition } from '../types';
import { contentProps } from './helpers';

export const TypographyDefinition: ComponentDefinition = {
  type: 'mui.typography',
  label: 'Typography',
  category: 'Content',
  canHaveChildren: false,
  defaultProps: { content: 'Text', variant: 'body1' },
  render: (node) => {
    const { content, muiProps } = contentProps(node);
    return (
      <Typography {...(muiProps as unknown as TypographyProps)}>
        {content}
      </Typography>
    );
  },
};
