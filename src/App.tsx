import { lazy, Suspense } from 'react';

const EditorApplication = lazy(() => import('./editor/EditorApplication'));

function App() {
  return (
    <Suspense
      fallback={
        <div className="app-loading">Prepare Forma Theme Studio...</div>
      }
    >
      <EditorApplication />
    </Suspense>
  );
}

export default App;
