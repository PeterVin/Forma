import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { PageDocument } from '../editor/document/types';
import { createDefaultRegistry } from '../registry/createDefaultRegistry';
import { DocumentRenderer } from './DocumentRenderer';

const simpleDocument = {
  version: 1,
  id: 'simple',
  name: 'Simple document',
  rootNodeId: 'box',
  nodes: {
    box: {
      id: 'box',
      type: 'mui.box',
      children: ['text'],
      props: {},
      style: {},
    },
    text: {
      id: 'text',
      type: 'mui.typography',
      parentId: 'box',
      children: [],
      props: { content: 'Rendered from JSON' },
      style: {},
    },
  },
} satisfies PageDocument;

describe('DocumentRenderer', () => {
  it('renders a recursive Box and Typography tree', () => {
    render(
      <DocumentRenderer
        document={simpleDocument}
        registry={createDefaultRegistry()}
      />,
    );

    expect(screen.getByText('Rendered from JSON')).toBeInTheDocument();
  });

  it('renders an unknown component fallback', () => {
    const document = {
      ...simpleDocument,
      nodes: {
        ...simpleDocument.nodes,
        box: { ...simpleDocument.nodes.box, type: 'mui.missing' },
      },
    };

    render(
      <DocumentRenderer
        document={document}
        registry={createDefaultRegistry()}
      />,
    );

    expect(screen.getByText('Unknown component')).toBeInTheDocument();
    expect(screen.getByText(/mui\.missing/)).toBeInTheDocument();
  });
});
