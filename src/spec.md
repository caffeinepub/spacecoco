# Specification

## Summary
**Goal:** Enhance the existing intro/hero 3D scene with smooth non-overlapping flying cow motion, UFO-only push interactions, periodic cow reactions, and high-contrast UFO spotlights—while preserving the current theme and overall look.

**Planned changes:**
- Update cow movement so all cows drift smoothly and continuously across the visible intro scene area without overlapping each other.
- Implement UFO-to-cow interactions where UFOs perform occasional fast dart/pass-through motions and apply an impulse-like push to cows they intersect, without enabling cow-vs-cow collisions.
- Add a visible cow “reaction” behavior/animation on an approximately 3-second cadence that layers on top of the cows’ ongoing flight.
- Add high-contrast white lights to each UFO (front and underside) aimed toward nearby cows to create clear, high-quality 3D lighting contrast without changing the existing scene style.

**User-visible outcome:** In the intro/hero 3D scene, cows continuously fly smoothly without intersecting each other, UFOs occasionally rush by and realistically push cows into new directions, cows visibly react about every 3 seconds, and UFO spotlights visibly illuminate nearby cows with crisp white contrast.
