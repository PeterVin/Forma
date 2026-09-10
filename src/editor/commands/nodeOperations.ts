import type { ComponentRegistry } from '../../registry/ComponentRegistry';
import { validateDocument } from '../document/validation';
import type { EditorNode, JsonObject, PageDocument } from '../document/types';
import type { OperationResult } from './types';

function failure(
  code: Parameters<typeof operationError>[0],
  message: string,
): OperationResult<PageDocument> {
  return { success: false, error: operationError(code, message) };
}

function operationError(
  code:
    | 'node_not_found'
    | 'parent_not_found'
    | 'duplicate_id'
    | 'root_operation_forbidden'
    | 'invalid_parent'
    | 'invalid_subtree'
    | 'unknown_component'
    | 'invalid_document',
  message: string,
) {
  return { code, message } as const;
}

function finish(document: PageDocument): OperationResult<PageDocument> {
  if (import.meta.env.DEV) {
    const validation = validateDocument(document);
    if (!validation.success) {
      return failure(
        'invalid_document',
        `Mutation violated document invariants: ${validation.errors.join('; ')}`,
      );
    }
  }
  return { success: true, value: document };
}

function replaceNode(
  document: PageDocument,
  nodeId: string,
  node: EditorNode,
): PageDocument {
  return {
    ...document,
    nodes: { ...document.nodes, [nodeId]: node },
  };
}

function insertAt(
  children: readonly string[],
  childId: string,
  index?: number,
): readonly string[] {
  const target =
    index === undefined
      ? children.length
      : Math.max(0, Math.min(index, children.length));
  return [...children.slice(0, target), childId, ...children.slice(target)];
}

function canAcceptChildren(
  parent: EditorNode,
  registry: ComponentRegistry,
): OperationResult<EditorNode> {
  const definition = registry.get(parent.type);
  if (!definition) {
    return {
      success: false,
      error: operationError(
        'unknown_component',
        `Cannot edit children of unknown component "${parent.type}".`,
      ),
    };
  }
  if (!definition.canHaveChildren) {
    return {
      success: false,
      error: operationError(
        'invalid_parent',
        `${definition.label} components cannot contain children.`,
      ),
    };
  }
  return { success: true, value: parent };
}

function collectSubtree(
  document: PageDocument,
  nodeId: string,
): readonly string[] {
  const collected: string[] = [];
  const visit = (currentId: string): void => {
    const node = document.nodes[currentId];
    if (!node) return;
    collected.push(currentId);
    node.children.forEach(visit);
  };
  visit(nodeId);
  return collected;
}

function createUniqueCopyId(originalId: string, usedIds: Set<string>): string {
  let candidate = `${originalId}-copy-${crypto.randomUUID().slice(0, 8)}`;
  while (usedIds.has(candidate)) {
    candidate = `${originalId}-copy-${crypto.randomUUID().slice(0, 8)}`;
  }
  usedIds.add(candidate);
  return candidate;
}

export function updateNodeProps(
  document: PageDocument,
  nodeId: string,
  patch: JsonObject,
): OperationResult<PageDocument> {
  const node = document.nodes[nodeId];
  if (!node)
    return failure('node_not_found', `Node "${nodeId}" does not exist.`);

  const nextProps = { ...node.props, ...patch };
  if (
    Object.entries(patch).every(([key, value]) => node.props[key] === value)
  ) {
    return { success: true, value: document };
  }

  return finish(replaceNode(document, nodeId, { ...node, props: nextProps }));
}

export function updateNodeSx(
  document: PageDocument,
  nodeId: string,
  patch: JsonObject,
): OperationResult<PageDocument> {
  const node = document.nodes[nodeId];
  if (!node)
    return failure('node_not_found', `Node "${nodeId}" does not exist.`);

  const currentSx = node.style.sx ?? {};
  if (Object.entries(patch).every(([key, value]) => currentSx[key] === value)) {
    return { success: true, value: document };
  }

  return finish(
    replaceNode(document, nodeId, {
      ...node,
      style: { ...node.style, sx: { ...currentSx, ...patch } },
    }),
  );
}

export function replaceNodeProps(
  document: PageDocument,
  nodeId: string,
  props: JsonObject,
): OperationResult<PageDocument> {
  const node = document.nodes[nodeId];
  if (!node)
    return failure('node_not_found', `Node "${nodeId}" does not exist.`);
  if (JSON.stringify(node.props) === JSON.stringify(props)) {
    return { success: true, value: document };
  }
  return finish(
    replaceNode(document, nodeId, { ...node, props: { ...props } }),
  );
}

export function addNode(
  document: PageDocument,
  parentId: string,
  node: EditorNode,
  registry: ComponentRegistry,
  index?: number,
): OperationResult<PageDocument> {
  const parent = document.nodes[parentId];
  if (!parent)
    return failure('parent_not_found', `Parent "${parentId}" does not exist.`);
  if (document.nodes[node.id])
    return failure('duplicate_id', `Node id "${node.id}" already exists.`);
  if (!registry.has(node.type)) {
    return failure(
      'unknown_component',
      `Component "${node.type}" is not registered.`,
    );
  }
  if (node.children.length > 0) {
    return failure(
      'invalid_subtree',
      'The add command accepts one childless node at a time.',
    );
  }

  const parentCheck = canAcceptChildren(parent, registry);
  if (!parentCheck.success) return parentCheck;

  const child = { ...node, parentId };
  const nextParent = {
    ...parent,
    children: insertAt(parent.children, child.id, index),
  };
  return finish({
    ...document,
    nodes: { ...document.nodes, [parentId]: nextParent, [child.id]: child },
  });
}

export function removeNode(
  document: PageDocument,
  nodeId: string,
): OperationResult<PageDocument> {
  const node = document.nodes[nodeId];
  if (!node)
    return failure('node_not_found', `Node "${nodeId}" does not exist.`);
  if (nodeId === document.rootNodeId) {
    return failure(
      'root_operation_forbidden',
      'The root component cannot be deleted.',
    );
  }

  const parent = node.parentId ? document.nodes[node.parentId] : undefined;
  if (!parent)
    return failure('parent_not_found', `Parent of "${nodeId}" does not exist.`);

  const removedIds = new Set(collectSubtree(document, nodeId));
  const nextNodes = Object.fromEntries(
    Object.entries(document.nodes).filter(([id]) => !removedIds.has(id)),
  );
  nextNodes[parent.id] = {
    ...parent,
    children: parent.children.filter((childId) => childId !== nodeId),
  };

  return finish({ ...document, nodes: nextNodes });
}

export function moveNode(
  document: PageDocument,
  nodeId: string,
  newParentId: string,
  registry: ComponentRegistry,
  index?: number,
): OperationResult<PageDocument> {
  const node = document.nodes[nodeId];
  if (!node)
    return failure('node_not_found', `Node "${nodeId}" does not exist.`);
  if (nodeId === document.rootNodeId) {
    return failure(
      'root_operation_forbidden',
      'The root component cannot be moved.',
    );
  }
  const oldParent = node.parentId ? document.nodes[node.parentId] : undefined;
  if (!oldParent)
    return failure('parent_not_found', `Parent of "${nodeId}" does not exist.`);
  const newParent = document.nodes[newParentId];
  if (!newParent)
    return failure(
      'parent_not_found',
      `Parent "${newParentId}" does not exist.`,
    );
  if (nodeId === newParentId) {
    return failure(
      'invalid_parent',
      'A component cannot be moved into itself.',
    );
  }
  if (collectSubtree(document, nodeId).includes(newParentId)) {
    return failure(
      'invalid_parent',
      'A component cannot be moved into its own descendant.',
    );
  }

  const parentCheck = canAcceptChildren(newParent, registry);
  if (!parentCheck.success) return parentCheck;

  const oldChildren = oldParent.children.filter(
    (childId) => childId !== nodeId,
  );
  const destinationChildren =
    oldParent.id === newParent.id ? oldChildren : newParent.children;
  const movedNode = { ...node, parentId: newParent.id };
  const nextNodes = {
    ...document.nodes,
    [nodeId]: movedNode,
    [oldParent.id]: { ...oldParent, children: oldChildren },
    [newParent.id]: {
      ...newParent,
      children: insertAt(destinationChildren, nodeId, index),
    },
  };

  return finish({ ...document, nodes: nextNodes });
}

export function duplicateNode(
  document: PageDocument,
  nodeId: string,
): OperationResult<PageDocument> {
  const node = document.nodes[nodeId];
  if (!node)
    return failure('node_not_found', `Node "${nodeId}" does not exist.`);
  if (nodeId === document.rootNodeId) {
    return failure(
      'root_operation_forbidden',
      'The root component cannot be duplicated.',
    );
  }
  const parent = node.parentId ? document.nodes[node.parentId] : undefined;
  if (!parent)
    return failure('parent_not_found', `Parent of "${nodeId}" does not exist.`);

  const subtreeIds = collectSubtree(document, nodeId);
  const usedIds = new Set(Object.keys(document.nodes));
  const idMap = new Map(
    subtreeIds.map((originalId) => [
      originalId,
      createUniqueCopyId(originalId, usedIds),
    ]),
  );
  const clonedEntries = subtreeIds.map(
    (originalId): readonly [string, EditorNode] => {
      const original = document.nodes[originalId];
      const cloneId = idMap.get(originalId)!;
      const cloneParentId =
        originalId === nodeId
          ? parent.id
          : original.parentId
            ? idMap.get(original.parentId)
            : undefined;
      return [
        cloneId,
        {
          ...original,
          id: cloneId,
          ...(cloneParentId ? { parentId: cloneParentId } : {}),
          children: original.children.map((childId) => idMap.get(childId)!),
          props: structuredClone(original.props),
          style: structuredClone(original.style),
        },
      ];
    },
  );
  const cloneRootId = idMap.get(nodeId)!;
  const insertionIndex = parent.children.indexOf(nodeId) + 1;
  const nextParent = {
    ...parent,
    children: insertAt(parent.children, cloneRootId, insertionIndex),
  };

  return finish({
    ...document,
    nodes: {
      ...document.nodes,
      ...Object.fromEntries(clonedEntries),
      [parent.id]: nextParent,
    },
  });
}
