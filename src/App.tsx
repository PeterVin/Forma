import { CssBaseline, ThemeProvider } from '@mui/material';

import { executiveDemoDocument } from './examples/executiveDemo';
import { createDefaultRegistry } from './registry/createDeffaultRegistry';
import { DocumentRenderer } from './renderer/DocumentRenderer';
import { executiveTheme } from './theme/executiveTheme';

const registry = createDefaultRegistry();

function App() {
  return (
    <ThemeProvider theme={executiveTheme}>
      <CssBaseline />
      <DocumentRenderer document={executiveDemoDocument} registry={registry} />
    </ThemeProvider>
  );
}

export default App;
