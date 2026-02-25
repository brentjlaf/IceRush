import { ARENA, MATCH, PLAYER, POWER_UP, PUCK, TEAM } from '../../shared/constants.js';
import { steerBot } from '../systems/bots.js';
import { clamp, circlesOverlap, normalize, separate } from '../systems/physics.js';

const rand = (n = 1) => Math.random() * n;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function makePlayer({ id, team, x, y, human = false, role = 'chase' }) {
  return {
    id,
    team,
    human,
    role,
    x,
    y,
    vx: 0,
    vy: 0,
    radius: PLAYER.radius,
    boost: 100,
    effect: null,
    freezeUntil: 0,
    shieldUntil: 0,
  };
}

export class Game {
  constructor(input, hud) {
    this.input = input;
    this.hud = hud;
    this.arena = { ...ARENA };
    this.reset();
  }

  reset() {
    this.clock = MATCH.durationSec;
    this.countdown = MATCH.countdownSec;
    this.done = false;
    this.score = { blue: 0, pink: 0 };
    this.lastControl = 'blue';
    this.nextPowerAt = POWER_UP.spawnEverySec;
    this.power = null;
    this.flashText = 'Faceoff!';

    this.players = [
      makePlayer({ id: 'you', team: 'blue', x: 240, y: 340, human: true, role: 'chase' }),
      makePlayer({ id: 'b2', team: 'blue', x: 200, y: 230, role: 'support' }),
      makePlayer({ id: 'b3', team: 'blue', x: 200, y: 460, role: 'defend' }),
      makePlayer({ id: 'r1', team: 'pink', x: 860, y: 340, role: 'chase' }),
      makePlayer({ id: 'r2', team: 'pink', x: 900, y: 240, role: 'support' }),
      makePlayer({ id: 'r3', team: 'pink', x: 900, y: 440, role: 'defend' }),
    ];

    this.puck = { x: this.arena.width / 2, y: this.arena.height / 2, vx: 0, vy: 0, radius: PUCK.radius, owner: null };
  }

  spawnPowerUp() {
    this.power = {
      x: this.arena.width / 2 + rand(180) - 90,
      y: this.arena.height / 2 + rand(180) - 90,
      type: pick(['speed', 'freeze', 'slap', 'shield']),
    };
  }

  update(dt) {
    if (this.done) {
      if (this.input.consume('shoot')) this.reset();
      return;
    }

    if (this.countdown > 0) {
      this.countdown -= dt;
      return;
    }

    this.clock -= dt;
    if (this.clock <= 0) {
      this.done = true;
      this.clock = 0;
      this.flashText = this.score.blue === this.score.pink ? 'Draw game' : (this.score.blue > this.score.pink ? 'Blue wins' : 'Pink wins');
      return;
    }

    if (this.clock <= this.nextPowerAt && !this.power) {
      this.spawnPowerUp();
      this.nextPowerAt -= POWER_UP.spawnEverySec;
    }

    this.updatePlayers(dt);
    this.updatePuck(dt);
    this.checkGoals();
    this.updateHud();
  }

  updatePlayers(dt) {
    const now = performance.now() / 1000;
    const human = this.players[0];
    const axis = this.input.axis();

    for (const p of this.players) {
      if (!p.human) {
        const mates = this.players.filter((x) => x.team === p.team && x !== p);
        const opponents = this.players.filter((x) => x.team !== p.team);
        steerBot(p, { puck: this.puck, arena: this.arena, teammates: mates, opponents });
      } else {
        p.intentX = axis.x;
        p.intentY = axis.y;
      }

      const boostHeld = p.human ? this.input.active('boost') : Math.random() > 0.9;
      const speed = boostHeld && p.boost > 0 ? PLAYER.boostSpeed : PLAYER.maxSpeed;
      const reg = PLAYER.boostRegenPerSec + (this.lastControl === p.team ? PLAYER.boostTeamControlBonus : 0);
      p.boost = clamp(p.boost + (boostHeld ? -PLAYER.boostDrainPerSec : reg) * dt, 0, 100);

      const dir = normalize(p.intentX ?? 0, p.intentY ?? 0);
      p.vx += dir.x * PLAYER.accel * dt;
      p.vy += dir.y * PLAYER.accel * dt;
      const vl = Math.hypot(p.vx, p.vy) || 1;
      const drag = Math.pow(PLAYER.drag, dt * 60);
      p.vx = (p.vx / vl) * Math.min(speed, vl) * drag;
      p.vy = (p.vy / vl) * Math.min(speed, vl) * drag;

      p.x = clamp(p.x + p.vx * dt, p.radius, this.arena.width - p.radius);
      p.y = clamp(p.y + p.vy * dt, p.radius, this.arena.height - p.radius);

      if (this.power && circlesOverlap(p, { ...this.power, radius: 16 })) {
        p.effect = this.power.type;
        const duration = POWER_UP.durationSec[p.effect] ?? 3;
        if (p.effect === 'freeze') {
          for (const enemy of this.players.filter((e) => e.team !== p.team)) {
            enemy.freezeUntil = now + duration;
          }
        }
        if (p.effect === 'shield') p.shieldUntil = now + duration;
        p.effectUntil = now + duration;
        this.flashText = `${p.team.toUpperCase()} got ${p.effect.toUpperCase()}`;
        this.power = null;
      }
    }

    for (let i = 0; i < this.players.length; i += 1) {
      for (let j = i + 1; j < this.players.length; j += 1) {
        if (!circlesOverlap(this.players[i], this.players[j])) continue;
        separate(this.players[i], this.players[j]);

        const hitter = this.players[i].team !== this.players[j].team && Math.hypot(this.players[i].vx, this.players[i].vy) > Math.hypot(this.players[j].vx, this.players[j].vy)
          ? this.players[i]
          : this.players[j];
        const target = hitter === this.players[i] ? this.players[j] : this.players[i];
        const checkPressed = hitter.human ? this.input.consume('check') : Math.random() > 0.92;
        if (checkPressed && performance.now() / 1000 > target.shieldUntil) {
          const hitPower = Math.hypot(hitter.vx, hitter.vy) * 0.07;
          target.vx += hitter.vx * 0.15;
          target.vy += hitter.vy * 0.15;
          if (this.puck.owner === target && hitPower > 15) {
            this.puck.owner = null;
            this.puck.vx = hitter.vx * 0.6;
            this.puck.vy = hitter.vy * 0.6;
            hitter.boost = clamp(hitter.boost + PLAYER.boostCleanCheckBonus, 0, 100);
            this.flashText = `${hitter.team} heavy check!`;
          }
        }
      }
    }

    if (this.input.consume('shoot')) this.shoot(human, PUCK.shotPower);
    if (this.input.consume('pass')) this.pass(human);

    for (const p of this.players.filter((x) => !x.human && x.tryShoot)) {
      this.shoot(p, PUCK.shotPower * 0.75);
    }
  }

  shoot(player, basePower) {
    if (this.puck.owner !== player) return;
    if (performance.now() / 1000 < player.freezeUntil) return;
    const toward = player.team === 'blue' ? { x: 1, y: rand(0.4) - 0.2 } : { x: -1, y: rand(0.4) - 0.2 };
    const dir = normalize(toward.x, toward.y);
    const buff = player.effect === 'slap' && performance.now() / 1000 < player.effectUntil ? 2 : 1;
    this.puck.owner = null;
    this.puck.vx = dir.x * basePower * buff;
    this.puck.vy = dir.y * basePower * buff;
  }

  pass(player) {
    if (this.puck.owner !== player) return;
    const mates = this.players.filter((p) => p.team === player.team && p !== player);
    if (!mates.length) return;
    mates.sort((a, b) => Math.hypot(player.x - a.x, player.y - a.y) - Math.hypot(player.x - b.x, player.y - b.y));
    const target = mates[0];
    const dir = normalize(target.x - player.x, target.y - player.y);
    this.puck.owner = null;
    this.puck.vx = dir.x * PUCK.passPower;
    this.puck.vy = dir.y * PUCK.passPower;
  }

  updatePuck(dt) {
    if (!this.puck.owner) {
      this.puck.x += this.puck.vx * dt;
      this.puck.y += this.puck.vy * dt;
      this.puck.vx *= Math.pow(PUCK.friction, dt * 60);
      this.puck.vy *= Math.pow(PUCK.friction, dt * 60);

      if (this.puck.y < this.puck.radius || this.puck.y > this.arena.height - this.puck.radius) this.puck.vy *= -PUCK.boardBounce;
      if (this.puck.x < this.puck.radius || this.puck.x > this.arena.width - this.puck.radius) this.puck.vx *= -PUCK.boardBounce;
      this.puck.x = clamp(this.puck.x, this.puck.radius, this.arena.width - this.puck.radius);
      this.puck.y = clamp(this.puck.y, this.puck.radius, this.arena.height - this.puck.radius);

      for (const p of this.players) {
        if (!circlesOverlap(p, this.puck)) continue;
        this.puck.owner = p;
        this.lastControl = p.team;
        break;
      }
    } else {
      this.puck.x = this.puck.owner.x;
      this.puck.y = this.puck.owner.y;
    }
  }

  checkGoals() {
    const goalTop = this.arena.height / 2 - this.arena.goalWidth / 2;
    const goalBottom = goalTop + this.arena.goalWidth;

    if (this.puck.x <= this.arena.goalDepth && this.puck.y > goalTop && this.puck.y < goalBottom) {
      this.score.pink += 1;
      this.afterGoal('Pink scores!');
    }
    if (this.puck.x >= this.arena.width - this.arena.goalDepth && this.puck.y > goalTop && this.puck.y < goalBottom) {
      this.score.blue += 1;
      this.afterGoal('Blue scores!');
    }
  }

  afterGoal(text) {
    this.flashText = text;
    this.puck = { x: this.arena.width / 2, y: this.arena.height / 2, vx: 0, vy: 0, radius: PUCK.radius, owner: null };
    for (const p of this.players) {
      p.vx = 0;
      p.vy = 0;
    }
    this.players[0].x = 240;
    this.players[0].y = 340;
    this.players[3].x = 860;
    this.players[3].y = 340;
  }

  updateHud() {
    const boost = this.players[0].boost.toFixed(0);
    const seconds = Math.ceil(this.clock);
    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
    const remainder = String(seconds % 60).padStart(2, '0');
    this.hud.innerHTML = `
      <div class="pill team-score">
        <span class="team blue">Blue <strong>${this.score.blue}</strong></span>
        <span class="vs">VS</span>
        <span class="team pink"><strong>${this.score.pink}</strong> Pink</span>
      </div>
      <div class="pill clock">
        <span class="label">Period</span>
        <span class="clock-time">${minutes}:${remainder}</span>
      </div>
      <div class="pill boost">
        <span class="label">Boost</span>
        <span class="bar"><span style="width:${boost}%"></span></span>
      </div>
      <div class="pill flash">${this.flashText}</div>
    `;
  }

  draw(ctx) {
    const { width, height, goalDepth, goalWidth } = this.arena;
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#2c4e79';
    ctx.lineWidth = 5;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.strokeStyle = '#3867a0';
    ctx.stroke();

    const goalTop = height / 2 - goalWidth / 2;
    ctx.fillStyle = '#0f4f8d';
    ctx.fillRect(0, goalTop, goalDepth, goalWidth);
    ctx.fillStyle = '#7a1f57';
    ctx.fillRect(width - goalDepth, goalTop, goalDepth, goalWidth);

    if (this.power) {
      ctx.beginPath();
      ctx.arc(this.power.x, this.power.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd166';
      ctx.fill();
      ctx.fillStyle = '#081327';
      ctx.fillText(this.power.type[0].toUpperCase(), this.power.x - 4, this.power.y + 4);
    }

    for (const p of this.players) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.team === 'blue' ? TEAM.player : TEAM.bot;
      ctx.fill();
      if (p.human) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    ctx.beginPath();
    ctx.arc(this.puck.x, this.puck.y, this.puck.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    if (this.countdown > 0) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 84px system-ui';
      ctx.fillText(String(Math.ceil(this.countdown)), width / 2 - 20, height / 2);
    }

    if (this.done) {
      ctx.fillStyle = '#0008';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 48px system-ui';
      ctx.fillText(this.flashText, width / 2 - 130, height / 2 - 20);
      ctx.font = '24px system-ui';
      ctx.fillText('Press Space to restart', width / 2 - 120, height / 2 + 20);
    }
  }
}
