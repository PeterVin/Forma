import { Alert, AlertTitle } from '@mui/material';
import { useMemo } from 'react';

import { validateDocument } from '../editor/document/validation';
import type { ComponentRegistry } from '../registry/ComponentRegistry';
import { validateDocumentComponents } from '../registry/validation';
import { DocumentContext } from './DocumentContext';
import { NodeRenderer } from './NodeRenderer';

interface DocumentRendererProps {
  readonly document: unknown;
  readonly registry: ComponentRegistry;
}

export function DocumentRenderer({
  document: input,
  registry,
}: DocumentRendererProps) {
  const validation = useMemo(() => validateDocument(input), [input]);

  if (!validation.success) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        <AlertTitle>Invalid page document</AlertTitle>
        {import.meta.env.DEV
          ? validation.errors.join(' · ')
          : 'This page cannot be displayed.'}
      </Alert>
    );
  }

  const componentValidation = validateDocumentComponents(
    validation.document,
    registry,
  );
  if (!componentValidation.success) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        <AlertTitle>Invalid component properties</AlertTitle>
        {import.meta.env.DEV
          ? componentValidation.errors.join(' · ')
          : 'This page cannot be displayed.'}
      </Alert>
    );
  }

  const value = { document: validation.document, registry };

  return (
    <DocumentContext.Provider value={value}>
      <NodeRenderer nodeId={validation.document.rootNodeId} />
    </DocumentContext.Provider>
  );
}
