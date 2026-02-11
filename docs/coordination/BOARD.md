# Board

This file acts as a lightweight Jira-style board for agent coordination.

Detailed task definitions and acceptance criteria are tracked in `docs/coordination/FEATURES.md`.
Standalone bugfix tickets are tracked in `docs/coordination/BUGFIXES.md`.

Status flow:
- Backlog -> Ready -> In Progress -> Blocked -> Done

Execution rules:
- Move only one subtask to `In Progress` at a time.
- Do not move items to `Done` until lint, tests, coverage, typecheck, and build are all green.
- Every `Done` item must reference an entry in `docs/WORKLOG.md`.
- If an iteration would touch more than 6 files, split the work first.

## Feature Board

| ID | Title | Milestone | Status | Notes |
| --- | --- | --- | --- | --- |
| F1 | Foundation and Tooling | M1 | Done | Scaffold complete with quality gates and canvas shell |
| F2 | Step Contract and Bubble Sort Engine | M1 | Done | Shared step model, deterministic Bubble Sort, and app pipeline smoke coverage |
| F3 | Additional Algorithms (Insertion and Selection) | M2 | Done | Insertion/Selection emitters, runner integration, and multi-algorithm pipeline smoke coverage |
| F4 | Animation Engine and Canvas Rendering | M2/M3 | Done | Canvas rendering + playback engine integrated with app and tested |
| F5 | Control Panel and UI State | M3 | Done | Full control panel, deterministic state gating, and interaction test coverage completed |
| F6 | Responsiveness, Clarity, and Performance | M4 | Done | Responsive layout, visual clarity, and playback smoothness polish completed with gate evidence |
| F7 | Quality Hardening and Handoff | M5 | Done | Coverage gate, regression safety, docs alignment |
| F8 | Merge Sort and Quick Sort Expansion | M6 | Done | Add divide-and-conquer algorithms with deterministic step emission and pipeline integration |
| F9 | Comparison Page Foundation and Algorithm Selection | M7 | Done | Compare route now includes typed selection state, checkbox multi-select, dynamic responsive panel grid, shared controls, and regression tests |
| F10 | Synchronized Multi-Algorithm Execution and Rendering | M7 | Done | Shared-input compare sessions now execute concurrently with synchronized control fan-out and divergent completion handling |
| F11 | Comparative Metadata UX and Hardening | M7 | Done | Central metadata registry, compare-panel headers, responsive readability polish, and compare regression coverage |

## Current Iteration Queue

| ID | Parent | Task/Subtask | Status | Done Criteria |
| --- | --- | --- | --- | --- |
| F1-T1 | F1 | Initialize Vite + TypeScript project scaffold | Done | `npm run dev` starts and app renders base page |
| F1-T2 | F1 | Configure TypeScript strict mode and path conventions | Done | `tsconfig` is strict and typecheck passes |
| F1-T3 | F1 | Add linting setup and lint script | Done | `npm run lint` executes successfully |
| F1-T4 | F1 | Add test runner setup (Vitest + Testing Library) | Done | `npm run test` runs at least one passing test |
| F1-T5 | F1 | Add coverage config and coverage script | Done | `npm run test:coverage` runs and reports coverage |
| F1-T6 | F1 | Create baseline architecture folders and module entry files | Done | `src/algorithms`, `src/visualizer`, `src/state`, and `src/app` exist with compile-safe stubs |
| F1-T7 | F1 | Implement initial app bootstrap and canvas shell | Done | App shows canvas container and initializes without runtime errors |
| F1-T8 | F1 | Add baseline unit tests for app bootstrap and render smoke | Done | Tests validate app mount and canvas shell presence |
| F1-T9 | F1 | Add standard scripts and verify full quality gate run | Done | lint, test, coverage, typecheck, and build all pass |
| F1-T10 | F1 | Record F1 completion evidence in worklog | Done | `docs/WORKLOG.md` entry includes scope, checks, and next step |
| F2-T1 | F2 | Define shared sorting step contract | Done | Shared contract types compile and export cleanly |
| F2-T2 | F2 | Add deterministic algorithm fixtures and helpers | Done | Fixture coverage includes common and edge-case arrays |
| F2-T3 | F2 | Implement Bubble Sort as typed step emitter | Done | Bubble Sort emits ordered steps ending in sorted snapshot |
| F2-T4 | F2 | Add Bubble Sort correctness and step-integrity tests | Done | Tests validate output correctness and step invariants |
| F2-T5 | F2 | Add common algorithm runner interface | Done | Bubble Sort is runnable through shared abstraction |
| F2-T6 | F2 | Integrate Bubble Sort step generation into app flow | Done | App path can generate and consume Bubble Sort steps |
| F2-T7 | F2 | Add integration/smoke tests for algorithm pipeline | Done | Pipeline tests pass for non-trivial and edge inputs |
| F2-T8 | F2 | Run full gate and close F2 in worklog | Done | lint/test/coverage/typecheck/build pass and docs are updated |
| F3-T1 | F3 | Define F3 test matrix and contract compliance checklist | Done | Shared compliance matrix helper reused across Insertion/Selection tests |
| F3-T2 | F3 | Implement Insertion Sort as typed step emitter | Done | Insertion emits ordered typed steps ending sorted |
| F3-T3 | F3 | Add Insertion Sort correctness and step-integrity tests | Done | Insertion tests validate correctness and invariants |
| F3-T4 | F3 | Implement Selection Sort as typed step emitter | Done | Selection emits ordered typed steps ending sorted |
| F3-T5 | F3 | Add Selection Sort correctness and step-integrity tests | Done | Selection tests validate correctness and invariants |
| F3-T6 | F3 | Register Insertion and Selection in shared runner | Done | Runner supports Bubble/Insertion/Selection IDs |
| F3-T7 | F3 | Integrate multi-algorithm pipeline in app composition | Done | App pipeline can execute all 3 algorithms |
| F3-T8 | F3 | Add smoke tests, run full gates, and close F3 | Done | Gates pass and worklog/board are updated |
| F4-T1 | F4 | Define rendering model and visual semantics | Done | Typed visual state model and highlight semantics are documented |
| F4-T2 | F4 | Implement canvas setup and resize-safe surface | Done | Canvas initializes crisply and resizes safely |
| F4-T3 | F4 | Implement base bar renderer from snapshot data | Done | Snapshot arrays render consistently as bars |
| F4-T4 | F4 | Apply compare/modify step highlights | Done | Compared and modified bars render with deterministic precedence |
| F4-T5 | F4 | Implement playback engine (play/tick/complete) | Done | Deterministic step progression reaches completion state |
| F4-T6 | F4 | Integrate playback and renderer into app composition | Done | Algorithm step output animates on canvas |
| F4-T7 | F4 | Add visualizer and playback tests | Done | Mapping/progression/pipeline tests pass |
| F4-T8 | F4 | Run UI sanity checks, perf baseline, and close F4 | Done | Gates pass and board/worklog closure is complete |
| F5-T1 | F5 | Define UI state machine for control behavior | Done | Typed states and transitions are defined and validated |
| F5-T2 | F5 | Build control panel layout and base components | Done | All required controls render with usable layout |
| F5-T3 | F5 | Wire algorithm selector to pipeline | Done | Selected algorithm drives generated steps |
| F5-T4 | F5 | Implement array size and randomize behavior | Done | Size/randomize controls update input data safely |
| F5-T5 | F5 | Implement speed control mapping to playback engine | Done | Speed changes affect playback cadence deterministically |
| F5-T6 | F5 | Implement playback actions (start/pause/resume/reset) | Done | Playback actions work with consistent state transitions |
| F5-T7 | F5 | Enforce control enable/disable rules by state | Done | Unsafe/conflicting actions are blocked by UI state |
| F5-T8 | F5 | Add control-state and interaction tests | Done | Interaction/state tests pass with required coverage |
| F5-T9 | F5 | Run full gates, UI checklist, and close F5 | Done | Gates pass and board/worklog closure is complete |
| F6-T1 | F6 | Define responsive layout and visual clarity checklist | Done | Breakpoints and clarity checklist are documented and testable |
| F6-T2 | F6 | Implement responsive control panel and canvas layout | Done | Controls/canvas remain usable across mobile and desktop |
| F6-T3 | F6 | Improve visual semantics and legend/hint clarity | Done | Highlight meaning is clear and consistent |
| F6-T4 | F6 | Reduce redraw artifacts and flicker | Done | Playback renders without obvious flicker/jank |
| F6-T5 | F6 | Tune playback timing for smoothness baseline | Done | Playback speed is stable and near smooth baseline |
| F6-T6 | F6 | Add responsive and visual regression tests | Done | Tests cover layout and visual-state mapping |
| F6-T7 | F6 | Run UI sanity and performance validation pass | Done | Mandatory UI checks and perf notes are recorded |
| F6-T8 | F6 | Run full gates and close F6 | Done | Gates pass and board/worklog closure is complete |
| F7-T1 | F7 | Define release readiness and hardening checklist | Done | Hardening checklist and pass criteria are documented |
| F7-T2 | F7 | Enforce coverage thresholds for touched code | Done | Coverage policy is enforced/validated at >=80% touched code |
| F7-T3 | F7 | Add regression tests for critical user flows | Done | Critical-flow regression tests are added and passing |
| F7-T4 | F7 | Verify cross-feature integration consistency | Done | Algorithms, controls, and renderer remain behaviorally consistent |
| F7-T5 | F7 | Align documentation and coordinator artifacts | Done | Docs and implementation status are synchronized |
| F7-T6 | F7 | Create handoff notes and known issues register | Done | Handoff and known issues are documented with next actions |
| F7-T7 | F7 | Run full quality gates and close F7 | Done | Gates pass and board/worklog closure is complete |
| F8-T1 | F8 | Define divide-and-conquer step semantics | Done | Merge/partition semantics are documented and backward-compatible |
| F8-T2 | F8 | Add deterministic fixtures for merge/quick edge cases | Done | Fixtures cover representative edge and non-trivial scenarios |
| F8-T3 | F8 | Implement Merge Sort as typed step emitter | Done | Merge emits deterministic typed steps ending sorted |
| F8-T4 | F8 | Add Merge Sort correctness and step-integrity tests | Done | Merge tests validate correctness and step structure |
| F8-T5 | F8 | Implement Quick Sort as typed step emitter | Done | Quick emits deterministic typed steps ending sorted |
| F8-T6 | F8 | Add Quick Sort correctness and step-integrity tests | Done | Quick tests validate correctness and partition semantics |
| F8-T7 | F8 | Register Merge/Quick in runner and pipeline | Done | Runner/pipeline support all five algorithms |
| F8-T8 | F8 | Add multi-algorithm regression/smoke coverage | Done | Smoke coverage includes Bubble/Insertion/Selection/Merge/Quick |
| F8-T9 | F8 | Run full gates and close F8 | Done | Gates pass and board/worklog closure is complete |
| F9-T1 | F9 | Add comparison route and navigation entry | Done | Compare page route is reachable without breaking main page |
| F9-T2 | F9 | Define comparison page state model | Done | Selected algorithms and panel state are typed and deterministic |
| F9-T3 | F9 | Implement multi-select dropdown with checkboxes | Done | Algorithm selection toggles correctly via checkbox dropdown |
| F9-T4 | F9 | Build dynamic comparison panel grid | Done | One panel renders per selected algorithm with responsive layout |
| F9-T5 | F9 | Add shared compare controls skeleton | Done | Compare controls exist and update comparison state |
| F9-T6 | F9 | Add selection and layout tests | Done | Selection behavior and panel rendering are test-covered |
| F9-T7 | F9 | Run full gates and close F9 | Done | Gates pass and board/worklog closure is complete |
| F10-T1 | F10 | Define multi-run session contract | Done | Shared-input synchronized run contract is typed and documented |
| F10-T2 | F10 | Implement shared input generation for compare runs | Done | All selected algorithms receive equivalent initial input |
| F10-T3 | F10 | Execute selected algorithms concurrently | Done | Single Start launches all selected algorithms in one session |
| F10-T4 | F10 | Integrate parallel playback across panels | Done | Panels animate concurrently without cross-blocking |
| F10-T5 | F10 | Implement shared control fan-out | Done | Pause/resume/reset/speed apply consistently across panels |
| F10-T6 | F10 | Handle divergent completion states | Done | Early-finished panels remain complete while others continue |
| F10-T7 | F10 | Add compare-run orchestration tests | Done | Sync start, fairness, and fan-out behavior are test-covered |
| F10-T8 | F10 | Run full gates and close F10 | Done | Gates pass and board/worklog closure is complete |
| F11-T1 | F11 | Create central algorithm metadata registry | Done | Metadata exists for every supported algorithm |
| F11-T2 | F11 | Render metadata header on each compare panel | Done | Name, complexity, and description render correctly per panel |
| F11-T3 | F11 | Refine comparative layout and readability | Done | Compare layout remains usable for 2-5 panels |
| F11-T4 | F11 | Add compare-page regression and metadata tests | Done | Metadata and compare interactions are regression-tested |
| F11-T5 | F11 | Run performance/UX validation for compare mode | Done | Compare-mode sanity and performance notes are captured |
| F11-T6 | F11 | Run full gates and close F11 | Done | Gates pass and board/worklog closure is complete |

## Bugfix Queue

| ID | Priority | Status | Summary | Source |
| --- | --- | --- | --- | --- |
| BF-INS-001 | High | Done | Fix Insertion Sort to animate shift-then-insert movement instead of bar-height mutation artifacts | `docs/coordination/BUGFIXES.md` |

## F1 Task Breakdown

Feature: F1 - Foundation and Tooling

Planned order:
1. F1-T1
2. F1-T2
3. F1-T3
4. F1-T4
5. F1-T5
6. F1-T6
7. F1-T7
8. F1-T8
9. F1-T9
10. F1-T10

Task policy for F1:
- Keep one active task/subtask at a time.
- If a task is non-trivial, split into subtasks (`F1-Tx-ST1`, `F1-Tx-ST2`, ...).
- Run verification gates after each completed task.

Reference:
- Full user-story level definitions: `docs/coordination/FEATURES.md`

## F2 Task Breakdown

Feature: F2 - Step Contract and Bubble Sort Engine

Planned order:
1. F2-T1
2. F2-T2
3. F2-T3
4. F2-T4
5. F2-T5
6. F2-T6
7. F2-T7
8. F2-T8

Task policy for F2:
- Keep one active task/subtask at a time.
- If a task is non-trivial, split into subtasks (`F2-Tx-ST1`, `F2-Tx-ST2`, ...).
- Keep algorithm logic pure and independent from renderer internals.
- Run verification gates after each completed task.

Reference:
- Full user-story level definitions: `docs/coordination/FEATURES.md`

## F3 Task Breakdown

Feature: F3 - Additional Algorithms (Insertion and Selection)

Planned order:
1. F3-T1
2. F3-T2
3. F3-T3
4. F3-T4
5. F3-T5
6. F3-T6
7. F3-T7
8. F3-T8

Task policy for F3:
- Keep one active task/subtask at a time.
- If a task is non-trivial, split into subtasks (`F3-Tx-ST1`, `F3-Tx-ST2`, ...).
- Keep algorithm logic pure and independent from renderer internals.
- Run verification gates after each completed task.

Reference:
- Full user-story level definitions: `docs/coordination/FEATURES.md`

## F4 Task Breakdown

Feature: F4 - Animation Engine and Canvas Rendering

Planned order:
1. F4-T1
2. F4-T2
3. F4-T3
4. F4-T4
5. F4-T5
6. F4-T6
7. F4-T7
8. F4-T8

Task policy for F4:
- Keep one active task/subtask at a time.
- If a task is non-trivial, split into subtasks (`F4-Tx-ST1`, `F4-Tx-ST2`, ...).
- Keep visualizer rendering logic independent from sorting algorithm internals.
- Run verification gates after each completed task.
- Apply UI sanity checklist whenever UI-rendered behavior changes.

Reference:
- Full user-story level definitions: `docs/coordination/FEATURES.md`

## F5 Task Breakdown

Feature: F5 - Control Panel and UI State

Planned order:
1. F5-T1
2. F5-T2
3. F5-T3
4. F5-T4
5. F5-T5
6. F5-T6
7. F5-T7
8. F5-T8
9. F5-T9

Task policy for F5:
- Keep one active task/subtask at a time.
- If a task is non-trivial, split into subtasks (`F5-Tx-ST1`, `F5-Tx-ST2`, ...).
- Keep state logic centralized and deterministic.
- Run verification gates after each completed task.
- Apply UI sanity checklist whenever control behavior changes.

Reference:
- Full user-story level definitions: `docs/coordination/FEATURES.md`

## F6 Task Breakdown

Feature: F6 - Responsiveness, Clarity, and Performance

Planned order:
1. F6-T1
2. F6-T2
3. F6-T3
4. F6-T4
5. F6-T5
6. F6-T6
7. F6-T7
8. F6-T8

Task policy for F6:
- Keep one active task/subtask at a time.
- If a task is non-trivial, split into subtasks (`F6-Tx-ST1`, `F6-Tx-ST2`, ...).
- Keep performance tuning measurable and document observations.
- Run verification gates after each completed task.
- Apply mandatory UI sanity checklist for every UI-affecting change.

Reference:
- Full user-story level definitions: `docs/coordination/FEATURES.md`

## F7 Task Breakdown

Feature: F7 - Quality Hardening and Handoff

Planned order:
1. F7-T1
2. F7-T2
3. F7-T3
4. F7-T4
5. F7-T5
6. F7-T6
7. F7-T7

Task policy for F7:
- Keep one active task/subtask at a time.
- If a task is non-trivial, split into subtasks (`F7-Tx-ST1`, `F7-Tx-ST2`, ...).
- Prioritize regression safety and documentation accuracy over refactoring.
- Run verification gates after each completed task.
- Ensure completion entries explicitly reference handoff outcomes.

Reference:
- Full user-story level definitions: `docs/coordination/FEATURES.md`

## F8 Task Breakdown

Feature: F8 - Merge Sort and Quick Sort Expansion

Planned order:
1. F8-T1
2. F8-T2
3. F8-T3
4. F8-T4
5. F8-T5
6. F8-T6
7. F8-T7
8. F8-T8
9. F8-T9

Task policy for F8:
- Keep one active task/subtask at a time.
- If a task is non-trivial, split into subtasks (`F8-Tx-ST1`, `F8-Tx-ST2`, ...).
- Keep step-contract changes backward-compatible for existing algorithms.
- Run verification gates after each completed task.
- Prioritize deterministic behavior for reproducible tests and animations.

Reference:
- Full user-story level definitions: `docs/coordination/FEATURES.md`

## F9 Task Breakdown

Feature: F9 - Comparison Page Foundation and Algorithm Selection

Planned order:
1. F9-T1
2. F9-T2
3. F9-T3
4. F9-T4
5. F9-T5
6. F9-T6
7. F9-T7

Task policy for F9:
- Keep one active task/subtask at a time.
- If a task is non-trivial, split into subtasks (`F9-Tx-ST1`, `F9-Tx-ST2`, ...).
- Keep compare-page setup independent from execution orchestration logic.
- Run verification gates after each completed task.
- Preserve existing main-page behavior while introducing compare route.

Reference:
- Full user-story level definitions: `docs/coordination/FEATURES.md`

## F10 Task Breakdown

Feature: F10 - Synchronized Multi-Algorithm Execution and Rendering

Planned order:
1. F10-T1
2. F10-T2
3. F10-T3
4. F10-T4
5. F10-T5
6. F10-T6
7. F10-T7
8. F10-T8

Task policy for F10:
- Keep one active task/subtask at a time.
- If a task is non-trivial, split into subtasks (`F10-Tx-ST1`, `F10-Tx-ST2`, ...).
- Guarantee shared-input fairness for all selected algorithms.
- Run verification gates after each completed task.
- Keep single-page and compare-page execution paths backward-compatible.

Reference:
- Full user-story level definitions: `docs/coordination/FEATURES.md`

## F11 Task Breakdown

Feature: F11 - Comparative Metadata UX and Hardening

Planned order:
1. F11-T1
2. F11-T2
3. F11-T3
4. F11-T4
5. F11-T5
6. F11-T6

Task policy for F11:
- Keep one active task/subtask at a time.
- If a task is non-trivial, split into subtasks (`F11-Tx-ST1`, `F11-Tx-ST2`, ...).
- Keep metadata source centralized and reusable across pages.
- Run verification gates after each completed task.
- Validate readability/usability for multi-panel compare scenarios.

Reference:
- Full user-story level definitions: `docs/coordination/FEATURES.md`

## Blockers

Add blockers here with owner and unblock plan.
