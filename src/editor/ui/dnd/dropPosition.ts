import type { ComponentRegistry } from '../../../registry/ComponentRegistry';
import type { PageDocument } from '../../document/types';
import { validatePlacement } from '../../constraints/validatePlacement';
import type {
  DragSource,
  DropIntentResult,
  DropPosition,
  DropTarget,
} from './types';

export function calculateDropPosition(
  activeCenterY: number,
  targetTop: number,
  targetHeight: number,
  canHaveChildren: boolean,
): DropPosition {
  const ratio =
    targetHeight > 0 ? (activeCenterY - targetTop) / targetHeight : 0.5;
  if (!canHaveChildren) return ratio < 0.5 ? 'before' : 'after';
  if (ratio < 0.25) return 'before';
  if (ratio > 0.75) return 'after';
  return 'inside';
}

function collectDescendants(
  document: PageDocument,
  nodeId: string,
): Set<string> {
  const descendants = new Set<string>();
  const visit = (currentId: string): void => {
    const node = document.nodes[currentId];
    if (!node) return;
    for (const childId of node.children) {
      descendants.add(childId);
      visit(childId);
    }
  };
  visit(nodeId);
  return descendants;
}

export function resolveDropIntent(
  document: PageDocument,
  registry: ComponentRegistry,
  source: DragSource,
  target: DropTarget,
): DropIntentResult {
  const targetNode = document.nodes[target.nodeId];
  if (!targetNode)
    return { success: false, message: 'Drop target no longer exists.' };

  if (source.kind === 'palette' && !registry.has(source.componentType)) {
    return {
      success: false,
      message: `Unknown component type "${source.componentType}".`,
    };
  }

  if (source.kind === 'node') {
    const draggedNode = document.nodes[source.nodeId];
    if (!draggedNode)
      return { success: false, message: 'Dragged component no longer exists.' };
    if (source.nodeId === document.rootNodeId) {
      return { success: false, message: 'The root component cannot be moved.' };
    }
    if (source.nodeId === target.nodeId) {
      return {
        success: false,
        message: 'A component cannot be dropped onto itself.',
      };
    }
  }

  let targetParentId: string;
  let index: number;

  if (target.position === 'inside') {
    const definition = registry.get(targetNode.type);
    if (!definition?.canHaveChildren) {
      return {
        success: false,
        message: 'This component cannot contain children.',
      };
    }
    targetParentId = targetNode.id;
    index = targetNode.children.length;
  } else {
    if (!targetNode.parentId) {
      return {
        success: false,
        message: 'The root has no sibling insertion position.',
      };
    }
    const parent = document.nodes[targetNode.parentId];
    if (!parent)
      return { success: false, message: 'Target parent no longer exists.' };
    const targetIndex = parent.children.indexOf(targetNode.id);
    if (targetIndex < 0)
      return { success: false, message: 'Target order is invalid.' };
    targetParentId = parent.id;
    index = targetIndex + (target.position === 'after' ? 1 : 0);
  }

  if (source.kind === 'node') {
    const draggedNode = document.nodes[source.nodeId];
    if (
      targetParentId === source.nodeId ||
      collectDescendants(document, source.nodeId).has(targetParentId)
    ) {
      return {
        success: false,
        message: 'A component cannot be moved into its own descendant.',
      };
    }

    if (draggedNode.parentId === targetParentId) {
      const parent = document.nodes[targetParentId];
      const sourceIndex = parent.children.indexOf(source.nodeId);
      if (sourceIndex < index) index -= 1;
      if (sourceIndex === index) {
        return {
          success: false,
          message: 'The component is already in this position.',
        };
      }
    }
  }

  const sourceType =
    source.kind === 'palette'
      ? source.componentType
      : document.nodes[source.nodeId]?.type;
  if (!sourceType)
    return { success: false, message: 'Dragged component no longer exists.' };
  const placement = validatePlacement({
    document,
    registry,
    nodeType: sourceType,
    nodeId: source.kind === 'node' ? source.nodeId : undefined,
    parentId: targetParentId,
  });
  if (!placement.success) {
    return { success: false, message: placement.message };
  }

  return { success: true, intent: { source, targetParentId, index } };
}

export type ClickAddPlacement =
  | { readonly success: true; readonly parentId: string }
  | { readonly success: false; readonly message: string };

export function resolveClickAddPlacement(
  document: PageDocument,
  registry: ComponentRegistry,
  selectedNodeId: string | null,
  componentType: string,
): ClickAddPlacement {
  const selected = selectedNodeId ? document.nodes[selectedNodeId] : undefined;
  const candidateIds = [
    selected?.id,
    selected?.parentId,
    document.rootNodeId,
  ].filter(
    (candidate, index, all): candidate is string =>
      Boolean(candidate) && all.indexOf(candidate) === index,
  );
  let message = 'Select a compatible container before adding this component.';
  for (const parentId of candidateIds) {
    const result = validatePlacement({
      document,
      registry,
      nodeType: componentType,
      parentId,
    });
    if (result.success) return { success: true, parentId };
    message = result.message;
  }
  return { success: false, message };
}

export function resolveClickAddParent(
  document: PageDocument,
  registry: ComponentRegistry,
  selectedNodeId: string | null,
  componentType?: string,
): string | null {
  if (componentType) {
    const result = resolveClickAddPlacement(
      document,
      registry,
      selectedNodeId,
      componentType,
    );
    return result.success ? result.parentId : null;
  }
  const selected = selectedNodeId ? document.nodes[selectedNodeId] : undefined;
  if (selected && registry.get(selected.type)?.canHaveChildren)
    return selected.id;
  if (selected?.parentId) {
    const parent = document.nodes[selected.parentId];
    if (parent && registry.get(parent.type)?.canHaveChildren) return parent.id;
  }
  const root = document.nodes[document.rootNodeId];
  return root && registry.get(root.type)?.canHaveChildren ? root.id : null;
}
