import type { EditorNode, PageDocument } from './types';
import { validateDocument } from './validation';

export function getNode(
  document: PageDocument,
  id: string,
): EditorNode | undefined {
  return document.nodes[id];
}

export function getChildren(
  document: PageDocument,
  id: string,
): readonly EditorNode[] {
  const node = getNode(document, id);
  if (!node) return [];

  return node.children.flatMap((childId) => {
    const child = getNode(document, childId);
    return child ? [child] : [];
  });
}

export function getParent(
  document: PageDocument,
  id: string,
): EditorNode | undefined {
  const node = getNode(document, id);
  if (!node) return undefined;

  if (node.parentId) return getNode(document, node.parentId);

  return Object.values(document.nodes).find((candidate) =>
    candidate.children.includes(id),
  );
}

export function serializeDocument(document: PageDocument): string {
  const validation = validateDocument(document);
  if (!validation.success) {
    throw new Error(
      `Cannot serialize invalid document: ${validation.errors.join('; ')}`,
    );
  }

  return JSON.stringify(validation.document);
}

export function deserializeDocument(json: string): PageDocument {
  let input: unknown;
  try {
    input = JSON.parse(json) as unknown;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown JSON error';
    throw new Error(`Cannot parse document JSON: ${message}`, { cause: error });
  }

  const validation = validateDocument(input);
  if (!validation.success) {
    throw new Error(`Invalid page document: ${validation.errors.join('; ')}`);
  }

  return validation.document;
}
