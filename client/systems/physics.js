export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export function len(x, y) {
  return Math.hypot(x, y);
}

export function normalize(x, y) {
  const l = len(x, y) || 1;
  return { x: x / l, y: y / l };
}

export function circlesOverlap(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const minDist = a.radius + b.radius;
  return dx * dx + dy * dy < minDist * minDist;
}

export function separate(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1;
  const overlap = a.radius + b.radius - dist;
  if (overlap <= 0) return;
  const nx = dx / dist;
  const ny = dy / dist;
  a.x -= nx * overlap * 0.5;
  a.y -= ny * overlap * 0.5;
  b.x += nx * overlap * 0.5;
  b.y += ny * overlap * 0.5;
}
