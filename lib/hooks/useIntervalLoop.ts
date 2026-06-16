'use client';

import { useEffect, useRef } from 'react';

/**
 * 基于 `setInterval` 的循环 hook
 *
 * 实现参考 Dan Abramov 的 "useInterval" 模式：
 * - callback 用 ref 持有，避免每次渲染都重新创建定时器；
 * - interval 或 enabled 变化时会重启定时器；
 * - 卸载时自动清理。
 *
 * @param callback - 每次触发的回调
 * @param interval - 触发间隔（毫秒）。`null` / `undefined` 或负数表示暂停（等同 enabled=false）。
 * @param enabled - 是否启动循环，默认 true
 */
export function useIntervalLoop(
  callback: () => void,
  interval: number,
  enabled: boolean = true
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled || interval == null || interval < 0) return;

    const id = window.setInterval(() => {
      callbackRef.current();
    }, interval);

    return () => window.clearInterval(id);
  }, [interval, enabled]);
}
