import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp, normalize, circlesOverlap } from '../client/systems/physics.js';

test('clamp bounds values', () => {
  assert.equal(clamp(10, 0, 5), 5);
  assert.equal(clamp(-1, 0, 5), 0);
  assert.equal(clamp(3, 0, 5), 3);
});

test('normalize returns unit vector', () => {
  const v = normalize(3, 4);
  assert.ok(Math.abs(v.x - 0.6) < 1e-6);
  assert.ok(Math.abs(v.y - 0.8) < 1e-6);
});

test('circles overlap detection', () => {
  const a = { x: 0, y: 0, radius: 10 };
  const b = { x: 15, y: 0, radius: 10 };
  assert.equal(circlesOverlap(a, b), true);
});
