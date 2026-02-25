# IceRush Prototype (Phase 1 Start)

This is a playable single-device prototype built from the planning docs in this repo.

## Implemented now
- 2D top-down 3v3 arena (1 human + 5 bots)
- Movement + boost meter + body-check interactions
- Puck physics with friction and board bounce
- Shoot + pass controls
- Goal detection, scoreboard, 150s match timer, restart flow
- Mid-ice power-up spawns every 30 seconds (speed/freeze/slap/shield)

## Controls
- `WASD`: Move
- `Shift`: Boost
- `Space`: Shoot
- `E`: Pass
- `F`: Body check

## Run
```bash
python3 -m http.server 4173
```
Then open `http://localhost:4173/client/`.

### Troubleshooting: `file://` CORS error in browser
If you open `client/index.html` directly from disk (for example by double-clicking it), the browser will load the page from a `file://` URL. In that mode, `main.js` is treated as a cross-origin request and is blocked with errors like:

- `Access to script at 'file:///.../client/main.js' from origin 'null' has been blocked by CORS policy`
- `Failed to load resource: net::ERR_FAILED`

Use a local web server instead (as shown in **Run**) and open `http://localhost:4173/client/`.

## Checks
```bash
npm test
npm run check
```
