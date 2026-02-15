# Specification

## Summary
**Goal:** Upgrade enemy visuals by replacing primitive shapes with realistic textured 3D models (UFO, Cow, Crocodile, Penguin) while keeping the existing 3D game view/camera intact.

**Planned changes:**
- Replace primitive geometry for enemy entities with locally loaded textured 3D models (static frontend assets) without changing the existing Three.js scene/camera setup.
- Add per-enemy visual styling and lightweight idle animations (UFO blue blinking emissive lights; Cow subtle tail-swish; Crocodile scaly green with open mouth/white teeth; Penguin slow walk-in-place when nearly idle).
- Tune model scale, depth/lighting response, and subtle rotation/idle motion so enemies read clearly in perspective and remain consistent relative to the snake/world.
- Add or adjust basic lighting and shadow casting/receiving for enemies (with performance-conscious settings) to better ground models in the scene.

**User-visible outcome:** Enemies spawn as recognizable, realistic-looking 3D models with subtle animations, proper scale/perspective, and improved lighting/shadows—while the overall game view remains the same.
