import type { SxProps, Theme } from '@mui/material';

import type { EditorNode } from '../../editor/document/types';

type MuiAdapterProps = Record<string, unknown> & {
  readonly sx?: SxProps<Theme>;
};

function sanitizedProps(node: EditorNode): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(node.props).filter(
      ([key]) =>
        key !== 'children' &&
        key !== 'dangerouslySetInnerHTML' &&
        key !== 'key' &&
        key !== 'ref' &&
        !/^on[A-Z]/.test(key),
    ),
  );
}

export function withSx(node: EditorNode): MuiAdapterProps {
  return {
    ...sanitizedProps(node),
    ...(node.style.sx ? { sx: node.style.sx as SxProps<Theme> } : {}),
  };
}

export function contentProps(node: EditorNode): {
  readonly content: string;
  readonly muiProps: MuiAdapterProps;
} {
  const { content, ...props } = sanitizedProps(node);
  return {
    content: typeof content === 'string' ? content : String(content ?? ''),
    muiProps: {
      ...props,
      ...(node.style.sx ? { sx: node.style.sx as SxProps<Theme> } : {}),
    },
  };
}
