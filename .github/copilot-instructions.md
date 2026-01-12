<!-- Copilot instructions for contributors and AI agents -->
# Project-specific guidance for AI coding agents

This single-file web game is a small Create React App project (see `package.json`). Use the notes below to get productive quickly.

- **Big picture**: a React app that mounts a single game component (`src/Game.js`) inside a theme wrapper (`src/GameTheme.js`). The app is built with Create React App (`npm start`, `npm run build`).

- **Where to edit game logic**: `src/Game.js` contains imperative game logic (physics loop, direct DOM manipulation, `requestAnimationFrame`, global `document` event listeners). Prefer making minimal, local changes and preserve the existing use of `refs` (`gameRef`, `playerRef`). Avoid converting the whole file to a different architecture unless requested.

- **UI & styling**: `src/styles.css` holds the visual rules and theme classes (`.theme-sun`, `.theme-clouds`, `.theme-rain`). Theme selection is driven by `src/GameTheme.js` which calls `src/services/ipmaService.js`.

- **External integration**: `src/services/ipmaService.js` fetches weather from the IPMA API and maps `idWeatherType` to `sun|clouds|rain`. Any changes that affect themes should keep this mapping and handle network failures (the service returns `sun` on error).

- **Assets & static files**: `src/Game.js` references `/jump.mp3` (new Audio("/jump.mp3")). Place media files in `public/` so they are available at the root path in production.

- **Runtime patterns to respect**:
  - The game updates DOM manually (creates/removes `.platform`, `.jetpack`, `.shield`, `.enemy` nodes). Keep those classes and sizes in sync with `styles.css` if you change layout values.
  - Score and best score use `localStorage` (`bestScore` key). Tests or refactors should preserve that key or migrate deliberately.
  - `src/Game.js` attaches `document` keydown/keyup listeners and a once-play listener for the jump sound. If you add/remove listeners, ensure cleanup on unmount.

- **Common change examples**:
  - To change jump audio, add `public/jump.mp3` and update the `new Audio("/jump.mp3")` path.
  - To add a new platform type, update `PLATFORM_TYPES` in `src/Game.js` and add a corresponding `.platform.<type>` style in `src/styles.css`.
  - To change theme logic, modify `getPortugalWeather()` in `src/services/ipmaService.js` and the theme CSS selectors in `src/styles.css`.

- **Build & dev commands** (CRA): `npm start` (dev), `npm run build` (prod), `npm test`.

- **Safety & testing notes for AI edits**:
  - Prefer small, reversible changes; avoid large rewrites of `src/Game.js` without tests or manual verification in the browser.
  - Run `npm start` locally to validate visual/interactive changes — the game relies on precise CSS sizes and DOM behavior.

If anything above is unclear or you want the agent to follow stricter rules (for example, migrate imperative DOM to React-only rendering), tell me which files to target and whether to add tests or a staging build step.
