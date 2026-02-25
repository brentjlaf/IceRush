# 🏒 IceRush 3v3

Fast. Physical. Competitive.

---

# 🎮 Core Game Loop

1. Player hits "Play"
2. Instant matchmaking (6 players)
3. 2–3 minute match
4. XP + Rank change
5. Queue again

Short. Addictive. No downtime.

---

# 🧊 Arena Design

## Small Rink Layout

* No blue lines
* One zone
* Short boards
* High rebound physics
* Quick puck turnover

Think: Rocket League pacing, but hockey.

---

# 🕹 Controls

## Keyboard (Desktop)

* WASD → Move
* Shift → Boost
* Space → Shoot
* E → Pass
* F → Body Check

## Mobile

* Left thumb → Virtual joystick
* Right thumb → Shoot / Pass buttons
* Tap teammate to pass

---

# ⚡ Boost System

Boost meter:

* Drains while sprinting
* Refills slowly
* Refills faster when:

  * Your team controls puck
  * You land a clean check

Encourages aggressive play.

---

# 💥 Big Hit System

Hit strength = Speed × Weight × Timing

If timed correctly:

* Opponent drops puck
* Screen shake
* Ice crack effect
* Crowd reaction

Arcade feel > realism.

---

# 🧨 Power-Ups (Spawn mid-ice)

Random spawn every 30 seconds:

## 🔥 Speed Burst

5 seconds max speed.

## 🧊 Freeze Puck

Opponent can’t shoot for 3 seconds.

## 💣 Slapshot Boost

Next shot = double velocity.

## 🛡 Check Shield

Can’t be knocked down.

Keep them rare enough that they feel important.

---

# 🏆 Ranked Ladder

## Ranking System

* Bronze
* Silver
* Gold
* Platinum
* Diamond
* Elite

ELO-based.
Win = + points.
Loss = - points.
Quit = heavy penalty.

---

# 🧠 Progression System

Players level up and unlock:

* Cosmetic sticks
* Jersey colors
* Skating trails
* Hit effects
* Goal explosions

NO pay-to-win.
Pure cosmetic monetization.

---

# 🧱 Tech Stack

## Option 1 (Best Fit)

* HTML Canvas
* Vanilla JS
* PHP backend
* JSON for player data
* Simple WebSocket server later

## Option 2 (Modern)

* Babylon.js
* Node.js
* Socket.io
* MongoDB or JSON storage

Start simple:
Fake multiplayer (AI bots) → then real multiplayer.

---

# 🧊 Physics Model

* Puck = circle with friction decay
* Players = circle hitbox
* Elastic collision
* Board bounce multiplier

Arcade > simulation.

---

# 🎥 Visual Style

* Dark mode arena
* Neon blue + pink highlights
* Subtle ice reflections
* Particle effects on hits
* Minimal UI

---

# 💰 Monetization Ideas

* Battle pass seasons
* Custom goal horn sounds
* Animated jerseys
* Ranked season rewards
* Sponsored arenas

---

# 🚀 Phase Plan

## Phase 1

* Single-player 3v3 vs bots
* Basic physics
* Score system

## Phase 2

* Online matchmaking
* Ranked ladder

## Phase 3

* Power-ups
* Progression
* Cosmetics

---

# Next Steps

* Decide 2D top-down or slight 3D tilt
* Decide arcade vs light realism
* Choose storage approach (local first or backend immediately)

Let’s build it.
