# DashRunner — Full Racing Mode (implementation prompt)

**Use this document as a single prompt for an AI coding agent or as a product/tech spec for humans.** Paste the block in the section *“Copy-paste prompt for an agent”* into Cursor (or similar) when you are ready to implement; keep this file in-repo as the source of truth.

---

## Product context

- **Project:** DashRunner — Next.js 14 App Router, React 18, TypeScript, Tailwind, Framer Motion, Canvas2D game loop (`GameCanvas.tsx`) + optional Three.js overlay (`Game3DScene.tsx`).
- **Current mode:** Endless runner — three lanes, swipe/keyboard, distance score, obstacles (cars/walls/barriers), coins, brake (swipe down), city/character from local profile.
- **Goal:** Add a **Racing** mode that feels like a **finite race** (laps, timing, placement), not an infinite score chase, while reusing as much of the existing renderer and controls as possible.

---

## Copy-paste prompt for an agent

```
You are implementing “Racing mode” for DashRunner (Next.js 14 + React + TypeScript).

STACK (do not replace):
- Game logic: Canvas2D in frontend/components/runner/GameCanvas.tsx (or extracted modules under components/runner/engine/).
- Presentation: Game3DScene.tsx (Three/R3F) synced from GameState.
- Controls: useSwipeGesture + keyboard; same mappings as endless (lane L/R, jump up, brake down) unless spec says otherwise.
- Routing: /play?mode=endless (default) vs /play?mode=racing.

DESIGN GOALS
1) Racing is NOT endless distance grind: player completes a defined course (at least one “lap” equivalent in scroll space) and receives lap time + best lap + finish placement (vs ghosts or simple AI).
2) Clear UX: countdown → green light → racing → chequered finish → results screen with rank, lap times, optional replay.
3) Fair collisions: reuse the car collision rules from endless (lane band, passedPlayer, etc.) or abstract them into shared helpers so racing and endless never diverge in bugs.
4) Performance: 60fps on mid mobile; no extra heavy physics engine unless justified.

PHASE 1 — MVP “time trial” (ship first)
- Fixed “track length” in scroll/distance units (e.g. totalDistanceToFinish = 8000). Replace infinite spawn rules with a authored spawn table or seeded RNG for obstacles/coins along [0, trackLength].
- HUD: lap counter (e.g. “Lap 1/3”), current lap time (mm:ss.ms), best lap, speed readout optional.
- Finish: when cumulative distance (or scroll integral) crosses trackLength * numLaps, trigger finish phase; stop spawning; show GameOverlay variant “Race results”.
- No multiplayer; optional “ghost” = record player’s lane + brake + jump inputs on a prior run and replay as secondary car mesh (defer if too large).

PHASE 2 — Rivals
- 2–3 AI cars in adjacent lanes following simplified rules: target speed, lane change when obstacle ahead, no rubber-banding in MVP.
- Position display: P1/P2/P3 based on progress along track centerline.

PHASE 3 — Polish
- Start grid animation, sector splits, minimap strip, engine SFX layers.
- Persist best times per city/track in localStorage or existing backend if present.

DATA MODEL
- Extend types/runner.ts (or new types/racing.ts): RaceConfig { trackId, laps, seed, spawnProfile }, RacePhase = countdown | racing | finished, finishTime, lapTimes[].
- GameState gains racing fields only when mode=racing; keep endless path unchanged.

IMPLEMENTATION CONSTRAINTS
- Minimal invasive diffs: introduce RacingGameCanvas.tsx OR mode flag on GameCanvas with strategy objects { endless, racing }.
- Single source of truth for obstacle motion (scroll speed) and player hitbox.
- Add tests where practical: pure functions for lap completion, spawn schedule determinism from seed.

DELIVERABLES
- /play?mode=racing runs a playable time-trial with finish and results.
- Marketing link “Race” visible; endless unchanged at /play.
- Short README section or comment block listing controls and known limitations.

Do not remove endless mode. Do not break MiniPay/Farcaster shell if present.
```

---

## Success criteria (checklist)

| Criterion | MVP | Phase 2 |
|-----------|-----|---------|
| Distinct URL or query for racing | Yes | Yes |
| Finish line / end state (not only death) | Yes | Yes |
| Lap timing | Yes | Yes |
| Results UI | Yes | Yes |
| AI / position | Optional | Yes |

---

## Open decisions (fill before large refactors)

1. **Track representation:** distance-along-run only (simplest) vs spline sampled into lane centers per distance step (better for minimap later).
2. **Laps:** multiply single authored segment by `laps` vs separate checkpoints.
3. **Sync with 3D:** `catPosition` / scroll must stay consistent with racing distance so 3D does not drift from 2D logic.

---

## Related files (starting points)

- `frontend/components/runner/GameCanvas.tsx` — core loop, obstacles, speed, collisions.
- `frontend/components/runner/RunnerGame.tsx` — orchestration, HUD, overlays, city selector.
- `frontend/types/runner.ts` — shared types; add racing types alongside or in new module.
- `frontend/app/play/page.tsx` — pass `mode` from `searchParams`.

---

*Last updated: 2026 — align this prompt with any major refactor of the runner engine.*
