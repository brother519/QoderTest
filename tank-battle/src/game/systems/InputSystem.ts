import type { InputState } from '../types';

export class InputSystem {
  private static keyState: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false,
    pause: false,
    enter: false,
  };

  private static player2KeyState: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false,
    pause: false,
    enter: false,
  };

  private static keyDownHandler = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        InputSystem.keyState.up = true;
        e.preventDefault();
        break;
      case 'ArrowDown':
        InputSystem.keyState.down = true;
        e.preventDefault();
        break;
      case 'ArrowLeft':
        InputSystem.keyState.left = true;
        e.preventDefault();
        break;
      case 'ArrowRight':
        InputSystem.keyState.right = true;
        e.preventDefault();
        break;
      case ' ':
        InputSystem.keyState.shoot = true;
        e.preventDefault();
        break;
      case 'p':
      case 'P':
        InputSystem.keyState.pause = true;
        e.preventDefault();
        break;
      case 'Enter':
        InputSystem.keyState.enter = true;
        e.preventDefault();
        break;
      case 'w':
      case 'W':
        InputSystem.player2KeyState.up = true;
        e.preventDefault();
        break;
      case 's':
      case 'S':
        InputSystem.player2KeyState.down = true;
        e.preventDefault();
        break;
      case 'a':
      case 'A':
        InputSystem.player2KeyState.left = true;
        e.preventDefault();
        break;
      case 'd':
      case 'D':
        InputSystem.player2KeyState.right = true;
        e.preventDefault();
        break;
      case 'j':
      case 'J':
        InputSystem.player2KeyState.shoot = true;
        e.preventDefault();
        break;
    }
  };

  private static keyUpHandler = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        InputSystem.keyState.up = false;
        break;
      case 'ArrowDown':
        InputSystem.keyState.down = false;
        break;
      case 'ArrowLeft':
        InputSystem.keyState.left = false;
        break;
      case 'ArrowRight':
        InputSystem.keyState.right = false;
        break;
      case ' ':
        InputSystem.keyState.shoot = false;
        break;
      case 'p':
      case 'P':
        InputSystem.keyState.pause = false;
        break;
      case 'Enter':
        InputSystem.keyState.enter = false;
        break;
      case 'w':
      case 'W':
        InputSystem.player2KeyState.up = false;
        break;
      case 's':
      case 'S':
        InputSystem.player2KeyState.down = false;
        break;
      case 'a':
      case 'A':
        InputSystem.player2KeyState.left = false;
        break;
      case 'd':
      case 'D':
        InputSystem.player2KeyState.right = false;
        break;
      case 'j':
      case 'J':
        InputSystem.player2KeyState.shoot = false;
        break;
    }
  };

  static init(): void {
    window.addEventListener('keydown', InputSystem.keyDownHandler);
    window.addEventListener('keyup', InputSystem.keyUpHandler);
  }

  static cleanup(): void {
    window.removeEventListener('keydown', InputSystem.keyDownHandler);
    window.removeEventListener('keyup', InputSystem.keyUpHandler);
  }

  static getInput(): InputState {
    return { ...InputSystem.keyState };
  }

  static getPlayer2Input(): InputState {
    return { ...InputSystem.player2KeyState };
  }

  static resetInput(): void {
    InputSystem.keyState = {
      up: false,
      down: false,
      left: false,
      right: false,
      shoot: false,
      pause: false,
      enter: false,
    };
    InputSystem.player2KeyState = {
      up: false,
      down: false,
      left: false,
      right: false,
      shoot: false,
      pause: false,
      enter: false,
    };
  }
}
