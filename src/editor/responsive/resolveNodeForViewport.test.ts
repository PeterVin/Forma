import { describe, expect, it } from 'vitest';

import { executiveDemoDocument } from '../../examples/executiveDemo';
import { resolveDocumentForViewport } from './resolveNodeForViewport';

describe('editor responsive resolver', () => {
  it('creates a responsive editor view without changing the source document', () => {
    const source = structuredClone(executiveDemoDocument);
    const mobile = resolveDocumentForViewport(executiveDemoDocument, 'xs');
    const desktop = resolveDocumentForViewport(executiveDemoDocument, 'lg');

    expect(mobile.nodes.kpis.props.direction).toBe('column');
    expect(mobile.nodes.kpis.props.spacing).toBe(1.5);
    expect(desktop.nodes.kpis.props.direction).toBe('row');
    expect(desktop.nodes.kpis.props.spacing).toBe(2.5);
    expect(mobile.nodes.root.style.sx?.px).toBe(2);
    expect(desktop.nodes.root.style.sx?.px).toBe(4);
    expect(executiveDemoDocument).toEqual(source);
  });

  it('preserves non-responsive nested MUI sx objects', () => {
    const resolved = resolveDocumentForViewport(executiveDemoDocument, 'sm');
    expect(
      resolved.nodes['revenue-content'].style.sx?.['&:last-child'],
    ).toEqual({
      pb: 3,
    });
  });
});
