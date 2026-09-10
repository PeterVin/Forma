import type { PageDocument } from '../document/types';

export const DEFAULT_HISTORY_LIMIT = 100;

export interface EditorHistory {
  readonly past: readonly PageDocument[];
  readonly present: PageDocument;
  readonly future: readonly PageDocument[];
}

export function createEditorHistory(document: PageDocument): EditorHistory {
  return { past: [], present: document, future: [] };
}

export function pushHistory(
  history: EditorHistory,
  document: PageDocument,
  limit = DEFAULT_HISTORY_LIMIT,
): EditorHistory {
  if (document === history.present) return history;
  const nextPast = [...history.past, history.present];
  return {
    past: nextPast.slice(Math.max(0, nextPast.length - Math.max(1, limit))),
    present: document,
    future: [],
  };
}

export function undoHistory(history: EditorHistory): EditorHistory {
  const previous = history.past.at(-1);
  if (!previous) return history;
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redoHistory(history: EditorHistory): EditorHistory {
  const next = history.future[0];
  if (!next) return history;
  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1),
  };
}
