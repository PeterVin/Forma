import { describe, expect, it } from 'vitest';

import { executiveDemoDocument } from '../../examples/executiveDemo';
import { createDefaultRegistry } from '../../registry/createDefaultRegistry';
import { createEditorStore } from './createEditorStore';

function updateContent(
  store: ReturnType<typeof createEditorStore>,
  content: string,
) {
  store.getState().executeCommand({
    type: 'node.updateProps',
    nodeId: 'revenue-label',
    patch: { content },
  });
}

describe('editor store history', () => {
  it('executes, undoes, and redoes commands', () => {
    const store = createEditorStore(
      executiveDemoDocument,
      createDefaultRegistry(),
    );
    updateContent(store, 'Net Revenue');
    updateContent(store, 'Gross Revenue');
    expect(
      store.getState().history.present.nodes['revenue-label'].props.content,
    ).toBe('Gross Revenue');

    store.getState().undo();
    expect(
      store.getState().history.present.nodes['revenue-label'].props.content,
    ).toBe('Net Revenue');
    store.getState().undo();
    expect(
      store.getState().history.present.nodes['revenue-label'].props.content,
    ).toBe('Revenue');
    store.getState().redo();
    expect(
      store.getState().history.present.nodes['revenue-label'].props.content,
    ).toBe('Net Revenue');
  });

  it('clears future history after a new command', () => {
    const store = createEditorStore(
      executiveDemoDocument,
      createDefaultRegistry(),
    );
    updateContent(store, 'Net Revenue');
    store.getState().undo();
    updateContent(store, 'Adjusted Revenue');

    expect(store.getState().canRedo).toBe(false);
    expect(store.getState().history.future).toHaveLength(0);
  });

  it('enforces the configured history limit', () => {
    const store = createEditorStore(
      executiveDemoDocument,
      createDefaultRegistry(),
      {
        historyLimit: 2,
      },
    );
    updateContent(store, 'A');
    updateContent(store, 'B');
    updateContent(store, 'C');
    expect(store.getState().history.past).toHaveLength(2);
  });
});

describe('editor selection', () => {
  it('selects, changes, clears, and ignores invalid node IDs', () => {
    const store = createEditorStore(
      executiveDemoDocument,
      createDefaultRegistry(),
    );
    store.getState().selectNode('revenue-label');
    expect(store.getState().selectedNodeId).toBe('revenue-label');
    store.getState().selectNode('margin-label');
    expect(store.getState().selectedNodeId).toBe('margin-label');
    store.getState().selectNode('missing');
    expect(store.getState().selectedNodeId).toBe('margin-label');
    store.getState().clearSelection();
    expect(store.getState().selectedNodeId).toBeNull();
  });

  it('clears a deleted selection and restores the document on undo', () => {
    const store = createEditorStore(
      executiveDemoDocument,
      createDefaultRegistry(),
    );
    store.getState().selectNode('revenue-card');
    store
      .getState()
      .executeCommand({ type: 'node.remove', nodeId: 'revenue-card' });
    expect(store.getState().selectedNodeId).toBeNull();
    expect(
      store.getState().history.present.nodes['revenue-card'],
    ).toBeUndefined();
    store.getState().undo();
    expect(
      store.getState().history.present.nodes['revenue-card'],
    ).toBeDefined();
  });

  it('never mutates the source demo document', () => {
    const snapshot = structuredClone(executiveDemoDocument);
    const store = createEditorStore(
      executiveDemoDocument,
      createDefaultRegistry(),
    );
    updateContent(store, 'Net Revenue');
    expect(executiveDemoDocument).toEqual(snapshot);
  });
});
