# F1 Cars Showcase

A PC-first, local interactive gallery for the McLaren MP4/4 (1988), Ferrari F2002 (2002), Mercedes-AMG F1 W11 EQ Performance (2020), and Red Bull Racing RB19 (2023).

The intended experience is a high-energy editorial museum: orbit a ready-to-race car in a warm off-white gallery, switch years on a timeline, reveal only meaningful season facts, enter a clearly labelled aero visualisation, and inspect the W11's named components in a dedicated Explore mode. It does not include driving, mobile-first layouts, real-time CFD, accounts, ads, or a backend.

## Status

Planning, asset intake, the interactive gallery foundation (Milestones 1–2), the Editorial Information Layer (Milestone 3), and the Aero visualisation implementation (Milestone 4) are complete. The current reference-led foundation is a floating, model-first gallery: a milky cyclorama, full-width editorial composition, side-led hero framing, no physical plinth or technical guide lines, intentional loading continuity, local editorial typography, one-car rendering, orbit controls, reset action, timeline, and sustained-performance fallback. The outgoing car remains visible until its successor is ready, avoiding an empty exhibit during a cold model load. The master asset-quality gate is also complete: F2002 and RB19 retain their 4K source textures, and the full gallery was checked at 1920×1080 on the target Intel Iris Xe renderer. `CAR FILE` is compact and on demand, with keyboard-selectable cars, predictable `Escape` dismissal, and a persistent local reduced-motion preference. Its research record is deliberately private: the exhibit shows no citations, hyperlinks, or source drawer. Aero renders per-car raw-model-local guide curves as controlled wind-tunnel smoke: translucent core filaments, soft local moving haze, and embedded tracer cores. There are no free-scene particles, false pressure maps, reflections, or CFD claims. Final owner visual approval and target-size Aero profiling remain open before Milestone 5. The implementation order is in [TASKS.md](TASKS.md).

Explore Mode Phase 1 is W11-only because its source GLB is the only collection asset with usable named component meshes. It provides hover labels, coral highlighting, click-to-isolate, ghosting, a deliberate logical-component breakout, compact per-part technical cards, and a horizontal clipping slice. MP4/4, F2002, and RB19 show an explicit availability message until their source meshes are properly separated and named.

## Aero implementation status

Milestone 4 has been rebuilt around Blender-authored, model-local guide assets rather than a generic particle field. Each car has an editable guide source at `CarModels/AeroGuides/` and ten lightweight runtime paths at `public/aero-guides/`; each path owns a translucent smoke filament, local animated haze, and embedded tracer cores. The effect remains an explicitly labelled visualisation, not CFD. Local lint/build, JSON validation, Blender export round-trip, and live smoke/orbit checks pass. Final owner visual approval and target-GPU Aero profiling remain release gates.

## Chosen stack

Vite + React + TypeScript + Three.js through React Three Fiber and Drei. The initial release is a static local app that loads one approved high-fidelity GLB at a time and reads car facts from local typed content.

## Local asset rules

`CarModels/` holds user-supplied master downloads and source files. It is not the browser delivery directory. Approved source-preserving runtime derivatives live in `public/models/`; the F2002 and RB19 retain their approved 4K source texture data. Licences, exact derivative notices, and source obligations are recorded in [ATTRIBUTIONS.md](ATTRIBUTIONS.md).

## Important release note

This repository may be free and open source while still containing assets with different terms. In particular, the Mercedes W11 model is CC BY-NC-SA 4.0. Credits and licence terms must remain with the asset. Model licences also do not clear all real-world F1, team, sponsor, or logo rights; a public release requires a separate rights review.

## Documentation

- [PRODUCT.md](PRODUCT.md) — experience, scope, visual direction, and acceptance criteria.
- [TASKS.md](TASKS.md) — ordered implementation backlog and handoff state.
- [ARCHITECTURE.md](ARCHITECTURE.md) — app structure, render strategy, and data flow.
- [OPERATIONS.md](OPERATIONS.md) — local workflow, performance checks, and release safeguards.
- [ATTRIBUTIONS.md](ATTRIBUTIONS.md) — source-model credits and licence obligations.
