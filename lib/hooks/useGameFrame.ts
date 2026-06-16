'use client';

import { useEffect, useRef } from 'react';

/** 一帧的基准时长（60fps，单位毫秒），用于归一化 deltaTime */
const FRAME_MS = 16.67;

/**
 * 基于 `requestAnimationFrame` 的游戏循环 hook
 *
 * 特性：
 * - 回调收到归一化后的 deltaTime（1.0 ≈ 60fps 一帧），便于跨帧率稳定的物理计算；
 * - 首帧自动跳过（避免上一次时间戳未初始化导致的巨大 dt）；
 * - callback 用 ref 持有，避免每次渲染重启循环；
 * - enabled 变化或卸载时自动取消 RAF。
 *
 * @param callback - 每帧回调，参数为归一化 deltaTime
 * @param enabled - 是否启动循环，默认 true
 */
export function useGameFrame(
  callback: (deltaTime: number) => void,
  enabled: boolean = true
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    let lastTime = 0;
    let rafId = 0;

    const loop = (time: number) => {
      if (lastTime === 0) {
        lastTime = time;
        rafId = requestAnimationFrame(loop);
        return;
      }
      const dt = (time - lastTime) / FRAME_MS;
      lastTime = time;
      callbackRef.current(dt);
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [enabled]);
}
