import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Button, type ButtonProps } from '@mui/material';

import type { ComponentDefinition } from '../types';
import { contentProps } from './helpers';

export const ButtonDefinition: ComponentDefinition = {
  type: 'mui.button',
  label: 'Button',
  category: 'Inputs',
  canHaveChildren: false,
  defaultProps: { content: 'Button', variant: 'contained' },
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
