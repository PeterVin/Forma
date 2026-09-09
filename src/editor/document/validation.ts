import type { z } from 'zod';

import { PageDocumentSchema } from './schema';
import type { PageDocument } from './types';

export type DocumentValidationResult =
  | { readonly success: true; readonly document: PageDocument }
  | { readonly success: false; readonly errors: readonly string[] };

function formatIssue(issue: z.ZodIssue): string {
  const location = issue.path.length > 0 ? issue.path.join('.') : 'document';
  return `${location}: ${issue.message}`;
}

export function validateDocument(input: unknown): DocumentValidationResult {
  const result = PageDocumentSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues.map(formatIssue),
    };
  }

  return { success: true, document: result.data };
}
