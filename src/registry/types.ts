import type { ReactNode } from 'react';

import type {
  EditorNode,
  JsonObject,
  JsonPrimitive,
} from '../editor/document/types';

export type PropertyEditorType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'color'
  | 'spacing'
  | 'json'
  | (string & {});

export type PropertyGroup = 'content' | 'appearance' | 'layout' | 'advanced';

export interface PropertyOption {
  readonly label: string;
  readonly value: JsonPrimitive;
}

export interface PropertyDefinition {
  readonly key: string;
  readonly label: string;
  readonly group: PropertyGroup;
  readonly target: 'props' | 'sx';
  readonly editor: PropertyEditorType;
  readonly options?: readonly PropertyOption[];
  readonly description?: string;
}

export interface ComponentDefinition {
  readonly type: string;
  readonly label: string;
  readonly category: 'Layout' | 'Surface' | 'Content' | 'Inputs' | string;
  readonly canHaveChildren: boolean;
  readonly defaultProps: JsonObject;
  readonly render: (node: EditorNode, children: ReactNode) => ReactNode;
}
