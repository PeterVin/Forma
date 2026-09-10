import { Box } from '@mui/material';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';

interface PageFrameProps {
  readonly viewportWidth: number;
  readonly zoom: number;
  readonly workspaceRef: RefObject<HTMLDivElement | null>;
  readonly children: ReactNode;
}

interface PanOrigin {
  readonly pointerX: number;
  readonly pointerY: number;
  readonly scrollLeft: number;
  readonly scrollTop: number;
}

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.matches('input, textarea, select, button') ||
      target.isContentEditable)
  );
}

export function PageFrame({
  viewportWidth,
  zoom,
  workspaceRef,
  children,
}: PageFrameProps) {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const panOrigin = useRef<PanOrigin | null>(null);
  const [pageHeight, setPageHeight] = useState(760);
  const [spacePressed, setSpacePressed] = useState(false);
  const [panning, setPanning] = useState(false);

  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const measure = (): void => setPageHeight(Math.max(760, page.scrollHeight));
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(page);
    return () => observer.disconnect();
  }, [children, viewportWidth]);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent): void => {
      if (event.code !== 'Space' || isEditableTarget(event.target)) return;
      event.preventDefault();
      setSpacePressed(true);
    };
    const keyUp = (event: KeyboardEvent): void => {
      if (event.code !== 'Space') return;
      setSpacePressed(false);
      setPanning(false);
      panOrigin.current = null;
    };
    const reset = (): void => {
      setSpacePressed(false);
      setPanning(false);
      panOrigin.current = null;
    };
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('blur', reset);
    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('blur', reset);
    };
  }, []);

  const beginPan = (event: PointerEvent<HTMLDivElement>): void => {
    if (!spacePressed || event.button !== 0 || !workspaceRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    panOrigin.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      scrollLeft: workspaceRef.current.scrollLeft,
      scrollTop: workspaceRef.current.scrollTop,
    };
    setPanning(true);
  };

  const movePan = (event: PointerEvent<HTMLDivElement>): void => {
    const origin = panOrigin.current;
    const workspace = workspaceRef.current;
    if (!panning || !origin || !workspace) return;
    event.preventDefault();
    event.stopPropagation();
    workspace.scrollLeft =
      origin.scrollLeft - (event.clientX - origin.pointerX);
    workspace.scrollTop = origin.scrollTop - (event.clientY - origin.pointerY);
  };

  const endPan = (event: PointerEvent<HTMLDivElement>): void => {
    if (!panning) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    panOrigin.current = null;
    setPanning(false);
  };

  return (
    <Box
      data-page-stage
      onPointerDownCapture={beginPan}
      onPointerMoveCapture={movePan}
      onPointerUpCapture={endPan}
      onPointerCancelCapture={endPan}
      sx={{
        boxSizing: 'content-box',
        position: 'relative',
        width: viewportWidth * zoom,
        height: pageHeight * zoom,
        minHeight: 'calc(100% - 64px)',
        m: 4,
        mx: 'auto',
        cursor: panning ? 'grabbing' : spacePressed ? 'grab' : 'default',
        userSelect: panning ? 'none' : 'auto',
      }}
    >
      <Box
        ref={pageRef}
        data-page-frame
        data-viewport-width={viewportWidth}
        data-zoom={zoom}
        sx={{
          width: viewportWidth,
          minHeight: 760,
          overflow: 'hidden',
          bgcolor: 'background.default',
          boxShadow: '0 10px 36px rgba(23, 33, 43, 0.18)',
          border: '1px solid',
          borderColor: 'divider',
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
