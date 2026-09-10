import { CssBaseline, ThemeProvider } from '@mui/material';
import { lazy, Suspense, useEffect, useState } from 'react';

import { executiveTheme } from '../theme/executiveTheme';
import { createEditorStore } from './store/createEditorStore';
import type { EditorStore } from './store/types';

const EditorShell = lazy(() =>
  import('./ui/EditorShell').then((module) => ({
    default: module.EditorShell,
  })),
);

const runtimePromise = Promise.all([
  import('../examples/executiveDemo'),
  import('../registry/createDefaultRegistry'),
]).then(([demo, registry]) =>
  createEditorStore(
    demo.executiveDemoDocument,
    registry.createDefaultRegistry(),
  ),
);

export default function EditorApplication() {
  const [store, setStore] = useState<EditorStore | null>(null);

  useEffect(() => {
    let active = true;
    void runtimePromise.then((loadedStore) => {
      if (active) setStore(loadedStore);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <ThemeProvider theme={executiveTheme}>
      <CssBaseline />
      {store ? (
        <Suspense fallback={<div className="app-loading">Loading editor…</div>}>
          <EditorShell store={store} />
        </Suspense>
      ) : (
        <div className="app-loading">Preparing workspace…</div>
      )}
    </ThemeProvider>
  );
}
