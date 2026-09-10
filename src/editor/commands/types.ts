import type { EditorNode, JsonObject, JsonValue } from '../document/types';

export interface PropertyPatch {
  readonly [key: string]: JsonValue | undefined;
}

export type EditorCommand =
  | {
      readonly type: 'node.updateProps';
      readonly nodeId: string;
      readonly patch: PropertyPatch;
    }
  | {
      readonly type: 'node.updateSx';
      readonly nodeId: string;
      readonly patch: PropertyPatch;
    }
  | {
      readonly type: 'node.replaceProps';
      readonly nodeId: string;
      readonly props: JsonObject;
    }
  | {
      readonly type: 'node.add';
      readonly parentId: string;
      readonly node: EditorNode;
      readonly index?: number;
    }
  | {
      readonly type: 'node.remove';
      readonly nodeId: string;
    }
  | {
      readonly type: 'node.duplicate';
      readonly nodeId: string;
    }
  | {
      readonly type: 'node.move';
      readonly nodeId: string;
      readonly newParentId: string;
      readonly index?: number;
    };

export type EditorOperationErrorCode =
  | 'node_not_found'
  | 'parent_not_found'
  | 'duplicate_id'
  | 'root_operation_forbidden'
  | 'invalid_parent'
  | 'invalid_subtree'
  | 'unknown_component'
  | 'invalid_props'
  | 'invalid_document';

export interface EditorOperationError {
  readonly code: EditorOperationErrorCode;
  readonly message: string;
}

export type OperationResult<T> =
  | { readonly success: true; readonly value: T }
  | { readonly success: false; readonly error: EditorOperationError };
