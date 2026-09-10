import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

import { useEditorStore } from '../../store/useEditorStore';
import type { DragSource, DroppableNodeData } from '../dnd/types';
import { useEditorDnd } from '../dnd/useEditorDnd';

interface EditorNodeWrapperProps {
  readonly nodeId: string;
  readonly label: string;
  readonly canHaveChildren: boolean;
  readonly isRoot: boolean;
  readonly children: ReactNode;
}

interface ChromeRect {
  readonly top: number;
  readonly left: number;
}

export function EditorNodeWrapper({
  nodeId,
  label,
  canHaveChildren,
  isRoot,
  children,
}: EditorNodeWrapperProps) {
  const selected = useEditorStore((state) => state.selectedNodeId === nodeId);
  const selectNode = useEditorStore((state) => state.selectNode);
  const { dropTarget } = useEditorDnd();
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [chromeRect, setChromeRect] = useState<ChromeRect | null>(null);
  const source: DragSource = { kind: 'node', nodeId, label, surface: 'canvas' };
  const droppableData: DroppableNodeData = {
    nodeId,
    surface: 'canvas',
    canHaveChildren,
  };
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    setActivatorNodeRef,
    isDragging,
  } = useDraggable({
    id: `canvas-node:${nodeId}`,
    data: { source },
    disabled: isRoot,
  });
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `canvas-drop:${nodeId}`,
    data: { dropTarget: droppableData },
  });

  const updateChromeRect = useCallback(() => {
    const element = wrapperRef.current?.firstElementChild;
    if (!(element instanceof HTMLElement)) return;
    const rect = element.getBoundingClientRect();
    setChromeRect({ top: rect.top, left: rect.left });
  }, []);

  useLayoutEffect(() => {
    const element = wrapperRef.current?.firstElementChild;
    if (!(element instanceof HTMLElement)) return;
    setDraggableRef(element);
    setDroppableRef(element);
    if (selected) updateChromeRect();
  }, [selected, setDraggableRef, setDroppableRef, updateChromeRect]);

  useLayoutEffect(() => {
    if (!selected && !hovered) return;
    updateChromeRect();
    window.addEventListener('scroll', updateChromeRect, true);
    window.addEventListener('resize', updateChromeRect);
    return () => {
      window.removeEventListener('scroll', updateChromeRect, true);
      window.removeEventListener('resize', updateChromeRect);
    };
  }, [hovered, selected, updateChromeRect]);

  const select = (event: MouseEvent | KeyboardEvent): void => {
    event.stopPropagation();
    selectNode(nodeId);
  };
  const activeDropPosition =
    dropTarget?.surface === 'canvas' && dropTarget.nodeId === nodeId
      ? dropTarget.position
      : null;

  const chrome =
    chromeRect && (selected || hovered) && !isDragging
      ? createPortal(
          <Paper
            data-node-chrome={nodeId}
            elevation={3}
            sx={{
              position: 'fixed',
              zIndex: 1500,
              top: Math.max(4, chromeRect.top - 27),
              left: Math.max(4, chromeRect.left),
              height: 25,
              display: 'flex',
              alignItems: 'center',
              pl: 1,
              overflow: 'hidden',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              pointerEvents: 'auto',
            }}
          >
            <Typography
              variant="caption"
              sx={{ mr: isRoot ? 1 : 0.25, fontWeight: 700 }}
            >
              {label}
            </Typography>
            {!isRoot ? (
              <IconButton
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                aria-label={`Move ${label}`}
                size="small"
                onClick={(event) => event.stopPropagation()}
                sx={{
                  color: 'inherit',
                  borderRadius: 0,
                  height: 25,
                  width: 30,
                }}
              >
                <DragIndicatorRoundedIcon fontSize="small" />
              </IconButton>
            ) : null}
          </Paper>,
          document.body,
        )
      : null;

  return (
    <>
      <Box
        ref={wrapperRef}
        component="span"
        className="editor-node-wrapper"
        data-editor-node-id={nodeId}
        data-selected={selected ? 'true' : 'false'}
        data-drop-position={activeDropPosition ?? undefined}
        onClick={select}
        onMouseEnter={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onMouseLeave={(event) => {
          event.stopPropagation();
          setHovered(false);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') select(event);
        }}
        sx={{
          display: 'contents',
          '& > :first-of-type': {
            outline: selected ? '2px solid' : '1px solid transparent',
            outlineColor: selected ? 'primary.main' : 'transparent',
            outlineOffset: selected ? '2px' : '1px',
            transition: 'outline-color 100ms ease, box-shadow 100ms ease',
          },
          '&:hover > :first-of-type': {
            outlineColor: selected ? 'primary.main' : 'rgba(49, 90, 125, 0.42)',
          },
          '&[data-drop-position="inside"] > :first-of-type': {
            outline: '2px dashed',
            outlineColor: 'primary.main',
            outlineOffset: '-3px',
          },
          '&[data-drop-position="before"] > :first-of-type': {
            boxShadow: '0 -3px 0 #315A7D',
          },
          '&[data-drop-position="after"] > :first-of-type': {
            boxShadow: '0 3px 0 #315A7D',
          },
        }}
      >
        {children}
      </Box>
      {chrome}
    </>
  );
}
