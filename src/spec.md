# Specification

## Summary
**Goal:** Upgrade Spacecoco’s visual/audio presentation and competitive scoring to a brighter retro-cartoon neon style, with an animated start/menu experience and clearer, more exciting score feedback.

**Planned changes:**
- Update Home + Lobby screens with a clearly animated retro-cartoon neon hero/splash presentation (moving UFO/alien elements and bright cow eye-laser effects) while keeping the game name and existing navigation intact.
- Redesign the in-game HUD scoring UI to a modern arcade retro-neon style with larger, highly readable digits and neon accents (purple/red/blue/green).
- Implement competitive scoring updates: award points for eating objects and for opponent eliminations, with brief on-screen score gain feedback (e.g., floating neon number popups).
- Add elimination rule: head-vs-body collision eliminates the head owner (respawns/resets to starting size), spawns collectible point items, and lets the winner collect them for score + extra growth.
- Improve gameplay visual quality with brighter neon/glow/trailing effects (e.g., laser glow/trails) while preserving readability and responsiveness.
- Upgrade audio polish with higher-quality SFX and stronger gameplay feedback (e.g., panning/filters/ducking), keeping the existing mute toggle working.
- Add new generated neon retro-cartoon art/sprite assets under `frontend/public/assets/generated` and reference them via `/assets/generated/...` paths (no backend image serving).

**User-visible outcome:** The start/menu screens feel more animated and neon-bright, gameplay looks and sounds more “arcade premium,” the HUD is bolder and clearer, and competitive play now includes elimination resets with collectible drops plus clear scoring feedback for eats and eliminations.
