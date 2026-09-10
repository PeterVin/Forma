import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { executiveDemoDocument } from '../../../examples/executiveDemo';
import { createDefaultRegistry } from '../../../registry/createDefaultRegistry';
import { createEditorStore } from '../../store/createEditorStore';
import { EditorShell } from '../EditorShell';

function renderInspector(selectedNodeId: string) {
  const registry = createDefaultRegistry();
  const store = createEditorStore(executiveDemoDocument, registry);
  store.getState().selectNode(selectedNodeId);
  render(<EditorShell store={store} />);
  return store;
}

describe('PropertyInspector', () => {
  it('edits Typography content on blur through a command', () => {
    const store = renderInspector('revenue-label');
    expect(
      screen.getByRole('heading', { name: 'Typography' }),
    ).toBeInTheDocument();

    const textField = screen.getByLabelText('Text');
    fireEvent.change(textField, { target: { value: 'Net Revenue' } });
    expect(
      store.getState().history.present.nodes['revenue-label'].props.content,
    ).toBe('Revenue');
    fireEvent.blur(textField);
    expect(
      store.getState().history.present.nodes['revenue-label'].props.content,
    ).toBe('Net Revenue');
  });

  it('changes Button variant and updates the rendered MUI button', () => {
    const store = renderInspector('view-details');
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Variant' }));
    fireEvent.click(screen.getByRole('option', { name: 'outlined' }));

    expect(
      store.getState().history.present.nodes['view-details'].props.variant,
    ).toBe('outlined');
    expect(screen.getByRole('button', { name: /View details/ })).toHaveClass(
      'MuiButton-outlined',
    );
  });
});
