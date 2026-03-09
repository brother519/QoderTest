export class InputManager {
  private keys: Set<string> = new Set();
  private justPressed: Set<string> = new Set();
  private prevKeys: Set<string> = new Set();

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  attach() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  detach() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown(e: KeyboardEvent) {
    e.preventDefault();
    this.keys.add(e.code);
  }

  private handleKeyUp(e: KeyboardEvent) {
    e.preventDefault();
    this.keys.delete(e.code);
  }

  update() {
    this.justPressed.clear();
    for (const key of this.keys) {
      if (!this.prevKeys.has(key)) {
        this.justPressed.add(key);
      }
    }
    this.prevKeys = new Set(this.keys);
  }

  isDown(key: string): boolean {
    return this.keys.has(key);
  }

  wasJustPressed(key: string): boolean {
    return this.justPressed.has(key);
  }

  reset() {
    this.keys.clear();
    this.justPressed.clear();
    this.prevKeys.clear();
  }
}
