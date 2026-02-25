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

## Run in browser (existing)
```bash
npm install
npm run dev
```
Then open `http://127.0.0.1:4173/client/`.

If you'd rather use Python, this still works too:
```bash
python3 -m http.server 4173
```

## Run as a desktop app (new)
```bash
npm install
npm run desktop
```
This starts an Electron window with the same game.

## Build a Windows `.exe` installer
```bash
npm install
npm run build:win
```
The installer will be generated in `dist/` (for example `IceRush Setup <version>.exe`).

> Note: building a Windows installer works best on Windows. On Linux/macOS, Electron Builder may need additional tooling (like Wine) to produce a Windows `.exe`.

### Troubleshooting: `file://` CORS error in browser
If you open `client/index.html` directly from disk (for example by double-clicking it), the browser will load the page from a `file://` URL. In that mode, `main.js` is treated as a cross-origin request and is blocked with errors like:

- `Access to script at 'file:///.../client/main.js' from origin 'null' has been blocked by CORS policy`
- `Failed to load resource: net::ERR_FAILED`

Use a local web server instead (as shown in **Run in browser**) and open `http://localhost:4173/client/`.

## Checks
```bash
npm test
npm run check
```
