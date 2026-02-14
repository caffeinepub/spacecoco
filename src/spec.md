# Specification

## Summary
**Goal:** Improve Play screen reliability and presentation by initializing WebAudio early (gesture-safe on mobile), enforcing a focus-safe 60fps loop, rendering crisply on high-DPI/4K displays, and upgrading key entity visuals from generic blobs to readable Spacecoco-style silhouettes.

**Planned changes:**
- Initialize/prepare an AudioContext as soon as the Play screen mounts, while deferring actual audio start to an allowed user gesture on platforms that require it, without breaking the existing mute toggle behavior.
- Refactor game-loop control to a single requestAnimationFrame-driven loop targeting 60fps, and pause/resume cleanly on visibility/focus changes without duplicated loops or blank renders.
- Update canvas sizing to render at devicePixelRatio-scaled resolution (clamped for performance) and apply appropriate smoothing so toon/vector primitives stay smooth and any bitmap sprites/textures stay sharp (no unintended blur).
- Replace overly-generic entity rendering for the Penguin boss, UFO, and alien presence with clearer silhouettes and readable details while preserving the existing Spacecoco toon style and gameplay rules.
- Add and wire updated/new toon textures under `frontend/public/assets/generated` via the existing texture loader/pipeline, with safe fallbacks if textures fail to load.

**User-visible outcome:** The Play screen starts and resumes reliably (including after tab/app focus changes), audio works on mobile with gesture requirements while mute remains dependable, the canvas looks sharper on high-DPI/4K displays, and the penguin boss/UFO/aliens are visually recognizable rather than blob-like placeholders.
