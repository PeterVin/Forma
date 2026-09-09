import { describe, expect, it } from 'vitest';

import { executiveDemoDocument } from '../../examples/executiveDemo';
import { deserializeDocument, serializeDocument } from './utilities';
import { validateDocument } from './validation';

describe('page document validation', () => {
  it('accepts a valid document', () => {
    expect(validateDocument(executiveDemoDocument).success).toBe(true);
  });

  it('rejects a missing root node', () => {
    const document = { ...executiveDemoDocument, rootNodeId: 'missing' };
    const result = validateDocument(document);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.join(' ')).toContain('Root node');
  });

  it('rejects a missing child', () => {
    const document = {
      ...executiveDemoDocument,
      nodes: {
        ...executiveDemoDocument.nodes,
        root: { ...executiveDemoDocument.nodes.root, children: ['missing'] },
      },
    };
    const result = validateDocument(document);

    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.errors.join(' ')).toContain('does not exist');
  });

  it('rejects a self-referencing child', () => {
    const document = {
      ...executiveDemoDocument,
      nodes: {
        ...executiveDemoDocument.nodes,
        root: { ...executiveDemoDocument.nodes.root, children: ['root'] },
      },
    };
    const result = validateDocument(document);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.join(' ')).toContain('own child');
  });
});

describe('document serialization', () => {
  it('round-trips without changing the document', () => {
    expect(
      deserializeDocument(serializeDocument(executiveDemoDocument)),
    ).toEqual(executiveDemoDocument);
  });
});
