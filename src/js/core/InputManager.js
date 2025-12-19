export class InputManager {
  constructor() {
    this.keys = {};
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDown = false;
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    window.addEventListener('mousemove', (e) => {
      const canvas = document.getElementById('game-canvas');
      const rect = canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });

    window.addEventListener('mousedown', () => {
      this.mouseDown = true;
    });

    window.addEventListener('mouseup', () => {
      this.mouseDown = false;
    });
  }

  isKeyPressed(key) {
    return this.keys[key.toLowerCase()] || false;
  }

  isUpPressed() {
    return this.isKeyPressed('w') || this.isKeyPressed('arrowup');
  }

  isDownPressed() {
    return this.isKeyPressed('s') || this.isKeyPressed('arrowdown');
  }

  isLeftPressed() {
    return this.isKeyPressed('a') || this.isKeyPressed('arrowleft');
  }

  isRightPressed() {
    return this.isKeyPressed('d') || this.isKeyPressed('arrowright');
  }

  isShootPressed() {
    return this.isKeyPressed(' ') || this.isKeyPressed('j');
  }

  isSkillPressed() {
    return this.isKeyPressed('k');
  }

  isPausePressed() {
    return this.isKeyPressed('escape') || this.isKeyPressed('p');
  }

  getMousePosition() {
    return { x: this.mouseX, y: this.mouseY };
  }

  isMouseDown() {
    return this.mouseDown;
  }
}
