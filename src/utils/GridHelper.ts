import { TILE_SIZE } from '../config/Constants';

export function alignToGrid(value: number): number {
  return Math.round(value / TILE_SIZE) * TILE_SIZE;
}

export function pixelToGrid(pixel: number): number {
  return Math.floor(pixel / TILE_SIZE);
}

export function gridToPixel(grid: number): number {
  return grid * TILE_SIZE;
}

export function isAligned(value: number): boolean {
  return value % TILE_SIZE === 0;
}
