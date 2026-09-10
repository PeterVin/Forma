import type { EditorNode, PageDocument } from '../editor/document/types';
import type { ComponentRegistry } from './ComponentRegistry';

export type ComponentValidationResult =
  | { readonly success: true }
  | { readonly success: false; readonly errors: readonly string[] };

export function validateNodeProps(
  node: EditorNode,
  registry: ComponentRegistry,
): ComponentValidationResult {
  const definition = registry.get(node.type);
  if (!definition?.propSchema) return { success: true };

  const result = definition.propSchema.safeParse(node.props);
  if (result.success) return { success: true };

  return {
    success: false,
    errors: result.error.issues.map((issue) => {
      const property = issue.path.length > 0 ? issue.path.join('.') : 'props';
      return `${node.id}.${property}: ${issue.message}`;
    }),
  };
}

export function validateDocumentComponents(
  document: PageDocument,
  registry: ComponentRegistry,
): ComponentValidationResult {
  const errors = Object.values(document.nodes).flatMap((node) => {
    const result = validateNodeProps(node, registry);
    return result.success ? [] : result.errors;
  });

  return errors.length === 0 ? { success: true } : { success: false, errors };
}
