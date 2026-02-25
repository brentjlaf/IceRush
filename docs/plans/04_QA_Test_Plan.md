# QA & Test Plan

## Test Layers
1. Unit tests
2. Integration tests
3. Simulation tests (physics determinism)
4. Multiplayer sync tests
5. Device/browser compatibility tests
6. Soak tests and latency tests

## Core Test Cases
- Movement correctness under varying FPS
- Collision edge cases near board corners
- Simultaneous hit + shoot conflict resolution
- Boost regen/drain state transitions
- Power-up spawn fairness
- Match end + score integrity
- Rank point calculation on win/loss/quit

## Non-Functional Testing
- Performance profiling at 60FPS target
- Input latency measurement
- Packet loss/jitter tolerance
- Memory leak detection over long sessions

## Release Gates
- 0 open critical gameplay bugs
- 0 desync blockers
- >= 95% pass rate on smoke suite
- Performance budget met on target devices
