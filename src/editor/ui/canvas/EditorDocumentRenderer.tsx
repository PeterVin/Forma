import { Alert, AlertTitle } from '@mui/material';
import { Fragment, useMemo } from 'react';

import { validateDocument } from '../../document/validation';
import type { ComponentRegistry } from '../../../registry/ComponentRegistry';
import { validateDocumentComponents } from '../../../registry/validation';
import {
  DocumentContext,
  useDocumentContext,
} from '../../../renderer/DocumentContext';
import { UnknownComponent } from '../../../renderer/UnknownComponent';
import { EmptyContainerDropZone } from './EmptyContainerDropZone';
import { EditorNodeWrapper } from './EditorNodeWrapper';

interface EditorTreeNodeProps {
  readonly nodeId: string;
}

function EditorTreeNode({ nodeId }: EditorTreeNodeProps) {
  const { document, registry } = useDocumentContext();
  const node = document.nodes[nodeId];
  if (!node) return <UnknownComponent type="Missing node" nodeId={nodeId} />;

  const definition = registry.get(node.type);
  if (!definition)
    return <UnknownComponent type={node.type} nodeId={node.id} />;

  const children = definition.canHaveChildren ? (
    node.children.length > 0 ? (
      <>
        {node.children.map((childId) => (
          <EditorTreeNode key={childId} nodeId={childId} />
        ))}
      </>
    ) : (
      <EmptyContainerDropZone />
    )
  ) : null;
  const nodeWithDefaults = {
    ...node,
    props: { ...definition.defaultProps, ...node.props },
  };

  return (
    <EditorNodeWrapper nodeId={node.id}>
      <Fragment>{definition.render(nodeWithDefaults, children)}</Fragment>
    </EditorNodeWrapper>
  );
}

interface EditorDocumentRendererProps {
  readonly document: unknown;
  readonly registry: ComponentRegistry;
}

export function EditorDocumentRenderer({
  document: input,
  registry,
}: EditorDocumentRendererProps) {
  const validation = useMemo(() => validateDocument(input), [input]);
  if (!validation.success) {
    return (
      <Alert severity="error">
        <AlertTitle>Invalid page document</AlertTitle>
        {validation.errors.join(' · ')}
      </Alert>
    );
  }

  const componentValidation = validateDocumentComponents(
    validation.document,
    registry,
  );
  if (!componentValidation.success) {
    return (
      <Alert severity="error">
        <AlertTitle>Invalid component properties</AlertTitle>
        {componentValidation.errors.join(' · ')}
      </Alert>
    );
  }

  return (
    <DocumentContext.Provider
      value={{ document: validation.document, registry }}
    >
      <EditorTreeNode nodeId={validation.document.rootNodeId} />
    </DocumentContext.Provider>
  );
}
