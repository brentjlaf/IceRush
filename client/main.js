import { Game } from './engine/game.js';
import { Input } from './systems/input.js';

const canvas = document.getElementById('game');
const hud = document.getElementById('hud');
const ctx = canvas.getContext('2d');
const input = new Input();
const game = new Game(input, hud);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  game.update(dt);
  game.draw(ctx);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
