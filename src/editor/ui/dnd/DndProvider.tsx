import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useRef, useState, type ReactNode } from 'react';

import { createNodeFromDefinition } from '../../../registry/createNodeFromDefinition';
import { useEditorStore } from '../../store/useEditorStore';
import { calculateDropPosition, resolveDropIntent } from './dropPosition';
import { DragOverlayContent } from './DragOverlayContent';
import { EditorDndContext } from './editorDndContext';
import { editorCollisionDetection } from './editorCollisionDetection';
import type { DragSource, DroppableNodeData, DropTarget } from './types';
import { useEditorSensors } from './useEditorSensors';

interface DndProviderProps {
  readonly children: ReactNode;
}

function isDragSource(value: unknown): value is DragSource {
  if (typeof value !== 'object' || value === null || !('kind' in value))
    return false;
  const candidate = value as Partial<DragSource>;
  return (
    (candidate.kind === 'palette' &&
      typeof candidate.componentType === 'string') ||
    (candidate.kind === 'node' && typeof candidate.nodeId === 'string')
  );
}

function isDroppableNodeData(value: unknown): value is DroppableNodeData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'nodeId' in value &&
    typeof value.nodeId === 'string' &&
    'surface' in value &&
    (value.surface === 'canvas' || value.surface === 'layers') &&
    'canHaveChildren' in value &&
    typeof value.canHaveChildren === 'boolean'
  );
}

function getSource(
  event: DragStartEvent | DragOverEvent | DragEndEvent,
): DragSource | null {
  const source = event.active.data.current?.source;
  return isDragSource(source) ? source : null;
}

function getPointerClientY(event: DragOverEvent | DragEndEvent): number | null {
  const activatorEvent = event.activatorEvent;
  if (
    'clientY' in activatorEvent &&
    typeof activatorEvent.clientY === 'number'
  ) {
    return activatorEvent.clientY + event.delta.y;
  }
  if (
    typeof TouchEvent !== 'undefined' &&
    activatorEvent instanceof TouchEvent &&
    activatorEvent.touches[0]
  ) {
    return activatorEvent.touches[0].clientY + event.delta.y;
  }
  return null;
}

function getDropTarget(event: DragOverEvent | DragEndEvent): DropTarget | null {
  const data = event.over?.data.current?.dropTarget;
  if (!event.over || !isDroppableNodeData(data)) return null;
  const activeRect =
    event.active.rect.current.translated ?? event.active.rect.current.initial;
  const activeCenterY =
    getPointerClientY(event) ??
    (activeRect
      ? activeRect.top + activeRect.height / 2
      : event.over.rect.top + event.over.rect.height / 2);
  return {
    ...data,
    position: calculateDropPosition(
      activeCenterY,
      event.over.rect.top,
      event.over.rect.height,
      data.canHaveChildren,
    ),
  };
}

export function DndProvider({ children }: DndProviderProps) {
  const sensors = useEditorSensors();
  const document = useEditorStore((state) => state.history.present);
  const registry = useEditorStore((state) => state.registry);
  const executeCommand = useEditorStore((state) => state.executeCommand);
  const selectNode = useEditorStore((state) => state.selectNode);
  const reportError = useEditorStore((state) => state.reportError);
  const [activeSource, setActiveSource] = useState<DragSource | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const lastValidDropTarget = useRef<DropTarget | null>(null);

  const clearDrag = (): void => {
    setActiveSource(null);
    setDropTarget(null);
    lastValidDropTarget.current = null;
  };

  const handleDragStart = (event: DragStartEvent): void => {
    const source = getSource(event);
    setActiveSource(source);
    if (source?.kind === 'node') selectNode(source.nodeId);
  };

  const handleDragOver = (event: DragOverEvent): void => {
    const source = getSource(event);
    const target = getDropTarget(event);
    if (!source || !target) {
      lastValidDropTarget.current = null;
      setDropTarget(null);
      return;
    }
    const validTarget = resolveDropIntent(document, registry, source, target)
      .success
      ? target
      : null;
    lastValidDropTarget.current = validTarget;
    setDropTarget(validTarget);
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const source = getSource(event);
    const endTarget = getDropTarget(event);
    const previousTarget = lastValidDropTarget.current;
    const target =
      endTarget &&
      previousTarget?.nodeId === endTarget.nodeId &&
      previousTarget.surface === endTarget.surface
        ? previousTarget
        : endTarget;
    clearDrag();
    if (!source || !target) return;

    const resolved = resolveDropIntent(document, registry, source, target);
    if (!resolved.success) {
      reportError(resolved.message);
      return;
    }

    if (source.kind === 'palette') {
      const definition = registry.get(source.componentType);
      if (!definition) {
        reportError(`Unknown component type "${source.componentType}".`);
        return;
      }
      const node = createNodeFromDefinition(definition);
      executeCommand({
        type: 'node.add',
        parentId: resolved.intent.targetParentId,
        index: resolved.intent.index,
        node,
      });
      selectNode(node.id);
      return;
    }

    executeCommand({
      type: 'node.move',
      nodeId: source.nodeId,
      newParentId: resolved.intent.targetParentId,
      index: resolved.intent.index,
    });
    selectNode(source.nodeId);
  };

  const handleDragCancel = (): void => clearDrag();

  return (
    <EditorDndContext.Provider value={{ activeSource, dropTarget }}>
      <DndContext
        sensors={sensors}
        collisionDetection={editorCollisionDetection}
        autoScroll
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
        <DragOverlay dropAnimation={null}>
          {activeSource ? <DragOverlayContent source={activeSource} /> : null}
        </DragOverlay>
      </DndContext>
    </EditorDndContext.Provider>
  );
}
