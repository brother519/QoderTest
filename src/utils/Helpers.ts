import Phaser from 'phaser';

/**
 * 工具函数集合
 */

// 限制数值在指定范围内
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// 计算两点之间的距离
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// 生成指定范围内的随机整数
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成指定范围内的随机浮点数
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// 角度转弧度
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// 弧度转角度
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

// 检查矩形碰撞
export function rectangleCollision(
  x1: number, y1: number, width1: number, height1: number,
  x2: number, y2: number, width2: number, height2: number
): boolean {
  return x1 < x2 + width2 &&
         x1 + width1 > x2 &&
         y1 < y2 + height2 &&
         y1 + height1 > y2;
}

// 获取两点之间的角度（弧度）
export function angleToTarget(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

// 格式化分数显示（添加千位分隔符）
export function formatScore(score: number): string {
  return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 将数值转换为固定长度的字符串（用于UI显示）
export function padNumber(num: number, size: number): string {
  let s = num + '';
  while (s.length < size) s = '0' + s;
  return s;
}

// 检查点是否在圆内
export function pointInCircle(
  pointX: number, pointY: number,
  circleX: number, circleY: number, radius: number
): boolean {
  return distance(pointX, pointY, circleX, circleY) <= radius;
}

// 从对象池获取对象
export function getFromPool<T>(
  pool: T[],
  createFunc: () => T,
  resetFunc: (obj: T) => void
): T {
  if (pool.length > 0) {
    const obj = pool.pop()!;
    resetFunc(obj);
    return obj;
  } else {
    return createFunc();
  }
}

// 将对象返回到池中
export function returnToPool<T>(pool: T[], obj: T, maxPoolSize: number = 100): void {
  if (pool.length < maxPoolSize) {
    pool.push(obj);
  }
}