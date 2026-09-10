import { CssBaseline, ThemeProvider } from '@mui/material';

import { createEditorStore } from './editor/store/createEditorStore';
import { EditorShell } from './editor/ui/EditorShell';
import { executiveDemoDocument } from './examples/executiveDemo';
import { createDefaultRegistry } from './registry/createDefaultRegistry';
import { executiveTheme } from './theme/executiveTheme';

const registry = createDefaultRegistry();
const editorStore = createEditorStore(executiveDemoDocument, registry);

function App() {
  return (
    <ThemeProvider theme={executiveTheme}>
      <CssBaseline />
      <EditorShell store={editorStore} />
    </ThemeProvider>
  );
}

export default App;
