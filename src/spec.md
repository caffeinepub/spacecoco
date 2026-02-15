# Specification

## Summary
**Goal:** Add a new full-screen animated neon cover image for the game start screen, and reuse it as the Home page hero artwork.

**Planned changes:**
- Generate a new cinematic neon cover image matching the provided scene description and add it as a static asset at `/assets/generated/game-cover-neon-snake-ufo.dim_3840x2160.png`.
- Replace the current /play pre-start cover/start background with the new image, displayed full-viewport with subtle neon glow + motion animation while keeping the start UI readable and clickable.
- Update the Home page hero artwork to use the new cover image instead of the current generated hero image, preserving responsive layout.

**User-visible outcome:** Before starting the game on `/play`, users see a full-screen animated neon cover overlay behind the start UI, and the Home page hero image is updated to the same new cover art.
