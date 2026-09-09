import { z } from 'zod';

import type { JsonValue } from './types';

export const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(z.string(), JsonValueSchema),
  ]),
);

export const EditorNodeSchema = z
  .object({
    id: z.string().min(1),
    type: z.string().min(1),
    parentId: z.string().min(1).optional(),
    children: z.array(z.string().min(1)),
    props: z.record(z.string(), JsonValueSchema),
    style: z.object({
      sx: z.record(z.string(), JsonValueSchema).optional(),
    }),
  })
  .strict();

export const PageDocumentSchema = z
  .object({
    version: z.number().int().positive(),
    id: z.string().min(1),
    name: z.string().min(1),
    rootNodeId: z.string().min(1),
    nodes: z.record(z.string(), EditorNodeSchema),
  })
  .strict()
  .superRefine((document, context) => {
    const root = document.nodes[document.rootNodeId];
    if (!root) {
      context.addIssue({
        code: 'custom',
        path: ['rootNodeId'],
        message: `Root node "${document.rootNodeId}" does not exist.`,
      });
    } else if (root.parentId !== undefined) {
      context.addIssue({
        code: 'custom',
        path: ['nodes', document.rootNodeId, 'parentId'],
        message: 'The root node cannot have a parent.',
      });
    }

    const referencedBy = new Map<string, string>();

    for (const [recordKey, node] of Object.entries(document.nodes)) {
      if (recordKey !== node.id) {
        context.addIssue({
          code: 'custom',
          path: ['nodes', recordKey, 'id'],
          message: `Node id "${node.id}" must match record key "${recordKey}".`,
        });
      }

      const uniqueChildren = new Set<string>();
      for (const [index, childId] of node.children.entries()) {
        const childPath = ['nodes', recordKey, 'children', index] as const;

        if (childId === node.id) {
          context.addIssue({
            code: 'custom',
            path: [...childPath],
            message: 'A node cannot be its own child.',
          });
          continue;
        }

        if (uniqueChildren.has(childId)) {
          context.addIssue({
            code: 'custom',
            path: [...childPath],
            message: `Child "${childId}" is listed more than once.`,
          });
        }
        uniqueChildren.add(childId);

        const child = document.nodes[childId];
        if (!child) {
          context.addIssue({
            code: 'custom',
            path: [...childPath],
            message: `Child node "${childId}" does not exist.`,
          });
          continue;
        }

        const previousParent = referencedBy.get(childId);
        if (previousParent && previousParent !== node.id) {
          context.addIssue({
            code: 'custom',
            path: [...childPath],
            message: `Child "${childId}" is already owned by "${previousParent}".`,
          });
        } else {
          referencedBy.set(childId, node.id);
        }

        if (child.parentId !== undefined && child.parentId !== node.id) {
          context.addIssue({
            code: 'custom',
            path: ['nodes', childId, 'parentId'],
            message: `Parent id must be "${node.id}".`,
          });
        }
      }
    }

    const visiting = new Set<string>();
    const visited = new Set<string>();

    const visit = (nodeId: string): void => {
      if (visiting.has(nodeId)) {
        context.addIssue({
          code: 'custom',
          path: ['nodes', nodeId, 'children'],
          message: `Cycle detected at node "${nodeId}".`,
        });
        return;
      }
      if (visited.has(nodeId)) return;

      visiting.add(nodeId);
      for (const childId of document.nodes[nodeId]?.children ?? []) {
        if (document.nodes[childId]) visit(childId);
      }
      visiting.delete(nodeId);
      visited.add(nodeId);
    };

    for (const nodeId of Object.keys(document.nodes)) visit(nodeId);
  });
