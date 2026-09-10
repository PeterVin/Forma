import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { emptyPageDocument } from '../../../examples/emptyDocument';
import { createDefaultRegistry } from '../../../registry/createDefaultRegistry';
import type { ComponentDefinition } from '../../../registry/types';
import { createEditorStore } from '../../store/createEditorStore';
import { EditorStoreProvider } from '../../store/EditorStoreProvider';
import { DndProvider } from '../dnd/DndProvider';
import { ComponentPalette } from './ComponentPalette';

function renderPalette(hiddenDefinition?: ComponentDefinition) {
  const registry = createDefaultRegistry();
  if (hiddenDefinition) registry.register(hiddenDefinition);
  const store = createEditorStore(emptyPageDocument, registry);
  render(
    <EditorStoreProvider store={store}>
      <DndProvider>
        <ComponentPalette />
      </DndProvider>
    </EditorStoreProvider>,
  );
  return store;
}

describe('ComponentPalette', () => {
  it('lists registry components grouped by category', () => {
    renderPalette();
    expect(screen.getByRole('button', { name: 'Add Box' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add Typography' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add Button' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Layout' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Surfaces' }),
    ).toBeInTheDocument();
  });

  it('searches label, type, and category case-insensitively', () => {
    renderPalette();
    fireEvent.change(screen.getByLabelText('Search components'), {
      target: { value: 'TYP' },
    });
    expect(
      screen.getByRole('button', { name: 'Add Typography' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add Button' }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search components'), {
      target: { value: 'mui.button' },
    });
    expect(
      screen.getByRole('button', { name: 'Add Button' }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search components'), {
      target: { value: 'inputs' },
    });
    expect(
      screen.getByRole('button', { name: 'Add Button' }),
    ).toBeInTheDocument();
  });

  it('does not display definitions hidden from the palette', () => {
    renderPalette({
      type: 'custom.hidden',
      label: 'Hidden widget',
      category: 'Content',
      canHaveChildren: false,
      defaultProps: {},
      palette: { hidden: true },
      render: () => null,
    });
    expect(
      screen.queryByRole('button', { name: 'Add Hidden widget' }),
    ).not.toBeInTheDocument();
  });

  it('builds Stack → Typography + Button from an empty page using click-add', () => {
    const store = renderPalette();
    fireEvent.click(screen.getByRole('button', { name: 'Add Stack' }));
    const stackId = store.getState().selectedNodeId!;
    expect(store.getState().history.present.nodes[stackId].parentId).toBe(
      'root',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add Typography' }));
    const typographyId = store.getState().selectedNodeId!;
    expect(store.getState().history.present.nodes[typographyId].parentId).toBe(
      stackId,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add Button' }));
    const buttonId = store.getState().selectedNodeId!;
    const document = store.getState().history.present;
    expect(document.nodes[buttonId].parentId).toBe(stackId);
    expect(document.nodes[stackId].children).toEqual([typographyId, buttonId]);
    expect(document.nodes[typographyId].props.content).toBe('Text');
    expect(document.nodes[buttonId].props.content).toBe('Button');
  });
});
