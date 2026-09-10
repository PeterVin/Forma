import type { ComponentRegistry } from '../../registry/ComponentRegistry';
import type { PageDocument } from '../document/types';

export interface ComponentConstraints {
  readonly allowedParents?: readonly string[];
  readonly allowedChildren?: readonly string[];
}

export interface PlacementRequest {
  readonly document: PageDocument;
  readonly registry: ComponentRegistry;
  readonly nodeType: string;
  readonly nodeId?: string;
  readonly parentId: string;
  readonly index?: number;
}

export type PlacementResult =
  | { readonly success: true }
  | {
      readonly success: false;
      readonly code:
        | 'unknown_child'
        | 'unknown_parent'
        | 'parent_not_found'
        | 'leaf_parent'
        | 'parent_rejects_child'
        | 'child_rejects_parent'
        | 'self_parent'
        | 'descendant_parent';
      readonly message: string;
    };
