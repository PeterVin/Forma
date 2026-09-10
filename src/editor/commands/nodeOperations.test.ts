import { describe, expect, it } from 'vitest';

import { executiveDemoDocument } from '../../examples/executiveDemo';
import { createDefaultRegistry } from '../../registry/createDefaultRegistry';
import { createNodeFromDefinition } from '../../registry/createNodeFromDefinition';
import {
  addNode,
  duplicateNode,
  moveNode,
  removeNode,
  updateNodeProps,
  updateNodeSx,
} from './nodeOperations';

const registry = createDefaultRegistry();

describe('immutable node operations', () => {
  it('updates props and sx without changing the input document', () => {
    const snapshot = structuredClone(executiveDemoDocument);
    const propsResult = updateNodeProps(
      executiveDemoDocument,
      'revenue-label',
      {
        content: 'Net Revenue',
      },
    );
    const sxResult = updateNodeSx(executiveDemoDocument, 'revenue-card', {
      padding: 4,
    });

    expect(propsResult.success && propsResult.value).not.toBe(
      executiveDemoDocument,
    );
    expect(
      propsResult.success &&
        propsResult.value.nodes['revenue-label'].props.content,
    ).toBe('Net Revenue');
    expect(
      sxResult.success &&
        sxResult.value.nodes['revenue-card'].style.sx?.padding,
    ).toBe(4);
    expect(executiveDemoDocument).toEqual(snapshot);
  });

  it('removes patched properties when their update value is undefined', () => {
    const result = updateNodeSx(executiveDemoDocument, 'root', {
      py: undefined,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.nodes.root.style.sx?.py).toBeUndefined();
      expect(result.value.nodes.root.style.sx?.px).toEqual({
        xs: 2,
        sm: 3,
        lg: 4,
      });
    }
  });

  it('adds a node, assigns its parent, and rejects invalid parents', () => {
    const definition = registry.get('mui.box')!;
    const node = createNodeFromDefinition(definition, { id: 'new-box' });
    const result = addNode(
      executiveDemoDocument,
      'page-stack',
      node,
      registry,
      1,
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.nodes['new-box'].parentId).toBe('page-stack');
      expect(result.value.nodes['page-stack'].children[1]).toBe('new-box');
    }
    expect(
      addNode(executiveDemoDocument, 'missing', node, registry).success,
    ).toBe(false);
    expect(
      addNode(executiveDemoDocument, 'revenue-label', node, registry).success,
    ).toBe(false);
  });

  it('removes a complete subtree and protects the root', () => {
    const result = removeNode(executiveDemoDocument, 'revenue-card');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.nodes['revenue-card']).toBeUndefined();
      expect(result.value.nodes['revenue-content']).toBeUndefined();
      expect(result.value.nodes['revenue-label']).toBeUndefined();
      expect(result.value.nodes.kpis.children).not.toContain('revenue-card');
    }
    expect(removeNode(executiveDemoDocument, 'root').success).toBe(false);
  });

  it('moves a node while preserving both parent child lists', () => {
    const result = moveNode(
      executiveDemoDocument,
      'revenue-card',
      'portfolio-stack',
      registry,
      1,
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.nodes.kpis.children).not.toContain('revenue-card');
      expect(result.value.nodes['portfolio-stack'].children[1]).toBe(
        'revenue-card',
      );
      expect(result.value.nodes['revenue-card'].parentId).toBe(
        'portfolio-stack',
      );
    }
  });

  it('rejects moving into self, a descendant, or a leaf component', () => {
    expect(
      moveNode(executiveDemoDocument, 'revenue-card', 'revenue-card', registry)
        .success,
    ).toBe(false);
    expect(
      moveNode(
        executiveDemoDocument,
        'portfolio-card',
        'portfolio-stack',
        registry,
      ).success,
    ).toBe(false);
    expect(
      moveNode(
        executiveDemoDocument,
        'revenue-card',
        'portfolio-title',
        registry,
      ).success,
    ).toBe(false);
  });

  it('duplicates an entire subtree with new and consistent IDs', () => {
    const snapshot = structuredClone(executiveDemoDocument);
    const result = duplicateNode(executiveDemoDocument, 'revenue-card');

    expect(result.success).toBe(true);
    if (result.success) {
      const kpiChildren = result.value.nodes.kpis.children;
      const duplicateId = kpiChildren[kpiChildren.indexOf('revenue-card') + 1];
      const duplicate = result.value.nodes[duplicateId];
      expect(duplicate.id).not.toBe('revenue-card');
      expect(duplicate.parentId).toBe('kpis');
      expect(duplicate.children).toHaveLength(1);
      expect(result.value.nodes[duplicate.children[0]].parentId).toBe(
        duplicate.id,
      );
      expect(Object.keys(result.value.nodes)).toHaveLength(
        Object.keys(executiveDemoDocument.nodes).length + 5,
      );
    }
    expect(executiveDemoDocument).toEqual(snapshot);
  });
});
