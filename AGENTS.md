# Sorting Visualizer — Agent Instructions

## Purpose
Build and maintain a TypeScript frontend application that visualizes sorting algorithms using the HTML Canvas API.

## Source of Truth
- Product specification: `docs/PROJECT.md`
- Delivery roadmap and board: `docs/coordination/ROADMAP.md`, `docs/coordination/BOARD.md`
- Detailed feature/task definitions: `docs/coordination/FEATURES.md`
- Bugfix tracking: `docs/coordination/BUGFIXES.md`
- Release hardening checklist: `docs/coordination/HARDENING_CHECKLIST.md`
- Iteration log: `docs/WORKLOG.md`
- This file defines execution behavior for coding agents.
- `CLAUDE.md` must mirror this file's critical rules.

## Project Scope (v1)
- Visualize sorting step-by-step for:
  - Bubble Sort
  - Insertion Sort
  - Selection Sort
- Render using HTML Canvas.
- Generate random numeric arrays and animate sorting progress.

## Tech Stack
- Frontend: TypeScript
- Tooling: Vite
- Rendering: HTML Canvas API
- Testing: Vitest + Testing Library

## Mandatory Iterative Delivery Protocol
Work in strict increments: Feature -> Task -> Subtask (when needed).

Rules:
1. Before implementation, define feature goal and acceptance criteria.
2. Break each feature into tasks.
3. Break each non-trivial task into subtasks.
4. Keep only one active subtask at a time.
5. If planned changes exceed 6 files, split the iteration.
6. For each completed subtask/task/feature:
   - add or update unit tests
   - run lint
   - run tests
   - run typecheck
   - run build
   - record results in `docs/WORKLOG.md`
7. If any check fails, stop progression and fix before continuing.
8. Do not move to next subtask/task/feature while checks are red.

## Definition of Done
A subtask/task/feature is done only when:
- implementation is complete
- unit tests were added or updated
- checks pass: lint, tests, typecheck, build
- touched code meets at least 80% lines and branches coverage
- worklog entry is added with outcomes and next step

## Verification Commands (standard)
Use project scripts consistently:
- `npm run lint`
- `npm run test`
- `npm run test:coverage`
- `npm run typecheck`
- `npm run build`

If package manager differs, adjust commands but keep the same gates.

## Architecture Guidelines
- Separate modules:
  - `src/algorithms/*` (pure sorting + step emission)
  - `src/visualizer/*` (canvas rendering + animation loop)
  - `src/state/*` (UI state and controls)
  - `src/app/*` (composition / bootstrap)
- Sorting logic must be independent from rendering.
- Algorithms expose a common step contract.
- Prefer deterministic behavior for reproducible tests.

## Sorting Step Contract (recommended)
Each step should include:
- array snapshot
- compared indices
- modified indices (swap/write/insert)
- optional metadata (operation label, pass number)

## UI Requirements (v1)
- Controls:
  - algorithm selector
  - array size slider
  - speed slider
  - start/pause/resume/reset
  - randomize array
- Visualization:
  - bar rendering
  - compare and write/swap highlighting
  - completion state

## Mandatory UI Sanity Checklist (when UI touched)
- Controls disable/enable correctly during playback.
- Pause/resume/reset behavior is correct.
- Highlight colors/states are clear and consistent.
- Desktop and mobile layouts are usable.
- No obvious flicker or broken canvas redraw.
- Animation feels smooth; baseline target is ~60 FPS on typical modern hardware.

## Git Workflow
- Use one feature branch per feature.
- Keep tasks/subtasks small and reviewable.
- Avoid unrelated refactors in the same iteration.

## Roadmap After v1
Prioritized next algorithms:
1. Merge Sort
2. Quick Sort

## Skills Usage
- If local or global `skills/` is available, identify and apply relevant skills before coding.
- Conflict precedence:
  1) correctness and security
  2) architecture consistency
  3) visual polish
- In progress notes, mention which skills influenced decisions.

## Agent Output Format
For each iteration, return:
- Plan
- Changes
- Tests and verification results
- Risks/notes
- Next smallest iteration
