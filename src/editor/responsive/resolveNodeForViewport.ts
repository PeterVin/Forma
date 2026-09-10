import type { EditorNode, JsonObject, PageDocument } from '../document/types';
import type { BreakpointKey } from './types';
import {
  isResponsiveValue,
  resolveResponsiveArray,
  resolveResponsiveValue,
} from './responsiveValue';

function resolveTopLevelValues(
  values: JsonObject,
  breakpoint: BreakpointKey,
): JsonObject {
  return Object.fromEntries(
    Object.entries(values).flatMap(([key, value]) => {
      if (isResponsiveValue(value)) {
        const resolved = resolveResponsiveValue(value, breakpoint);
        return resolved === undefined ? [] : [[key, resolved] as const];
      }
      if (Array.isArray(value)) {
        const resolved = resolveResponsiveArray(value, breakpoint);
        return resolved === undefined ? [] : [[key, resolved] as const];
      }
      return [[key, value] as const];
    }),
  );
}

export function resolveNodeForViewport(
  node: EditorNode,
  breakpoint: BreakpointKey,
): EditorNode {
  return {
    ...node,
    props: resolveTopLevelValues(node.props, breakpoint),
    style: {
      ...node.style,
      ...(node.style.sx
        ? { sx: resolveTopLevelValues(node.style.sx, breakpoint) }
        : {}),
    },
  };
}

export function resolveDocumentForViewport(
  document: PageDocument,
  breakpoint: BreakpointKey,
): PageDocument {
  return {
    ...document,
    nodes: Object.fromEntries(
      Object.entries(document.nodes).map(([id, node]) => [
        id,
        resolveNodeForViewport(node, breakpoint),
      ]),
    ),
  };
}
