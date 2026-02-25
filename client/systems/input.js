const KEY_MAP = {
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
  ShiftLeft: 'boost',
  Space: 'shoot',
  KeyE: 'pass',
  KeyF: 'check',
};

export class Input {
  constructor() {
    this.state = {};
    this.justPressed = {};
    addEventListener('keydown', (e) => this.onKey(e.code, true));
    addEventListener('keyup', (e) => this.onKey(e.code, false));
  }

  onKey(code, down) {
    const key = KEY_MAP[code];
    if (!key) return;
    if (down && !this.state[key]) this.justPressed[key] = true;
    this.state[key] = down;
  }

  axis() {
    return {
      x: (this.state.right ? 1 : 0) - (this.state.left ? 1 : 0),
      y: (this.state.down ? 1 : 0) - (this.state.up ? 1 : 0),
    };
  }

  consume(action) {
    const hit = this.justPressed[action];
    delete this.justPressed[action];
    return Boolean(hit);
  }

  active(action) {
    return Boolean(this.state[action]);
  }
}
