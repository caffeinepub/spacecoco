# Specification

## Summary
**Goal:** Restore reliable build/deploy and replace the prior gameplay with a playable “Motor Snake 3D” scaffold featuring a hollow spherical world, extreme/variable physics, anomaly power-ups, enemy collision events, a persistent ghost system, and async multiplayer lobbies for up to 10 players.

**Planned changes:**
- Fix the current deployment failure so local builds and canister deploy succeed and the app renders `/`, `/lobby`, and `/play` without runtime errors.
- Replace the Play experience with a 3D “Motor Snake 3D” scaffold (not the prior 2D snake loop), organized into clear systems/modules (world, physics/environment, collisions, power-ups, ghost).
- Implement a hollow spherical world foundation with inside-surface traversal, a mechanism to transition to the outside surface, a visible red core, and a placeholder “core break” event that transitions to an “abyss” state and then returns/respawns.
- Add environment/physics scaffolding: 5-second fluctuating gravity (0x–3x), radial wind burst events from invisible portals, fog/distortion, and acid rain that removes tail segments unless shielded.
- Add analog joystick controls (touch virtual joystick + desktop fallback) with motion response that differs between smooth vs abrupt input, plus a tail reaction scaffold (brake → coil/whip impulse).
- Add an enemy/collision event framework with three spawnable archetypes and their event outcomes: flying cow (freeze dome + shard projectiles), UFO (fold pulse teleport + spark trails), kamikaze penguin (fire ring + baby penguins attaching to tail, removable via shake).
- Add anomaly-based power-up spawning and three power-ups: mini black hole (suction + self-risk), shooting star (fire/phase + self-melt), mirror (2s intangible + reversed view/controls).
- Add a persistent ghost scaffold that appears after death in subsequent runs, delivers the line “You are not you anymore, it's me now”, tracks influence growth, and triggers a placeholder “replacement” mode with clear UI indication.
- Implement async/event-synced multiplayer scaffolding (up to 10) with backend lobby create/join/list/start plus ordered event submission/retrieval (polling-based), and update Lobby UI accordingly.
- Add VFX + audio cue pipeline scaffolding: callable effect hooks for key events and adaptive electro-orchestral music intensity states with graceful muted/locked-audio behavior.
- Update all user-facing copy across Home/Lobby/Play to English and to match Motor Snake 3D (hollow sphere, anomalies, extreme physics), and apply a consistent “apocalyptic anomaly” UI theme with readable overlays and a primary palette that is not blue/purple.

**User-visible outcome:** The app builds and deploys again; users can navigate Home → Lobby → Play, create/join lobbies up to 10 players with async event syncing, and play/inspect a new 3D Motor Snake scaffold in a hollow spherical world with placeholder versions of the requested physics, enemies, power-ups, ghost behavior, and VFX/audio hooks.
