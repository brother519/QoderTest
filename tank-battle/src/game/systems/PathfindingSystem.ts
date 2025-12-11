import type { Tank, Direction, Position, GameMap } from '../types';
import { TileType } from '../types';
import { TILE_SIZE, TANK_SIZE } from '../constants';

interface PathNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

export class PathfindingSystem {
  static findPath(start: Position, goal: Position, map: GameMap): Direction | null {
    const startGrid = { x: Math.floor(start.x / TILE_SIZE), y: Math.floor(start.y / TILE_SIZE) };
    const goalGrid = { x: Math.floor(goal.x / TILE_SIZE), y: Math.floor(goal.y / TILE_SIZE) };

    if (startGrid.x === goalGrid.x && startGrid.y === goalGrid.y) {
      return null;
    }

    const openList: PathNode[] = [];
    const closedList: Set<string> = new Set();

    const startNode: PathNode = {
      x: startGrid.x,
      y: startGrid.y,
      g: 0,
      h: this.heuristic(startGrid, goalGrid),
      f: 0,
      parent: null,
    };
    startNode.f = startNode.g + startNode.h;
    openList.push(startNode);

    let iterations = 0;
    const maxIterations = 100;

    while (openList.length > 0 && iterations < maxIterations) {
      iterations++;

      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift()!;

      const key = `${current.x},${current.y}`;
      if (closedList.has(key)) continue;
      closedList.add(key);

      if (Math.abs(current.x - goalGrid.x) <= 1 && Math.abs(current.y - goalGrid.y) <= 1) {
        return this.getFirstDirection(startNode, current);
      }

      const neighbors = this.getNeighbors(current, map);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        if (closedList.has(neighborKey)) continue;

        const g = current.g + 1;
        const h = this.heuristic(neighbor, goalGrid);
        const f = g + h;

        const existing = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);
        if (!existing || g < existing.g) {
          const node: PathNode = {
            x: neighbor.x,
            y: neighbor.y,
            g,
            h,
            f,
            parent: current,
          };
          if (!existing) {
            openList.push(node);
          } else {
            existing.g = g;
            existing.f = f;
            existing.parent = current;
          }
        }
      }
    }

    return null;
  }

  private static heuristic(a: { x: number; y: number }, b: { x: number; y: number }): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  private static getNeighbors(node: PathNode, map: GameMap): Array<{ x: number; y: number }> {
    const neighbors: Array<{ x: number; y: number }> = [];
    const directions = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ];

    for (const dir of directions) {
      const newX = node.x + dir.x;
      const newY = node.y + dir.y;

      if (newX < 0 || newX >= map[0].length || newY < 0 || newY >= map.length) {
        continue;
      }

      const tile = map[newY][newX];
      if (tile !== TileType.BRICK && tile !== TileType.STEEL && tile !== TileType.WATER) {
        neighbors.push({ x: newX, y: newY });
      }
    }

    return neighbors;
  }

  private static getFirstDirection(start: PathNode, goal: PathNode): Direction | null {
    let current = goal;
    let previous = goal;

    while (current.parent) {
      previous = current;
      current = current.parent;
      if (current.x === start.x && current.y === start.y) {
        break;
      }
    }

    const dx = previous.x - start.x;
    const dy = previous.y - start.y;

    if (dy < 0) return 'up';
    if (dy > 0) return 'down';
    if (dx < 0) return 'left';
    if (dx > 0) return 'right';

    return null;
  }
}
