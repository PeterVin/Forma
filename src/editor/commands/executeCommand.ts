import type { ComponentRegistry } from '../../registry/Componentregistry';
import { validateDocumentComponents } from '../../registry/validation';
import type { PageDocument } from '../document/types';
import {
  addNode,
  duplicateNode,
  moveNode,
  removeNode,
  replaceNodeProps,
  updateNodeProps,
  updateNodeSx,
} from './nodeOperations';
import type { EditorCommand, OperationResult } from './types';

export function executeCommand(
  document: PageDocument,
  command: EditorCommand,
  registry: ComponentRegistry,
): OperationResult<PageDocument> {
  const result = (() => {
    switch (command.type) {
      case 'node.updateProps':
        return updateNodeProps(document, command.nodeId, command.patch);
      case 'node.updateSx':
        return updateNodeSx(document, command.nodeId, command.patch);
      case 'node.replaceProps':
        return replaceNodeProps(document, command.nodeId, command.props);
      case 'node.add':
        return addNode(
          document,
          command.parentId,
          command.node,
          registry,
          command.index,
        );
      case 'node.remove':
        return removeNode(document, command.nodeId);
      case 'node.duplicate':
        return duplicateNode(document, command.nodeId);
      case 'node.move':
        return moveNode(
          document,
          command.nodeId,
          command.newParentId,
          registry,
          command.index,
        );
    }
  })();

  if (!result.success) return result;

  const componentValidation = validateDocumentComponents(
    result.value,
    registry,
  );
  if (!componentValidation.success) {
    return {
      success: false,
      error: {
        code: 'invalid_props',
        message: componentValidation.errors.join('; '),
      },
    };
  }

  return result;
}
