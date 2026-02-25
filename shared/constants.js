export const ARENA = {
  width: 1100,
  height: 680,
  goalWidth: 180,
  goalDepth: 32,
};

export const TEAM = {
  player: '#35b9ff',
  bot: '#ff2f92',
};

export const MATCH = {
  durationSec: 150,
  countdownSec: 3,
};

export const PLAYER = {
  radius: 19,
  accel: 850,
  drag: 0.9,
  maxSpeed: 300,
  boostSpeed: 480,
  boostDrainPerSec: 35,
  boostRegenPerSec: 10,
  boostTeamControlBonus: 8,
  boostCleanCheckBonus: 15,
};

export const PUCK = {
  radius: 12,
  friction: 0.992,
  boardBounce: 0.92,
  shotPower: 630,
  passPower: 460,
};

export const POWER_UP = {
  spawnEverySec: 30,
  durationSec: {
    speed: 5,
    freeze: 3,
    shield: 4,
    slap: 6,
  },
};
