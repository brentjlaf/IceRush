# Game Design Plan

## Core Loop
1. Player presses Play
2. Matchmaking (6 players / bots fallback)
3. 2–3 minute match
4. XP + rank updates
5. Queue again

## Match Rules
- Format: 3v3
- Duration: 150 seconds default
- Overtime: 30 seconds golden goal (optional for ranked)
- Tiebreak: shootout simulation (future option)
- Win condition: highest score at time end or OT goal

## Player Mechanics
- Move: WASD / joystick
- Boost: sprint with meter drain
- Shoot: charged/instant variant
- Pass: teammate target priority
- Body check: momentum + timing window

## Boost Design
- Max meter: 100
- Drain rate: tuned for ~3 sec continuous burst
- Base regen: low out of possession
- Bonus regen:
  - Team puck control
  - Successful clean checks

## Hit/Check Design
Formula:
`HitPower = Speed * WeightFactor * TimingMultiplier`

Outcomes by threshold:
- Light bump: trajectory change
- Medium hit: stumble + puck instability
- Heavy hit: puck drop + knockback + FX

## Power-Up System
- Spawn location: central/high contest lanes
- Spawn interval: ~30 sec
- Active at once: 1 (initial tuning)
- Types:
  - Speed Burst (5s)
  - Freeze Puck (3s enemy shoot lock)
  - Slapshot Boost (next shot x2 velocity)
  - Check Shield (temporary immunity)

## Game Feel Targets
- Input latency: <= 80ms visual response
- Contact impact clarity: strong audio/visual cue per hit tier
- Puck turnover pace: high, no long dead-zones
