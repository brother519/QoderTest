import { InputState } from '../types';

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

  private static keyDownHandler = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        InputSystem.keyState.up = true;
        e.preventDefault();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        InputSystem.keyState.down = true;
        e.preventDefault();
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        InputSystem.keyState.left = true;
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        InputSystem.keyState.right = true;
        e.preventDefault();
        break;
      case ' ':
      case 'j':
      case 'J':
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
    }
  };

  private static keyUpHandler = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        InputSystem.keyState.up = false;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        InputSystem.keyState.down = false;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        InputSystem.keyState.left = false;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        InputSystem.keyState.right = false;
        break;
      case ' ':
      case 'j':
      case 'J':
        InputSystem.keyState.shoot = false;
        break;
      case 'p':
      case 'P':
        InputSystem.keyState.pause = false;
        break;
      case 'Enter':
        InputSystem.keyState.enter = false;
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
  }
}
