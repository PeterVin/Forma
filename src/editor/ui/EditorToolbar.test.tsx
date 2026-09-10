import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { executiveDemoDocument } from '../../examples/executiveDemo';
import { createDefaultRegistry } from '../../registry/createDefaultRegistry';
import { createEditorStore } from '../store/createEditorStore';
import { EditorShell } from './EditorShell';

describe('editor UI cleanup', () => {
  it('uses one Editor/Preview control and removes redundant preview buttons', () => {
    const store = createEditorStore(
      executiveDemoDocument,
      createDefaultRegistry(),
    );
    render(<EditorShell store={store} />);
    expect(
      screen.getByRole('button', { name: 'Editor mode' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Preview mode' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Open preview')).not.toBeInTheDocument();
    expect(screen.queryByText('Back to editor')).not.toBeInTheDocument();
  });

  it('connects Select to a stable label and outlined notch', () => {
    const store = createEditorStore(
      executiveDemoDocument,
      createDefaultRegistry(),
    );
    act(() => store.getState().selectNode('revenue-label'));
    render(<EditorShell store={store} />);

    const select = screen.getByRole('combobox', { name: 'Variant' });
    const labelledBy = select.getAttribute('aria-labelledby');
    expect(select.id).not.toBe('');
    expect(labelledBy).toContain(`${select.id}-label`);
    expect(document.getElementById(`${select.id}-label`)).toHaveTextContent(
      'Variant',
    );
    expect(
      select.closest('.MuiOutlinedInput-root')?.querySelector('legend'),
    ).toHaveTextContent('Variant');

    fireEvent.mouseDown(select);
    fireEvent.click(screen.getByRole('option', { name: 'h4' }));
    expect(
      store.getState().history.present.nodes['revenue-label'].props.variant,
    ).toBe('h4');
  });

  it('handles delete and undo shortcuts without hijacking text inputs', () => {
    const store = createEditorStore(
      executiveDemoDocument,
      createDefaultRegistry(),
    );
    store.getState().selectNode('revenue-card');
    render(<EditorShell store={store} />);

    fireEvent.keyDown(window, { key: 'Delete' });
    expect(
      store.getState().history.present.nodes['revenue-card'],
    ).toBeUndefined();
    fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
    expect(
      store.getState().history.present.nodes['revenue-card'],
    ).toBeDefined();

    act(() => store.getState().selectNode('revenue-label'));
    const textInput = screen.getByLabelText('Text');
    fireEvent.keyDown(textInput, { key: 'Backspace' });
    expect(
      store.getState().history.present.nodes['revenue-label'],
    ).toBeDefined();
  });
});
