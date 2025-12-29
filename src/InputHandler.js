import { CONSTANTS } from './utils/Constants.js';

export class InputHandler {
    constructor() {
        this.keys = {};
        this.keysJustPressed = {};
        this.setupListeners();
    }

    setupListeners() {
        window.addEventListener('keydown', (e) => {
            if (Object.values(CONSTANTS.KEYS).flat().includes(e.code)) {
                e.preventDefault();
                if (!this.keys[e.code]) {
                    this.keysJustPressed[e.code] = true;
                }
                this.keys[e.code] = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (Object.values(CONSTANTS.KEYS).flat().includes(e.code)) {
                e.preventDefault();
                this.keys[e.code] = false;
            }
        });
    }

    isPressed(keyName) {
        const keyCodes = CONSTANTS.KEYS[keyName];
        if (!keyCodes) return false;
        return keyCodes.some(code => this.keys[code]);
    }

    isJustPressed(keyName) {
        const keyCodes = CONSTANTS.KEYS[keyName];
        if (!keyCodes) return false;
        return keyCodes.some(code => this.keysJustPressed[code]);
    }

    reset() {
        this.keysJustPressed = {};
    }

    getAxis(axisName) {
        if (axisName === 'horizontal') {
            let axis = 0;
            if (this.isPressed('LEFT')) axis -= 1;
            if (this.isPressed('RIGHT')) axis += 1;
            return axis;
        }
        if (axisName === 'vertical') {
            let axis = 0;
            if (this.isPressed('UP')) axis -= 1;
            if (this.isPressed('DOWN')) axis += 1;
            return axis;
        }
        return 0;
    }
}

export default InputHandler;
