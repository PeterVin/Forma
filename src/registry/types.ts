import type { ReactNode } from 'react';

import type { EditorNode, JsonObject } from '../editor/document/types';

export interface ComponentDefinition {
  readonly type: string;
  readonly label: string;
  readonly category: 'Layout' | 'Surface' | 'Content' | 'Inputs' | string;
  readonly canHaveChildren: boolean;
  readonly defaultProps: JsonObject;
  readonly render: (node: EditorNode, children: ReactNode) => ReactNode;
}
