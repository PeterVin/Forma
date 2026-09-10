import { render, screen } from '@testing-library/react';
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
});
