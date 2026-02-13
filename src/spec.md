# Specification

## Summary
**Goal:** Fix the Spacecoco Play screen blank/no-render issue by reliably starting (and restarting) the requestAnimationFrame game loop after sprites finish loading, and prevent a fully blank screen if sprite loading fails.

**Planned changes:**
- Update Play screen game loop start/resume logic so `startGame()` and `resumeGame()` invoke a `gameLoop` that always sees the latest `spritesLoaded` value (avoid stale React hook closures) and does not incorrectly early-return.
- Ensure pausing and resuming reliably restarts the animation loop and rendering without freezing or showing a blank screen.
- Add a runtime failure fallback: if sprite loading fails, show an English error overlay with an actionable message, log the underlying error to the console, and still perform a minimal canvas render (e.g., clear + starfield) while allowing navigation back to the Lobby.
- Verify and correct sprite asset URL/path resolution so `loadAllSprites()` succeeds in production hosting with assets under `/assets/generated/`, and remove any missing-hook-dependency console warnings related to loop start/resume logic.

**User-visible outcome:** When entering /play from the Lobby, the canvas renders (starfield + snake) and the snake moves automatically shortly after assets load; pausing/resuming works reliably; if assets fail to load, an error overlay appears instead of a blank screen and the user can return to the Lobby.
