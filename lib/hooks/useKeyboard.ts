'use client';

import { useEffect, useRef } from 'react';

/** 按键 → 动作映射表（key 为 `KeyboardEvent.key`） */
export type KeyMap = Record<string, string>;

/** 键盘事件回调 */
export interface KeyboardHandlers {
  onKeyDown: (action: string) => void;
  onKeyUp?: (action: string) => void;
}

/** 可选配置 */
export interface KeyboardOptions {
  /** 是否绑定监听器，默认 true。为 false 时不会注册任何 listener。 */
  enabled?: boolean;
  /** 是否对映射内的按键调用 preventDefault，默认 true。 */
  preventDefault?: boolean;
}

/**
 * 通用键盘输入 hook
 *
 * 把"按键 → 动作字符串"映射与事件绑定样板代码集中管理，
 * 适用于方向键/WASD 控制、暂停/重启等游戏常见交互。
 *
 * 内部使用 ref 保存 keyMap 与 handlers，因此不会在每次渲染时
 * 重新注册 listener；只有 `enabled` 与 `preventDefault` 变化时才会重绑。
 *
 * @example
 * ```ts
 * useKeyboard(
 *   { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' },
 *   { onKeyDown: dispatch },
 *   { enabled: status === 'playing' },
 * );
 * ```
 */
export function useKeyboard(
  keyMap: KeyMap,
  handlers: KeyboardHandlers,
  options: KeyboardOptions = {}
): void {
  const { enabled = true, preventDefault = true } = options;

  const keyMapRef = useRef(keyMap);
  keyMapRef.current = keyMap;

  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const preventDefaultRef = useRef(preventDefault);
  preventDefaultRef.current = preventDefault;

  useEffect(() => {
    if (!enabled) return;

    const handle = (type: 'down' | 'up') => (e: KeyboardEvent) => {
      const action = keyMapRef.current[e.key];
      if (!action) return;
      if (preventDefaultRef.current) e.preventDefault();
      if (type === 'down') handlersRef.current.onKeyDown(action);
      else handlersRef.current.onKeyUp?.(action);
    };

    const onDown = handle('down');
    const onUp = handle('up');

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [enabled]);
}
