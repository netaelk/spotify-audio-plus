# Submission checklist

1. `powershell -File tools\make-icons.ps1` (only if icons changed), then `powershell -File tools\package.ps1`.
2. Test the **zip contents**, not the working folder: unzip it somewhere, Load unpacked from there, check both features on open.spotify.com.
3. https://chrome.google.com/webstore/devconsole -> register ($5 one-time, 2-step verification required).
4. New item -> upload `dist/spotify-audio-plus-<version>.zip`.
5. Store listing tab: paste from `store/listing.md`; upload the 128px icon (`icons/icon-128.png`), screenshots (below) and an optional 440x280 promo tile.
6. Privacy tab: paste single purpose + permission justification; no data collected; link a hosted privacy policy (see below).
7. Submit for review (usually a few days). Visibility: Public, or Unlisted to share by link only.

## Screenshots (you need to take these)
At least 1, ideally 3-4, at 1280x800 (or 640x400), PNG/JPEG, no rounded corners/padding:
- Player bar with skip buttons and the AB button visible.
- Loop being picked (A / B icon states).
- Active loop highlighted on the progress bar (the most convincing one).

## Privacy policy hosting
The dashboard wants a URL. Easiest: put `store/privacy-policy.md` in a public GitHub repo (or GitHub Pages / a gist) and use that link.

## Updating later
Bump `version` in manifest.json, repackage, upload as a new package in the dashboard. Each update is reviewed again.
