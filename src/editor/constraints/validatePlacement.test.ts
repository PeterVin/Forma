import { describe, expect, it } from 'vitest';

import { executiveDemoDocument } from '../../examples/executiveDemo';
import { ComponentRegistry } from '../../registry/ComponentRegistry';
import { createDefaultRegistry } from '../../registry/createDefaultRegistry';
import { validatePlacement } from './validatePlacement';

const registry = createDefaultRegistry();

describe('placement constraints', () => {
  it('allows Card content inside Card', () => {
    expect(
      validatePlacement({
        document: executiveDemoDocument,
        registry,
        nodeType: 'mui.cardContent',
        parentId: 'revenue-card',
      }),
    ).toEqual({ success: true });
  });

  it('rejects Card content outside Card with a friendly message', () => {
    const result = validatePlacement({
      document: executiveDemoDocument,
      registry,
      nodeType: 'mui.cardContent',
      parentId: 'page-stack',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('child_rejects_parent');
      expect(result.message).toBe(
        'Card content can only be added inside Card.',
      );
    }
  });

  it('rejects leaf, self, and descendant parents centrally', () => {
    expect(
      validatePlacement({
        document: executiveDemoDocument,
        registry,
        nodeType: 'mui.card',
        nodeId: 'revenue-card',
        parentId: 'revenue-label',
      }).success,
    ).toBe(false);
    expect(
      validatePlacement({
        document: executiveDemoDocument,
        registry,
        nodeType: 'mui.card',
        nodeId: 'revenue-card',
        parentId: 'revenue-card',
      }).success,
    ).toBe(false);
    expect(
      validatePlacement({
        document: executiveDemoDocument,
        registry,
        nodeType: 'mui.paper',
        nodeId: 'portfolio-card',
        parentId: 'portfolio-stack',
      }).success,
    ).toBe(false);
  });

  it('also enforces an allowedChildren rule declared by a parent', () => {
    const constrainedRegistry = new ComponentRegistry([
      {
        type: 'test.parent',
        label: 'Parent',
        category: 'Test',
        canHaveChildren: true,
        defaultProps: {},
        constraints: { allowedChildren: ['test.allowed'] },
        render: () => null,
      },
      {
        type: 'test.allowed',
        label: 'Allowed',
        category: 'Test',
        canHaveChildren: false,
        defaultProps: {},
        render: () => null,
      },
      {
        type: 'test.blocked',
        label: 'Blocked',
        category: 'Test',
        canHaveChildren: false,
        defaultProps: {},
        render: () => null,
      },
    ]);
    const document = {
      version: 1,
      id: 'constraints',
      name: 'Constraints',
      rootNodeId: 'root',
      nodes: {
        root: {
          id: 'root',
          type: 'test.parent',
          children: [],
          props: {},
          style: {},
        },
      },
    } as const;

    expect(
      validatePlacement({
        document,
        registry: constrainedRegistry,
        nodeType: 'test.allowed',
        parentId: 'root',
      }).success,
    ).toBe(true);
    expect(
      validatePlacement({
        document,
        registry: constrainedRegistry,
        nodeType: 'test.blocked',
        parentId: 'root',
      }).success,
    ).toBe(false);
  });
});
