# Roadmap

This roadmap defines high-level milestones and feature-level delivery for the Sorting Visualizer project.

## Current Status Snapshot

- Completed features: F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11.
- Active feature: None.
- Recommended next track: Post-M7 follow-up planning (new feature track or prioritized bugfixes).
- Post-v1 algorithm expansion delivered: Merge Sort and Quick Sort are complete.

## Milestones

### M1 - Running Visual Demo
- Impact: the app is runnable and demonstrates a complete Bubble Sort visualization end-to-end.
- Includes: F1, F2.

### M2 - Multi-Algorithm Learning Core
- Impact: users can switch between three core algorithms and compare behavior.
- Includes: F3.

### M3 - Interactive Control Panel
- Impact: users control playback, speed, and array generation interactively.
- Includes: F5.

### M4 - UX and Performance Polish
- Impact: clearer visual semantics, better mobile usability, and smoother animation.
- Includes: F6.

### M5 - Release-Ready Baseline
- Impact: stable quality gates, reliable regression safety, and handoff-ready docs.
- Includes: F7.

### M6 - Advanced Algorithms Expansion
- Impact: users can visualize divide-and-conquer sorting strategies in addition to quadratic algorithms.
- Includes: F8.

### M7 - Comparative Learning Experience
- Impact: users can run multiple algorithms in parallel on the same input and compare behavior, complexity, and educational context in one page.
- Includes: F9, F10, F11.

## Features

## F1 - Foundation and Tooling
Goal: establish project scaffold and quality gates.

Requirements:
- Vite + TypeScript app scaffold.
- Scripted checks for lint, test, coverage, typecheck, and build.
- Initial architecture folders:
  - `src/algorithms/`
  - `src/visualizer/`
  - `src/state/`
  - `src/app/`
- Canvas shell renders successfully in browser.

Definition of Done:
- App boots and shows a canvas area.
- `npm run lint`, `npm run test`, `npm run test:coverage`, `npm run typecheck`, and `npm run build` all pass.
- Worklog entry added in `docs/WORKLOG.md`.

## F2 - Step Contract and Bubble Sort Engine
Goal: deliver first algorithm with deterministic, testable step output.

Requirements:
- Define a shared sorting step contract including:
  - array snapshot
  - compared indices
  - modified indices
  - optional metadata
- Implement Bubble Sort as a step emitter.
- Ensure deterministic output for identical input arrays.

Definition of Done:
- Bubble Sort correctness tests pass.
- Step contract tests pass.
- Visualization can consume emitted Bubble Sort steps.
- Verification gates pass and worklog is updated.

## F3 - Additional Algorithms (Insertion and Selection)
Goal: support comparison of multiple algorithms under one interface.

Requirements:
- Implement Insertion Sort and Selection Sort with the shared step contract.
- Integrate into a common algorithm runner interface.
- Add algorithm selector compatibility for all three algorithms.

Definition of Done:
- Correctness tests pass for Bubble, Insertion, and Selection.
- Step-sequence integrity tests pass for all three.
- Verification gates pass and worklog is updated.

## F4 - Animation Engine and Canvas Rendering
Goal: provide smooth, legible step-by-step visual playback.

Requirements:
- Build animation loop that consumes step sequence.
- Render bars for values on canvas.
- Highlight compare and write/swap states distinctly.
- Render completion state at the end of playback.

Definition of Done:
- Step playback runs end-to-end without redraw glitches.
- Compare/write highlights are clearly distinguishable.
- Verification gates pass and worklog is updated.

## F5 - Control Panel and UI State
Goal: enable meaningful interactive control over visualization.

Requirements:
- Implement controls:
  - algorithm selector
  - array size slider
  - speed slider
  - start/pause/resume/reset
  - randomize array
- Enforce correct enabled/disabled control states during playback.

Definition of Done:
- Pause/resume/reset behaviors are correct.
- Runtime speed changes apply correctly.
- UI control-state tests pass.
- Verification gates pass and worklog is updated.

## F6 - Responsiveness, Clarity, and Performance
Goal: improve usability and visual clarity across screen sizes.

Requirements:
- Ensure desktop and mobile layouts remain usable.
- Improve visual clarity of highlights and sorted state.
- Reduce redraw artifacts and avoid obvious flicker.
- Tune animation behavior toward ~60 FPS baseline on modern hardware.

Definition of Done:
- UI sanity checklist passes for desktop and mobile.
- No obvious flicker during normal playback.
- Baseline performance observations documented in worklog.
- Verification gates pass and worklog is updated.

## F7 - Quality Hardening and Handoff
Goal: finalize a stable v1 baseline with enforceable quality standards.

Requirements:
- Enforce >=80% lines and branches coverage for touched code.
- Add regression tests for critical flows.
- Verify docs are complete and consistent with implementation.
- Confirm roadmap for post-v1 algorithms (Merge then Quick).

Definition of Done:
- All quality gates pass on full suite.
- Coverage requirement is met for touched areas.
- Final v1 worklog entries are complete.
- Next smallest post-v1 iteration is defined.

## F8 - Merge Sort and Quick Sort Expansion
Goal: extend algorithm support with Merge Sort and Quick Sort while preserving the shared step contract and visual consistency.

Requirements:
- Implement Merge Sort as a deterministic step emitter compatible with current renderer semantics.
- Implement Quick Sort as a deterministic step emitter with explicit partition-related compare/modify operations.
- Register both algorithms in the common runner and selection pipeline.
- Ensure animation remains understandable for divide-and-conquer operations.

Definition of Done:
- Merge and Quick correctness tests pass across fixture matrix.
- Step-integrity and pipeline tests pass for both new algorithms.
- Existing algorithms remain unaffected.
- Verification gates pass and worklog is updated.

## F9 - Comparison Page Foundation and Algorithm Selection
Goal: add a dedicated comparison route with a multi-select dropdown so users can choose which algorithms to compare side by side.

Requirements:
- Add a separate comparison page route (recommended: `/compare`).
- Add checkbox-based algorithm selector supporting multiple selected algorithms.
- Create responsive panel grid layout generated from selected algorithms.
- Reuse core controls where appropriate (size, speed, randomize, start/reset entry points).

Definition of Done:
- Comparison page is navigable and stable.
- Selected algorithms dynamically create/remove comparison panels.
- Selection constraints and state persistence are handled.
- Verification gates pass and worklog is updated.

## F10 - Synchronized Multi-Algorithm Execution and Rendering
Goal: run selected algorithms concurrently from the same starting array and animate all panels at once.

Requirements:
- Use shared initial input (or deterministic seed) for fair comparison.
- Start action triggers all selected algorithms simultaneously.
- Maintain per-panel playback state while preserving synchronized start.
- Support shared controls fan-out (speed, pause/resume/reset, randomize).

Definition of Done:
- All selected algorithms start together and animate concurrently.
- Each panel can complete independently without breaking others.
- Existing single-algorithm page behavior remains stable.
- Verification gates pass and worklog is updated.

## F11 - Comparative Metadata UX and Hardening
Goal: improve educational clarity by showing per-algorithm metadata and hardening multi-panel behavior.

Requirements:
- Display algorithm name, time complexity, and short description on each panel.
- Add/maintain centralized metadata registry for all supported algorithms.
- Validate responsive usability for 2-5 parallel panels.
- Add regression/performance checks for multi-panel mode.

Definition of Done:
- Metadata appears correctly for all algorithms in comparison mode.
- Layout remains usable on desktop/mobile with multiple selections.
- Regression tests cover key compare-page flows.
- Verification gates pass and worklog is updated.

## Dependency Order
- F1 -> F2 -> F3 -> F4 -> F5 -> F6 -> F7 -> F8 -> F9 -> F10 -> F11
