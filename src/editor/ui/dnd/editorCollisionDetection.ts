import {
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
} from '@dnd-kit/core';

export const editorCollisionDetection: CollisionDetection = (args) => {
  const collisions = pointerWithin(args);
  const candidates =
    collisions.length > 0 ? collisions : rectIntersection(args);

  return [...candidates].sort((left, right) => {
    const leftRect = args.droppableRects.get(left.id);
    const rightRect = args.droppableRects.get(right.id);
    const leftArea = leftRect
      ? leftRect.width * leftRect.height
      : Number.MAX_VALUE;
    const rightArea = rightRect
      ? rightRect.width * rightRect.height
      : Number.MAX_VALUE;
    return leftArea - rightArea;
  });
};
