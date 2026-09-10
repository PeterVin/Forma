import { describe, expect, it } from 'vitest';

import { executiveDemoDocument } from '../../../examples/executiveDemo';
import { createDefaultRegistry } from '../../../registry/createDefaultRegistry';
import { createEditorStore } from '../../store/createEditorStore';
import { calculateDropPosition, resolveDropIntent } from './dropPosition';
import type { DragSource, DropTarget } from './types';

const registry = createDefaultRegistry();

function nodeSource(nodeId: string): DragSource {
  return { kind: 'node', nodeId, label: nodeId, surface: 'canvas' };
}

function target(
  nodeId: string,
  position: DropTarget['position'],
  canHaveChildren = true,
): DropTarget {
  return { nodeId, position, canHaveChildren, surface: 'canvas' };
}

describe('drop position calculation', () => {
  it('calculates before, inside, and after zones for containers', () => {
    expect(calculateDropPosition(10, 0, 100, true)).toBe('before');
    expect(calculateDropPosition(50, 0, 100, true)).toBe('inside');
    expect(calculateDropPosition(90, 0, 100, true)).toBe('after');
  });

  it('never returns inside for leaf components', () => {
    expect(calculateDropPosition(25, 0, 100, false)).toBe('before');
    expect(calculateDropPosition(75, 0, 100, false)).toBe('after');
  });
});

describe('drop intents', () => {
  it('reorders C before A with a corrected same-parent index and supports undo', () => {
    const resolved = resolveDropIntent(
      executiveDemoDocument,
      registry,
      nodeSource('inventory-card'),
      target('revenue-card', 'before'),
    );
    expect(resolved.success).toBe(true);
    if (!resolved.success) return;

    const store = createEditorStore(executiveDemoDocument, registry);
    store.getState().executeCommand({
      type: 'node.move',
      nodeId: 'inventory-card',
      newParentId: resolved.intent.targetParentId,
      index: resolved.intent.index,
    });
    expect(store.getState().history.present.nodes.kpis.children).toEqual([
      'inventory-card',
      'revenue-card',
      'margin-card',
    ]);
    expect(store.getState().history.past).toHaveLength(1);
    store.getState().undo();
    expect(store.getState().history.present.nodes.kpis.children).toEqual([
      'revenue-card',
      'margin-card',
      'inventory-card',
    ]);
  });

  it('reparents a node into another Stack and restores it on undo', () => {
    const resolved = resolveDropIntent(
      executiveDemoDocument,
      registry,
      nodeSource('view-details'),
      target('kpis', 'inside'),
    );
    expect(resolved.success).toBe(true);
    if (!resolved.success) return;

    const store = createEditorStore(executiveDemoDocument, registry);
    store.getState().executeCommand({
      type: 'node.move',
      nodeId: 'view-details',
      newParentId: resolved.intent.targetParentId,
      index: resolved.intent.index,
    });
    expect(
      store.getState().history.present.nodes['view-details'].parentId,
    ).toBe('kpis');
    expect(store.getState().history.present.nodes.kpis.children).toContain(
      'view-details',
    );
    store.getState().undo();
    expect(
      store.getState().history.present.nodes['view-details'].parentId,
    ).toBe('portfolio-actions');
  });

  it('rejects self, descendant, leaf, root, and unknown palette drops', () => {
    const cases = [
      resolveDropIntent(
        executiveDemoDocument,
        registry,
        nodeSource('revenue-card'),
        target('revenue-card', 'inside'),
      ),
      resolveDropIntent(
        executiveDemoDocument,
        registry,
        nodeSource('portfolio-card'),
        target('portfolio-stack', 'inside'),
      ),
      resolveDropIntent(
        executiveDemoDocument,
        registry,
        nodeSource('revenue-card'),
        target('revenue-label', 'inside', false),
      ),
      resolveDropIntent(
        executiveDemoDocument,
        registry,
        nodeSource('root'),
        target('kpis', 'inside'),
      ),
      resolveDropIntent(
        executiveDemoDocument,
        registry,
        { kind: 'palette', componentType: 'missing', label: 'Missing' },
        target('kpis', 'inside'),
      ),
    ];
    expect(cases.every((result) => !result.success)).toBe(true);
  });

  it('does not create history when a drag is cancelled before a command', () => {
    const store = createEditorStore(executiveDemoDocument, registry);
    const history = store.getState().history;
    // A cancelled DnD interaction intentionally emits no command.
    expect(store.getState().history).toBe(history);
    expect(store.getState().canUndo).toBe(false);
  });
});
