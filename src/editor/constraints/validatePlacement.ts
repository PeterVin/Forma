import type { PlacementRequest, PlacementResult } from './types';

function failure(
  code: Exclude<PlacementResult, { success: true }>['code'],
  message: string,
): PlacementResult {
  return { success: false, code, message };
}

function containsNode(
  document: PlacementRequest['document'],
  rootId: string,
  nodeId: string,
): boolean {
  const root = document.nodes[rootId];
  if (!root) return false;
  return root.children.some(
    (childId) => childId === nodeId || containsNode(document, childId, nodeId),
  );
}

export function validatePlacement({
  document,
  registry,
  nodeType,
  nodeId,
  parentId,
}: PlacementRequest): PlacementResult {
  const childDefinition = registry.get(nodeType);
  if (!childDefinition) {
    return failure(
      'unknown_child',
      `Component "${nodeType}" is not registered.`,
    );
  }
  const parent = document.nodes[parentId];
  if (!parent) {
    return failure('parent_not_found', `Parent "${parentId}" does not exist.`);
  }
  const parentDefinition = registry.get(parent.type);
  if (!parentDefinition) {
    return failure(
      'unknown_parent',
      `Parent component "${parent.type}" is not registered.`,
    );
  }
  if (!parentDefinition.canHaveChildren) {
    return failure(
      'leaf_parent',
      `${parentDefinition.label} components cannot contain children.`,
    );
  }
  if (nodeId === parentId) {
    return failure('self_parent', 'A component cannot be moved into itself.');
  }
  if (nodeId && containsNode(document, nodeId, parentId)) {
    return failure(
      'descendant_parent',
      'A component cannot be moved into its own descendant.',
    );
  }
  if (
    parentDefinition.constraints?.allowedChildren &&
    !parentDefinition.constraints.allowedChildren.includes(nodeType)
  ) {
    return failure(
      'parent_rejects_child',
      `${parentDefinition.label} cannot contain ${childDefinition.label}.`,
    );
  }
  if (
    childDefinition.constraints?.allowedParents &&
    !childDefinition.constraints.allowedParents.includes(parent.type)
  ) {
    const allowedLabels = childDefinition.constraints.allowedParents.map(
      (type) => registry.get(type)?.label ?? type,
    );
    return failure(
      'child_rejects_parent',
      `${childDefinition.label} can only be added inside ${allowedLabels.join(' or ')}.`,
    );
  }
  return { success: true };
}
