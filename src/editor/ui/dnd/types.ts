export type DragSurface = 'palette' | 'canvas' | 'layers';

export type DragSource =
  | {
      readonly kind: 'palette';
      readonly componentType: string;
      readonly label: string;
    }
  | {
      readonly kind: 'node';
      readonly nodeId: string;
      readonly label: string;
      readonly surface: 'canvas' | 'layers';
    };

export type DropPosition = 'before' | 'inside' | 'after';

export interface DroppableNodeData {
  readonly nodeId: string;
  readonly surface: 'canvas' | 'layers';
  readonly canHaveChildren: boolean;
}

export interface DropTarget extends DroppableNodeData {
  readonly position: DropPosition;
}

export interface DropIntent {
  readonly source: DragSource;
  readonly targetParentId: string;
  readonly index: number;
}

export type DropIntentResult =
  | { readonly success: true; readonly intent: DropIntent }
  | { readonly success: false; readonly message: string };
