import type { EditorNode, JsonObject } from '../editor/document/types';
import type { ComponentDefinition } from './types';

export interface CreateNodeOverrides {
  readonly id?: string;
  readonly props?: JsonObject;
  readonly sx?: JsonObject;
}

export function createEditorNodeId(type: string): string {
  const prefix = type.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${prefix || 'node'}-${crypto.randomUUID()}`;
}

export function createNodeFromDefinition(
  definition: ComponentDefinition,
  overrides: CreateNodeOverrides = {},
): EditorNode {
  return {
    id: overrides.id ?? createEditorNodeId(definition.type),
    type: definition.type,
    children: [],
    props: structuredClone({ ...definition.defaultProps, ...overrides.props }),
    style: overrides.sx ? { sx: structuredClone(overrides.sx) } : {},
  };
}
