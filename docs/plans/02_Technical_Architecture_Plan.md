# Technical Architecture Plan

## Recommended Stack Path
Start with Option 1 for speed, but architect for migration:
- Frontend: HTML Canvas + Vanilla JS (modularized)
- Backend (phase 1 optional): PHP + JSON/local storage
- Real-time layer (phase 2+): Node.js Socket.io microservice
- Persistence (phase 3+): MongoDB/Postgres migration path

## High-Level Components
1. Client Game Engine
2. Physics/Collision Module
3. Match State Manager
4. Bot AI Module
5. Backend API (accounts, progression)
6. Real-time Match Server
7. Matchmaking Service
8. Telemetry/Event Pipeline

## Suggested Repo Structure
- `/client`
  - `/engine`
  - `/systems` (input, render, physics, audio)
  - `/ui`
- `/server-api`
  - auth, profile, progression
- `/realtime`
  - room state sync, reconciliation
- `/shared`
  - constants, schemas, protocol
- `/docs/plans`

## Networking Model (Online)
- Authoritative server for puck/player state
- Client-side prediction for movement
- Server reconciliation snapshots at fixed tick (e.g., 20–30Hz)
- Event messages for hits/goals/power-ups

## Data Models (Initial)
- PlayerProfile
- MatchResult
- RankState (ELO)
- CosmeticInventory
- SeasonProgress

## Performance Budgets
- Client frame time target: <= 16.6ms @ 60FPS
- Realtime bandwidth target: < 25KB/s per player average
- Memory target (web): < 300MB total
