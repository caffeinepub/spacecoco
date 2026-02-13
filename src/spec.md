# Specification

## Summary
**Goal:** Add additive play-screen visual, spawn, obstacle timing, boss timing, and match-start audio improvements without changing the existing Spacecoco theme.

**Planned changes:**
- Render an additive black starfield background on the /play canvas with subtle animation (twinkle/drift) while keeping gameplay visuals readable.
- Update match initialization so the snake starts centered on the grid, green, and with an initial length of 5 segments (including Play Again).
- Add a timed obstacle behavior: every 2 seconds during active gameplay, spawn a UFO from above the playfield that descends downward, paired with/containing a cow, integrated with existing obstacle/power-up systems.
- Enforce penguin boss timing: on levels 5, 10, 15, etc., spawn the penguin boss at the center while preserving existing boss mechanics (including circling rules).
- Play a short looping chiptune background track at low volume at the start of each match, ensuring existing mute/unmute and any dynamic/intensifying music behavior continues to work.

**User-visible outcome:** On /play, players see a subtly animated starfield background, start each match with a centered green 5-segment snake, encounter regular descending UFO-with-cow drops every 2 seconds, get a center-spawn penguin boss every 5 levels, and hear a low-volume looping chiptune that respects existing audio controls/behavior.
