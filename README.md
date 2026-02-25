# Hockey GM Simulator

A low-graphics, high-strategy hockey management simulator built with **PHP + JSON**.

## Features

- Draft prospects into your roster
- Trade players between teams
- Manage salary cap restrictions
- Simulate games with text play-by-play
- Run an "online league" shared state in JSON
- Player traits impact outcomes and weekly development:
  - Clutch
  - Injury-prone
  - Locker room leader
  - Dirty player

## Quick Start

```bash
php -S localhost:8000
```

Then open: `http://localhost:8000/index.php`

## Data Model

League data lives in `data/db.json`.

- `league.teams[].roster[]` stores players
- `league.prospects[]` stores draft pool
- `league.games[]` stores game history

## Notes

This is intentionally simple and easy to expand.

Ideas for next steps:

- AI-controlled team GMs
- Contract years + free agency
- Multiplayer auth for real online leagues
- Better draft class generation
