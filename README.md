# Spotify Audio+

Chrome (MV3) extension for open.spotify.com. Features so far:

1. **Skip buttons**: -10 / -5 left of play/pause, +5 / +10 right of it.
2. **A-B loop**: button after the built-in repeat. Click -> `A`, pick the start (click the progress bar, or click the
   button at the current position) -> `B`, pick the end -> green and looping. Click again to cancel (grey). Esc aborts
   mid-selection. Changing track resets it.

## Install
`chrome://extensions` -> Developer mode -> Load unpacked -> select this folder. Reload open.spotify.com.

## Layout
- `src/core/selectors.js`: every Spotify selector. Fix breakage here first.
- `src/core/player.js`: position / duration / seek.
- `src/core/ui.js`: placement zones (`before-playpause`, `after-playpause`, `after-repeat`), button factory.
- `src/core/registry.js`: feature lifecycle + `trackchange` event.
- `src/features/*.js`: one file per feature.

## Adding a feature
1. Create `src/features/my-feature.js` and call `SX.registry.register({ id, init?, mount })`.
2. `mount()` runs after every DOM change and must be idempotent: create your element once, then `SX.ui.ensure(el, zone, order)`.
3. Add the file to `content_scripts.js` in `manifest.json` (before `main.js`). Add a zone in `ui.js` if you need a new spot.

## Packaging for the Chrome Web Store
See `store/SUBMISSION-CHECKLIST.md`. Build with `powershell -File tools\package.ps1` (output in `dist/`).
