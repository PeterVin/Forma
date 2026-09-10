import { createContext } from 'react';

import type { EditorStore } from './types';

export const EditorStoreContext = createContext<EditorStore | null>(null);
