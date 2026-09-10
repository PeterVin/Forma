import type { PageDocument } from '../editor/document/types';

export const emptyPageDocument = {
  version: 1,
  id: 'empty-page',
  name: 'Empty page',
  rootNodeId: 'root',
  nodes: {
    root: {
      id: 'root',
      type: 'mui.box',
      children: [],
      props: {},
      style: { sx: { minHeight: 480, p: 3 } },
    },
  },
} satisfies PageDocument;
