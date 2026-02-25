import { normalize } from './physics.js';

export function steerBot(bot, state) {
  const { puck, arena, teammates, opponents } = state;
  const toPuck = { x: puck.x - bot.x, y: puck.y - bot.y };
  const distPuck = Math.hypot(toPuck.x, toPuck.y);

  let target = toPuck;
  if (bot.role === 'defend') {
    const homeX = bot.team === 'blue' ? arena.width * 0.2 : arena.width * 0.8;
    target = { x: homeX - bot.x, y: puck.y - bot.y };
  } else if (bot.role === 'support' && distPuck < 120) {
    const mate = teammates[0] ?? bot;
    target = { x: mate.x - bot.x, y: mate.y - bot.y };
  }

  const dir = normalize(target.x, target.y);
  bot.intentX = dir.x;
  bot.intentY = dir.y;

  const isClosest = opponents.concat(teammates, [bot]).every((p) => {
    const d = Math.hypot(puck.x - p.x, puck.y - p.y);
    return d >= distPuck || p === bot;
  });
  bot.tryShoot = isClosest && distPuck < 150;
}
