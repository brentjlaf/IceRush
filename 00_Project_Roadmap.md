# IceRush Project Roadmap

## Vision
Build a fast, physical, competitive 3v3 arcade hockey game with short match loops, ranked progression, and cosmetic monetization.

## Success Metrics
- Match duration: 2–3 minutes average
- Queue time: < 30 seconds at target concurrency
- Day-1 retention target: >= 35%
- Day-7 retention target: >= 12%
- Match completion rate: >= 90%
- Rage-quit rate: <= 8%

## Guiding Principles
1. Arcade feel over realism
2. No pay-to-win
3. Low downtime game loop
4. Server-authoritative multiplayer (when online phase starts)
5. Performance-first on low/mid devices

## Milestones

### Milestone A: Prototype (Weeks 1–3)
- 2D top-down arena
- Basic player movement, puck movement, goals
- Bot opponents
- Match timer + score UI
- Single-device gameplay loop

### Milestone B: Core Gameplay Vertical Slice (Weeks 4–6)
- Boost system
- Body check system
- Improved collision tuning
- FX feedback (screen shake, particles)
- Playtest-ready polish

### Milestone C: Backend & Online Foundations (Weeks 7–10)
- Account/auth (minimal)
- Match session service
- Matchmaking v1
- Real-time sync (WebSocket/Socket.io)
- Basic anti-cheat checks

### Milestone D: Ranked & Progression (Weeks 11–14)
- ELO ladder
- Rank tiers + promotion/demotion UX
- XP and profile leveling
- Cosmetic inventory framework

### Milestone E: Live Features (Weeks 15–18)
- Power-ups spawn system
- Season pass framework
- Shop/cosmetic economy (non-pay-to-win)
- Telemetry dashboard
- Soft launch readiness

## Phase Exit Criteria
Each milestone must pass:
- Playability criteria
- Performance budget
- Bug severity threshold (no P0/P1)
- Telemetry instrumentation complete
