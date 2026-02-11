# Sorting Visualizer — Project Definition

## Objective
Create an educational frontend web app that helps users understand sorting algorithms by animating sorting operations on an HTML canvas.

## Audience
- Students learning algorithms
- Developers revising fundamentals
- Instructors demonstrating sorting behavior

## Core Outcome
A user can generate a random list, choose an algorithm, run visualization, and clearly observe comparisons and movements until completion.

## v1 Features
- Random list generation
- Algorithm selection:
  - Bubble Sort
  - Insertion Sort
  - Selection Sort
- Canvas-based bar visualization
- Playback controls:
  - Start
  - Pause/Resume
  - Reset
- Configurable array size and speed
- Visual cues for compare, write/swap, and sorted/completed states

## Tech Requirements
- TypeScript frontend
- Vite
- HTML Canvas API
- Testing: Vitest + Testing Library
- No backend in v1

## Functional Requirements
- Generate random integer arrays in configurable ranges.
- Sort correctly in ascending order.
- Show intermediate steps in chronological order.
- Speed updates apply during playback.
- Reset returns a clean pre-run state.

## Non-Functional Requirements
- Smooth animation target: ~60 FPS baseline on modern browsers/hardware.
- UI remains clear and responsive.
- Codebase is modular and extendable.
- Algorithm step generation is deterministic and testable.

## Iterative Delivery Requirements (Mandatory)
- Development must proceed as Feature -> Task -> Subtask.
- Every feature must be broken into tasks.
- Non-trivial tasks must be broken into subtasks.
- Max iteration size: 6 changed files before forced split.
- Each subtask/task/feature requires:
  - implementation
  - unit tests created/updated
  - lint pass
  - tests pass
  - coverage check
  - typecheck pass
  - build pass
- Progression is blocked on failed checks.

## Coverage Policy
- Touched code must maintain at least 80% lines and branches coverage.

## UI Verification Checklist
Apply after any UI-affecting iteration:
- Correct control states during idle/running/paused.
- Correct pause/resume/reset flow.
- Clear highlight semantics for compare vs write/swap.
- Usable layout on desktop and mobile.
- No obvious rendering glitches/flicker.

## Out of Scope (v1)
- Backend persistence
- User accounts
- Advanced charting libraries
- Additional algorithms beyond v1 set

## Acceptance Criteria (v1)
- All 3 v1 algorithms are visualized correctly.
- Visual states clearly communicate operations.
- Final sorted state is obvious.
- Lint/tests/coverage/typecheck/build pass.
- Worklog reflects completed iterations and verification outcomes.

## Post-v1 Roadmap
1. Merge Sort
2. Quick Sort

## Divide-and-Conquer Step Semantics (F8)
- `compare`: compares two indices during merge or partition scans.
- `write`: writes a value into a target index while merging ranges.
- `swap`: swaps two indices during Quick Sort partitioning.
- `partition`: marks active partition work for a range with optional `pivotIndex`.
- `partition-complete`: marks a finished partition with optional `partitionIndex`.
- `merge-range`: marks active merge work for a range.
- `range-sorted`: marks a subrange confirmed sorted.

Metadata additions are optional and backward-compatible:
- `range`: `{ start, end }` inclusive bounds of the active subproblem.
- `pivotIndex`: current pivot position (when relevant).
- `partitionIndex`: final pivot placement after partition.
