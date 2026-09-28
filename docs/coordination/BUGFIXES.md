# Bugfix Tickets

This file contains standalone bugfix tickets that can be assigned directly to an agent.

## BF-INS-001 - Fix Insertion Sort Visual Behavior (Shift-Then-Insert)

Priority:
- High

Status:
- Done (2026-02-11)

Owner:
- OpenCode (agent)

Area:
- `src/algorithms/*`
- `src/visualizer/*`
- `src/app/*` (if pipeline mapping needs adjustment)

User story:
- As a learner, I want Insertion Sort animation to show elements moving position (shift then insert) instead of bars only changing height, so the visual behavior matches how insertion sort conceptually works.

Problem statement:
- Current Insertion Sort animation appears to mutate bar heights in place during insertion operations.
- This makes the animation look like values are rewritten into bars, rather than items shifting right and the key item being inserted into its final position.

Expected behavior:
- During pair comparisons, visual order should remain unchanged until insertion index is determined.
- Once insertion point is identified:
  - all affected items between insertion point and key's original index shift one slot to the right visually
  - the key item moves into the insertion slot visually
- Resulting frame sequence should communicate positional movement, not only height replacement.

Non-goals:
- Do not change algorithm correctness semantics (final sorted output must remain identical).
- Do not refactor unrelated rendering architecture.
- Do not introduce algorithm-specific hacks in generic renderer if the same effect can be represented via step metadata.

Scope guidance:
- Prefer fixing this by improving emitted Insertion Sort steps and/or movement metadata interpretation.
- Keep the shared step contract backward-compatible for Bubble/Selection unless an additive field is required.
- If adding metadata, make it optional and document defaults.

Implementation notes (recommended):
- Ensure insertion-sort step emission distinguishes:
  - comparison phase (no structural reorder shown yet)
  - shift phase (items moving right)
  - insert phase (key placed)
- If renderer supports movement semantics, emit explicit movement indices or operation labels (e.g., `compare`, `shift`, `insert`).
- If renderer is snapshot-driven, snapshots must reflect intermediate shifted order, not just value overwrite artifacts.

Acceptance criteria:
- For a representative input (example: `[5, 3, 4, 1]`), animation shows:
  - compare steps
  - one or more right-shift steps when needed
  - key insertion step into final local position
- No visible "height morph" artifact that implies replacement without movement.
- Insertion Sort remains deterministic and correct.
- Existing Bubble/Selection visuals are unaffected.
- Full verification passes: `npm run lint`, `npm run test`, `npm run test:coverage`, `npm run typecheck`, `npm run build`.

Test requirements:
- Add/extend unit tests for insertion-sort step sequence to verify ordered operation labels or movement semantics.
- Add/extend visualizer/pipeline tests ensuring shift-then-insert progression is represented.
- Include at least one test asserting that compare-only steps do not perform premature insert visual state.

Manual QA checklist:
- Run app and choose Insertion Sort.
- Use small array sizes (e.g., 8-16) and slow speed.
- Confirm bars shift right before insertion placement.
- Confirm pause/resume/reset still behaves correctly during insertion animation.

Definition of done:
- Bug behavior is reproducibly fixed in UI.
- Tests added/updated and passing.
- Quality gates green.
- Add a dated completion entry in `docs/WORKLOG.md` referencing `BF-INS-001`.

## BF-RES-002 - Canvas Does Not Re-Render on Window Resize

Priority:
- Medium

Status:
- Done (2026-09-28)

Problem statement:
- `bootstrapApp` registered the `resize` listener after the `if (!autoplay) return` guard, so in the default (non-autoplay) app the canvas never resized.

Fix:
- Register a rAF-throttled resize handler before the autoplay guard; the handler detaches itself once the canvas is removed from the DOM.

## BF-CMP-003 - Compare Canvases Do Not Fill Their Panels

Priority:
- Low

Status:
- Done (2026-09-28)

Problem statement:
- Compare canvases were sized with `Math.min(380, clientWidth)`, leaving blank space in wider panels.

Fix:
- Size canvas to the panel width with a proportional, clamped height.

## BF-MEM-004 - Step Snapshots Exhaust Memory for Large Quadratic Runs

Priority:
- High

Status:
- Backlog

Problem statement:
- Every step stores a full copy of the array. Bubble/Insertion/Selection emit ~O(n^2) steps, so memory is ~O(n^3): measured ~160 MB at n=300; extrapolated to several GB at the 1000-element slider maximum, freezing or crashing the tab.

Suggested fix:
- Store per-step deltas (swap/write) and reconstruct snapshots incrementally in the playback controller, or generate steps lazily; as a stopgap, cap array size for quadratic algorithms.

Acceptance criteria:
- n=1000 Bubble Sort executes without multi-GB memory use; seeking/reset still work; step contract tests keep passing.

