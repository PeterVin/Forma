import { Fragment } from 'react';

import { useDocumentContext } from './DocumentContext';
import { UnknownComponent } from './UnknownComponent';

interface NodeRendererProps {
  readonly nodeId: string;
}

export function NodeRenderer({ nodeId }: NodeRendererProps) {
  const { document, registry } = useDocumentContext();
  const node = document.nodes[nodeId];

  if (!node) {
    return <UnknownComponent type="Missing node" nodeId={nodeId} />;
  }

  const definition = registry.get(node.type);
  if (!definition) {
    return <UnknownComponent type={node.type} nodeId={node.id} />;
  }

  const children = definition.canHaveChildren ? (
    <>
      {node.children.map((childId) => (
        <NodeRenderer key={childId} nodeId={childId} />
      ))}
    </>
  ) : null;

  const nodeWithDefaults = {
    ...node,
    props: { ...definition.defaultProps, ...node.props },
  };

  return <Fragment>{definition.render(nodeWithDefaults, children)}</Fragment>;
}
