import { Direction } from '../config/Constants';

export function getDirectionVector(direction: Direction): { x: number; y: number } {
  switch (direction) {
    case Direction.UP:
      return { x: 0, y: -1 };
    case Direction.DOWN:
      return { x: 0, y: 1 };
    case Direction.LEFT:
      return { x: -1, y: 0 };
    case Direction.RIGHT:
      return { x: 1, y: 0 };
  }
}

export function getOppositeDirection(direction: Direction): Direction {
  switch (direction) {
    case Direction.UP:
      return Direction.DOWN;
    case Direction.DOWN:
      return Direction.UP;
    case Direction.LEFT:
      return Direction.RIGHT;
    case Direction.RIGHT:
      return Direction.LEFT;
  }
}

export function getRotationAngle(direction: Direction): number {
  switch (direction) {
    case Direction.UP:
      return 0;
    case Direction.RIGHT:
      return Math.PI / 2;
    case Direction.DOWN:
      return Math.PI;
    case Direction.LEFT:
      return -Math.PI / 2;
  }
}
