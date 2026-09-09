import { createContext, useContext } from 'react';

import type { PageDocument } from '../editor/document/types';
import type { ComponentRegistry } from '../registry/Componentregistry';

export interface DocumentContextValue {
  readonly document: PageDocument;
  readonly registry: ComponentRegistry;
}

export const DocumentContext = createContext<DocumentContextValue | null>(null);

export function useDocumentContext(): DocumentContextValue {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('NodeRenderer must be rendered inside DocumentRenderer.');
  }
  return context;
}
