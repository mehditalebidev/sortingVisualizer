# Feature Definitions

This file contains detailed, reviewable feature and task definitions.
Each task is written as a user story with description and acceptance criteria.

## F1 - Foundation and Tooling

Feature goal:
- Establish a reliable TypeScript frontend foundation with consistent quality gates so every future feature can be implemented and validated safely.

Feature-level Definition of Done:
- The app runs locally with a visible canvas shell.
- Core scripts exist and pass: lint, test, test:coverage, typecheck, build.
- Project structure follows the architecture guidelines in `AGENTS.md`.
- `docs/WORKLOG.md` has an F1 completion entry with verification evidence.

### F1-T1 - Initialize Vite + TypeScript Project Scaffold
User story:
- As a developer, I want a standard Vite + TypeScript app scaffold so I can start building features on a fast and maintainable baseline.

Description:
- Create the initial project using Vite with TypeScript support.
- Ensure the app starts in development mode and renders a basic page without runtime errors.

Acceptance criteria:
- The repository contains a valid Vite + TypeScript scaffold.
- `npm run dev` starts successfully.
- The app loads in browser without console errors on first render.

### F1-T2 - Configure TypeScript Strict Mode and Path Conventions
User story:
- As a developer, I want strict TypeScript checks and predictable import conventions so type errors are caught early and code remains consistent.

Description:
- Enable strict compiler options.
- Define import/path conventions as needed for clean module boundaries.

Acceptance criteria:
- TypeScript strict mode is enabled in configuration.
- `npm run typecheck` passes.
- New modules can compile under strict settings without suppressing errors globally.

### F1-T3 - Add Linting Setup and Lint Script
User story:
- As a developer, I want linting in place so style and basic correctness issues are caught before code review.

Description:
- Configure lint tooling for TypeScript frontend code.
- Add and validate a lint script in package scripts.

Acceptance criteria:
- Lint config file(s) are present and valid.
- `npm run lint` executes successfully.
- Existing scaffold code either passes lint or is intentionally updated to pass.

### F1-T4 - Add Test Runner Setup (Vitest + Testing Library)
User story:
- As a developer, I want a test runner and UI testing utilities so I can validate logic and rendering behavior from the start.

Description:
- Configure Vitest for unit testing.
- Configure Testing Library for frontend render tests.
- Add at least one baseline test.

Acceptance criteria:
- Test framework configuration is present and documented in scripts.
- `npm run test` runs and reports passing tests.
- At least one test validates app-level behavior.

### F1-T5 - Add Coverage Configuration and Script
User story:
- As a maintainer, I want coverage reporting so I can enforce quality expectations for touched code over time.

Description:
- Configure coverage reporting in the test setup.
- Add coverage script and ensure it runs in CI/local workflows.

Acceptance criteria:
- Coverage configuration exists and is executable.
- `npm run test:coverage` runs and outputs coverage summary.
- Coverage output can be used to validate touched-code targets.

### F1-T6 - Create Baseline Architecture Folders and Module Stubs
User story:
- As an engineer, I want clear module boundaries so algorithms, visualization, state, and app composition evolve independently.

Description:
- Create architecture-aligned folders and minimal compile-safe stubs:
  - `src/algorithms/`
  - `src/visualizer/`
  - `src/state/`
  - `src/app/`

Acceptance criteria:
- All required directories exist.
- Stub modules compile and do not introduce dead runtime imports.
- The structure matches guidance in `AGENTS.md`.

### F1-T7 - Implement Initial App Bootstrap and Canvas Shell
User story:
- As a user, I want to see a visible visualization area so I know the project is ready for algorithm playback work.

Description:
- Build a minimal app bootstrap path in `src/app`.
- Render an initial canvas shell in the UI.

Acceptance criteria:
- App bootstrap is wired through a clear composition entry point.
- Canvas shell is visible in the running app.
- No runtime errors occur on initial page load.

### F1-T8 - Add Baseline Unit Tests for Bootstrap and Render Smoke
User story:
- As a maintainer, I want baseline tests around app mount/render so foundational regressions are caught immediately.

Description:
- Add tests that verify app mount and canvas shell presence.
- Keep tests deterministic and fast.

Acceptance criteria:
- Tests cover app bootstrap and canvas shell rendering.
- `npm run test` passes with these new tests.
- Tests fail meaningfully if bootstrap/render wiring breaks.

### F1-T9 - Run Full Quality Gate and Fix Remaining Issues
User story:
- As a team, we want one command-level verification pass so we can trust the foundation before moving to algorithm features.

Description:
- Execute full gate checks and resolve any issues:
  - lint
  - test
  - test:coverage
  - typecheck
  - build

Acceptance criteria:
- All five verification commands pass.
- Any issues discovered during the gate run are fixed in-scope.
- Project is stable to start F2 without known red checks.

### F1-T10 - Record F1 Completion in Worklog
User story:
- As a project lead, I want a clear historical record of completed work so agent handoffs remain auditable and predictable.

Description:
- Add a structured `docs/WORKLOG.md` entry for F1.
- Include scope, files changed, tests added, verification results, and next step.

Acceptance criteria:
- A dated F1 entry is added to `docs/WORKLOG.md`.
- Entry includes evidence for all required verification commands.
- Entry lists the next smallest iteration (expected start of F2).

## F2 - Step Contract and Bubble Sort Engine

Feature goal:
- Define the canonical sorting-step data contract and deliver a deterministic Bubble Sort step emitter that can drive visualization and future algorithms.

Feature-level Definition of Done:
- A shared sorting-step TypeScript contract exists and is used by Bubble Sort.
- Bubble Sort emits a full, ordered step sequence from unsorted input to sorted output.
- Deterministic tests verify both sorting correctness and step-sequence integrity.
- App integration can execute Bubble Sort step generation from random input and produce inspectable output.
- Required verification gates pass and worklog records all completed F2 tasks.

### F2-T1 - Define Shared Sorting Step Contract
User story:
- As an engineer, I want one typed step contract so every sorting algorithm can emit steps in a consistent format and the renderer can consume them without per-algorithm branching.

Description:
- Create shared types/interfaces for sorting steps and algorithm metadata.
- Include fields for array snapshot, compared indices, modified indices, and optional operation metadata.
- Place contract in `src/algorithms` and export from a stable module boundary.

Acceptance criteria:
- Contract type(s) are declared in a dedicated file under `src/algorithms`.
- Contract is exported through `src/algorithms` public entry point.
- Typecheck passes with no `any`-based escape hatches.

### F2-T2 - Add Deterministic Algorithm Input/Test Fixtures
User story:
- As a test author, I want deterministic fixture arrays so algorithm and step tests are reproducible and failures are easy to diagnose.

Description:
- Add fixture inputs covering common and edge cases (empty, single element, duplicates, already sorted, reverse sorted).
- Add utility helpers for expected sorted output and basic step validation assertions.

Acceptance criteria:
- Fixture set includes at least 5 representative array scenarios.
- Fixture helpers are reused by Bubble Sort tests.
- Fixtures are deterministic and do not rely on runtime randomness.

### F2-T3 - Implement Bubble Sort as Step Emitter
User story:
- As a learner, I want Bubble Sort to emit each compare/swap progression so I can see how values move toward a sorted array.

Description:
- Implement Bubble Sort in a pure function that accepts an input array and emits a sequence of typed steps.
- Ensure emitted steps reflect compare and swap operations in chronological order.
- Keep algorithm logic rendering-agnostic.

Acceptance criteria:
- Bubble Sort function returns ordered steps using the shared contract.
- Final step snapshot is sorted ascending for valid numeric input.
- Function does not mutate caller-owned input unless explicitly documented and tested.

### F2-T4 - Add Bubble Sort Correctness and Step-Integrity Tests
User story:
- As a maintainer, I want tests for Bubble Sort correctness and step semantics so future refactors do not silently break educational behavior.

Description:
- Add unit tests for sorting correctness across all fixtures.
- Add step-integrity tests verifying key invariants (snapshot length consistency, valid indices, monotonic progression to sorted result).

Acceptance criteria:
- All Bubble Sort fixture tests pass.
- Tests assert both final output correctness and structural validity of emitted steps.
- Coverage for touched algorithm files meets the project threshold.

### F2-T5 - Add Common Algorithm Runner Interface
User story:
- As an app integrator, I want a shared runner interface so the UI can select and execute algorithms uniformly.

Description:
- Define a small abstraction for algorithm execution (for now supporting Bubble Sort).
- Expose algorithm ID/name mapping and execution function through a central module.

Acceptance criteria:
- A common runner interface exists under `src/algorithms`.
- Bubble Sort is registered and executable via the interface.
- Interface is ready for future Insertion/Selection integration without breaking changes.

### F2-T6 - Integrate Bubble Sort Step Generation into App Flow
User story:
- As a user, I want the app to generate a random array and produce Bubble Sort steps so the visualization pipeline has meaningful algorithm data.

Description:
- Add temporary app-level integration that generates random arrays and invokes Bubble Sort through the common runner.
- Provide a simple debug-safe output path (for example, in-memory state or console summary) to verify emitted steps before full renderer wiring.

Acceptance criteria:
- App can execute Bubble Sort step generation from generated input.
- Integration layer compiles cleanly and does not tightly couple algorithm code to canvas rendering.
- There is a clear code path to feed step output into the upcoming visualizer feature.

### F2-T7 - Add Integration/Smoke Tests for Algorithm Pipeline
User story:
- As a reviewer, I want smoke tests for the app-to-algorithm pipeline so we know Bubble Sort data is reachable from the composition layer.

Description:
- Add tests that validate app-side invocation of algorithm runner and presence of non-empty step output for non-trivial input.
- Verify no runtime errors occur in this pipeline.

Acceptance criteria:
- Pipeline tests pass in `npm run test`.
- Tests cover at least one non-trivial input array and one edge case.
- Failures clearly indicate whether issue is contract, runner, or algorithm implementation.

### F2-T8 - Run Full Quality Gate and Close F2 in Worklog
User story:
- As a project lead, I want full verification and documented closure so another agent can continue from a stable F2 baseline.

Description:
- Run full gates (`lint`, `test`, `test:coverage`, `typecheck`, `build`).
- Resolve any in-scope failures.
- Record F2 completion details in `docs/WORKLOG.md` and update board statuses.

Acceptance criteria:
- All quality gates pass at feature end.
- F2 tasks are marked done in board tracking.
- Worklog contains dated entries with verification evidence and next smallest F3 iteration.

## F3 - Additional Algorithms (Insertion and Selection)

Feature goal:
- Add Insertion Sort and Selection Sort using the shared sorting-step contract so users can compare algorithm behavior consistently through the same pipeline.

Feature-level Definition of Done:
- Insertion Sort and Selection Sort are implemented as deterministic step emitters using the shared contract.
- Both algorithms are registered in the common algorithm runner.
- Tests validate correctness and step integrity for both algorithms.
- App integration can execute all three algorithms (Bubble, Insertion, Selection) through one interface.
- Required verification gates pass and worklog records all completed F3 tasks.

### F3-T1 - Define F3 Test Matrix and Contract Compliance Checklist
User story:
- As a maintainer, I want a clear matrix of required algorithm behaviors so every new algorithm is implemented and validated consistently.

Description:
- Define expected invariants each algorithm must satisfy (correct sort order, valid step indices, deterministic step emission).
- Define fixture coverage expectations for all algorithms in this phase.

Acceptance criteria:
- A documented compliance checklist exists in tests/helpers or test docs.
- Required fixture cases for Insertion and Selection are explicitly identified.
- Checklist is reused by both algorithm test suites.

### F3-T2 - Implement Insertion Sort as Typed Step Emitter
User story:
- As a learner, I want Insertion Sort step-by-step output so I can understand shifting/insertion behavior visually.

Description:
- Implement pure Insertion Sort logic that emits steps using the shared contract.
- Emit compare and write/insert index metadata in chronological order.

Acceptance criteria:
- Insertion Sort emits valid typed steps.
- Final step snapshot is sorted ascending.
- Input immutability behavior is consistent with project algorithm conventions and tested.

### F3-T3 - Add Insertion Sort Correctness and Step-Integrity Tests
User story:
- As a reviewer, I want strong Insertion Sort tests so regressions in educational behavior are caught early.

Description:
- Add fixture-based correctness tests for Insertion Sort.
- Add structural tests for emitted steps (indices in range, stable snapshot lengths, valid progression).

Acceptance criteria:
- Insertion Sort passes all fixture correctness tests.
- Step-integrity assertions pass for normal and edge inputs.
- Coverage for touched Insertion files meets threshold.

### F3-T4 - Implement Selection Sort as Typed Step Emitter
User story:
- As a learner, I want Selection Sort step-by-step output so I can understand min-selection and swap behavior.

Description:
- Implement pure Selection Sort logic that emits steps using the shared contract.
- Emit compare and swap metadata clearly and consistently.

Acceptance criteria:
- Selection Sort emits valid typed steps.
- Final step snapshot is sorted ascending.
- Input immutability behavior is consistent with project conventions and tested.

### F3-T5 - Add Selection Sort Correctness and Step-Integrity Tests
User story:
- As a maintainer, I want Selection Sort tested with the same rigor so all algorithms in v1 are equally reliable.

Description:
- Add fixture-based correctness tests for Selection Sort.
- Add structural step tests and edge-case coverage.

Acceptance criteria:
- Selection Sort passes correctness tests across fixture matrix.
- Step-integrity tests pass for edge and non-trivial inputs.
- Coverage for touched Selection files meets threshold.

### F3-T6 - Register Insertion and Selection in Shared Runner
User story:
- As an app integrator, I want all available algorithms exposed via one runner interface so UI logic remains simple and extensible.

Description:
- Extend runner metadata and dispatch logic to include Insertion and Selection.
- Keep API stable for future algorithms.

Acceptance criteria:
- Runner can execute Bubble, Insertion, and Selection by algorithm ID.
- Runner tests verify algorithm registration and dispatch behavior.
- No breaking changes to existing Bubble integration.

### F3-T7 - Integrate Multi-Algorithm Pipeline in App Composition
User story:
- As a user, I want the app pipeline to support selecting any available algorithm so visualization can evolve without rewiring core architecture.

Description:
- Extend app-side pipeline abstraction to accept an algorithm choice.
- Ensure generated step output is inspectable for each supported algorithm.
- Keep rendering decoupled from algorithm internals.

Acceptance criteria:
- App pipeline can generate steps for Bubble, Insertion, and Selection.
- Non-trivial sample inputs produce non-empty step sequences for all three.
- Integration compiles and runs without runtime errors.

### F3-T8 - Add Multi-Algorithm Smoke Tests and Close F3
User story:
- As a project lead, I want full pipeline verification and documented closure so another agent can confidently continue to rendering/control features.

Description:
- Add smoke/integration tests validating multi-algorithm pipeline behavior.
- Run full quality gates and resolve in-scope issues.
- Update board/worklog to close F3.

Acceptance criteria:
- Smoke tests pass for all 3 algorithms via shared runner and app pipeline.
- `lint`, `test`, `test:coverage`, `typecheck`, and `build` all pass.
- F3 tasks are marked done and worklog includes dated completion evidence with next smallest F4 iteration.

## F4 - Animation Engine and Canvas Rendering

Feature goal:
- Build a canvas-based animation engine that plays sorting steps over time with clear visual semantics for comparisons, writes/swaps, and completion.

Feature-level Definition of Done:
- Canvas renderer can draw array bars from step snapshots.
- Playback engine supports frame-by-frame progression based on configurable speed.
- Compare and modified indices are highlighted consistently and clearly.
- Completion state is visually distinct at the end of playback.
- Renderer and playback logic are covered by unit/integration tests and pass all quality gates.

### F4-T1 - Define Rendering Model and Visual Semantics
User story:
- As a learner, I want consistent color and state semantics so I can quickly understand what the algorithm is comparing and changing.

Description:
- Define rendering-level types and mapping from step contract fields to visual states.
- Document baseline visual semantics for neutral, compared, modified, and completed bars.

Acceptance criteria:
- A rendering model exists in `src/visualizer` and is typed.
- Compare/modified/completed states are explicitly represented.
- Visual semantics are documented in code constants or helper docs for reuse.

### F4-T2 - Implement Canvas Setup and Resize-Safe Rendering Surface
User story:
- As a user, I want the canvas to render reliably across viewport changes so visualization remains usable on different screen sizes.

Description:
- Implement canvas initialization with device-pixel-ratio handling.
- Add resize-safe behavior so drawing dimensions remain accurate and crisp.

Acceptance criteria:
- Canvas setup utility initializes context safely.
- Rendering remains sharp on standard/high-DPI displays.
- Resize behavior updates drawing dimensions without runtime errors.

### F4-T3 - Implement Base Bar Renderer from Snapshot Data
User story:
- As a learner, I want each array snapshot rendered as bars so I can visually track value distribution over time.

Description:
- Implement bar drawing logic from numeric snapshot arrays.
- Normalize values to canvas height with safe handling for empty/small arrays.

Acceptance criteria:
- Snapshot arrays render into bar charts consistently.
- Edge cases (empty or single-element arrays) are handled safely.
- Renderer is pure enough to be testable with deterministic inputs.

### F4-T4 - Apply Step Highlights for Compare and Modify Operations
User story:
- As a learner, I want compare and modify operations highlighted differently so I can distinguish algorithm reads from writes/swaps.

Description:
- Extend bar renderer to color-highlight indices listed in `comparedIndices` and `modifiedIndices`.
- Resolve overlap rules when a bar belongs to multiple highlight categories.

Acceptance criteria:
- Compared and modified highlights are visually distinct.
- Overlapping highlight precedence is deterministic and tested.
- Highlight behavior matches step metadata for representative inputs.

### F4-T5 - Implement Playback Engine (Play, Tick, Stop/Complete)
User story:
- As a user, I want smooth step playback over time so I can observe algorithm progression instead of static snapshots.

Description:
- Implement playback controller that advances through step arrays.
- Support start, per-tick advance, and completion handling.
- Keep playback timing independent from algorithm generation.

Acceptance criteria:
- Playback advances deterministically through all steps.
- End-of-sequence transitions to completion state.
- Core playback logic is testable without depending on actual browser frame timing.

### F4-T6 - Integrate Playback and Renderer into App Composition
User story:
- As a user, I want generated algorithm steps to animate in the canvas so the app provides real educational value.

Description:
- Connect app algorithm pipeline output to visualizer playback.
- Render initial state and animate through each step on canvas.
- Keep this integration modular for upcoming control panel feature.

Acceptance criteria:
- App can animate a selected algorithm's emitted steps on canvas.
- Initial, intermediate, and final completion frames render correctly.
- Integration does not tightly couple algorithm modules with canvas internals.

### F4-T7 - Add Visualizer and Playback Tests
User story:
- As a maintainer, I want tests around rendering/playback logic so visual regressions and sequencing bugs are caught early.

Description:
- Add unit tests for rendering model helpers and playback progression.
- Add integration smoke tests for app-to-canvas animation pipeline.

Acceptance criteria:
- Tests cover step-to-visual-state mapping and playback progression rules.
- Pipeline smoke test validates rendering path with deterministic step input.
- Coverage for touched visualizer/playback files meets threshold.

### F4-T8 - UI Sanity Check, Performance Baseline, and F4 Closure
User story:
- As a project lead, I want validated visual quality and documented closure so the next agent can implement controls on a stable animation base.

Description:
- Execute mandatory UI sanity checklist for playback visuals.
- Record baseline performance observations (targeting smooth animation near ~60 FPS on typical hardware).
- Run full quality gates and close F4 in board/worklog.

Acceptance criteria:
- UI sanity checklist items are validated and recorded.
- Performance baseline observations are captured in worklog notes.
- `lint`, `test`, `test:coverage`, `typecheck`, and `build` all pass.
- F4 tasks are marked done and worklog references next smallest F5 iteration.

## F5 - Control Panel and UI State

Feature goal:
- Add user controls for algorithm selection, array size, speed, and playback actions with robust UI state rules during idle/running/paused/completed states.

Feature-level Definition of Done:
- Control panel includes algorithm selector, array size slider, speed slider, start/pause/resume/reset, and randomize.
- UI state transitions are deterministic and prevent invalid actions during playback.
- Controls correctly drive algorithm pipeline and playback engine.
- Tests cover control behavior, state transitions, and key edge cases.
- Full verification gates pass and F5 closure is recorded in worklog.

### F5-T1 - Define UI State Machine for Control Behavior
User story:
- As a user, I want controls to behave predictably in each playback phase so I never trigger invalid or confusing actions.

Description:
- Define explicit states (`idle`, `running`, `paused`, `finished`) and allowed actions in each state.
- Document button enable/disable and transition rules.

Acceptance criteria:
- State model is defined in `src/state` with typed transitions.
- Invalid transitions are guarded by logic (and ideally testable).
- Control behavior mapping is documented and reusable by UI components.

### F5-T2 - Build Control Panel Layout and Base Components
User story:
- As a user, I want all controls visible in one place so I can manage visualization without confusion.

Description:
- Add UI controls for algorithm, size, speed, playback actions, and randomize.
- Keep layout usable on desktop and mobile widths.

Acceptance criteria:
- All required controls are rendered and accessible.
- Labels and control grouping are clear.
- Layout does not break at common mobile and desktop sizes.

### F5-T3 - Wire Algorithm Selector to Pipeline
User story:
- As a learner, I want to choose an algorithm before starting so I can compare different sorting behaviors.

Description:
- Connect selector to algorithm runner IDs.
- Ensure selected algorithm drives generated step sequence for playback.

Acceptance criteria:
- Algorithm selection updates active algorithm state.
- Start action runs the selected algorithm.
- Unsupported selections are prevented by typed options.

### F5-T4 - Implement Array Size and Randomize Behavior
User story:
- As a user, I want to control input size and regenerate arrays so I can experiment with different scenarios.

Description:
- Wire size slider to random array generation count.
- Implement randomize action with deterministic bounds.

Acceptance criteria:
- Size slider updates next generated array length.
- Randomize updates displayed data when allowed by state rules.
- Edge sizes (min/max) are handled safely.

### F5-T5 - Implement Speed Control Mapping to Playback Engine
User story:
- As a learner, I want to slow down or speed up playback so I can study algorithm behavior at my pace.

Description:
- Map speed slider value to playback tick/frame timing.
- Apply speed changes during active playback where supported.

Acceptance criteria:
- Speed control impacts playback cadence visibly.
- Speed changes during playback are reflected without crashing/stalling.
- Mapping is deterministic and testable.

### F5-T6 - Implement Playback Actions (Start, Pause, Resume, Reset)
User story:
- As a user, I want full playback controls so I can inspect progress and restart when needed.

Description:
- Wire actions to playback engine and state machine.
- Ensure reset returns to clean pre-run state with valid preview frame.

Acceptance criteria:
- Start begins playback from current generated array.
- Pause freezes progression; resume continues correctly.
- Reset stops playback and restores initial state consistently.

### F5-T7 - Enforce Control Enable/Disable Rules by State
User story:
- As a user, I want controls to be disabled when unsafe so I avoid broken or contradictory interactions.

Description:
- Implement control gating using state model from F5-T1.
- Apply consistent disabled logic across all controls.

Acceptance criteria:
- Buttons/sliders/selectors enable/disable per state rules.
- Conflicting actions are blocked during running state.
- UI reflects current state clearly.

### F5-T8 - Add Control-State and Interaction Tests
User story:
- As a maintainer, I want tests for control interactions so regressions in UX behavior are caught quickly.

Description:
- Add tests for state transitions, action sequencing, and disabled rules.
- Cover at least one happy path and key edge/error cases.

Acceptance criteria:
- Tests verify start/pause/resume/reset flow.
- Tests verify selector/size/speed/randomize behavior and gating.
- Coverage for touched UI/state files meets threshold.

### F5-T9 - Run Full Gates, UI Checklist, and Close F5
User story:
- As a project lead, I want a fully verified F5 closure so the next feature starts from a stable interactive baseline.

Description:
- Execute full verification (`lint`, `test`, `test:coverage`, `typecheck`, `build`).
- Run mandatory UI sanity checks for control behavior.
- Update board/worklog and mark F5 done.

Acceptance criteria:
- All quality gates pass.
- UI sanity checklist confirms correct control behavior in all playback states.
- Board/worklog are updated with dated evidence and next smallest F6 iteration.

## F6 - Responsiveness, Clarity, and Performance

Feature goal:
- Improve layout responsiveness, visual clarity, and playback smoothness so the sorting visualizer feels reliable and understandable across desktop and mobile devices.

Feature-level Definition of Done:
- Core UI and canvas layout are usable on mobile and desktop breakpoints.
- Visual semantics (neutral/compare/modify/sorted) are clear and consistent.
- Animation performance is tuned toward a smooth baseline near ~60 FPS on typical modern hardware.
- UI redraw behavior avoids obvious flicker or jank.
- Tests and verification gates pass, and performance/UX observations are documented.

### F6-T1 - Define Responsive Layout and Visual Clarity Checklist
User story:
- As a user, I want a readable interface on different screen sizes so I can use the visualizer effectively on laptop and mobile.

Description:
- Define breakpoints and layout rules for controls and canvas region.
- Define clarity requirements for typography, spacing, color contrast, and highlight semantics.

Acceptance criteria:
- Breakpoint strategy and UI clarity checklist are documented in code or project docs.
- Required desktop/mobile layout expectations are explicit and testable.
- Checklist aligns with the mandatory UI sanity criteria in `AGENTS.md`.

### F6-T2 - Implement Responsive Control Panel and Canvas Layout
User story:
- As a user, I want controls and visualization to fit my screen without overlapping or truncation.

Description:
- Update layout styles to support mobile-first stacking and desktop expansion.
- Ensure canvas container scales safely while preserving readability.

Acceptance criteria:
- Controls remain usable at common mobile widths.
- Canvas remains visible and does not overflow container unexpectedly.
- Desktop layout preserves clear hierarchy and spacing.

### F6-T3 - Improve Visual Semantics and Legend/Hint Clarity
User story:
- As a learner, I want clear visual meaning for each highlight state so I can interpret algorithm operations quickly.

Description:
- Refine colors/styling for neutral, compare, modify, and completed states.
- Add or refine a compact legend/hint area for state meaning if needed.

Acceptance criteria:
- Compare and modify states are clearly distinguishable.
- Completed state is obvious at playback end.
- Visual semantics are consistent between controls, legend, and canvas rendering.

### F6-T4 - Reduce Redraw Artifacts and Flicker
User story:
- As a user, I want stable rendering so animation appears smooth and not visually distracting.

Description:
- Audit and improve redraw sequence to avoid unnecessary clears/repaints.
- Stabilize frame updates and canvas state handling.

Acceptance criteria:
- No obvious flicker during normal playback.
- Rendering path avoids redundant heavy operations per frame where feasible.
- Changes are measurable via visual inspection and deterministic tests where possible.

### F6-T5 - Tune Playback Timing for Smoothness Baseline
User story:
- As a learner, I want animation speed that feels smooth so I can track operations without stutter.

Description:
- Refine tick/frame timing strategy and speed mapping.
- Ensure speed settings remain responsive and stable under varying array sizes.

Acceptance criteria:
- Playback feels smooth under normal v1 input sizes.
- Speed controls remain responsive while running.
- Baseline observations target near ~60 FPS on typical modern hardware.

### F6-T6 - Add Responsive and Visual Regression Tests
User story:
- As a maintainer, I want tests for layout/state rendering so regressions in UI clarity are caught before merge.

Description:
- Add tests for control/canvas rendering under representative viewport conditions.
- Add assertions for highlight class/state mapping and completion visuals.

Acceptance criteria:
- Tests validate core responsive behavior and visual-state mapping.
- Tests fail meaningfully when key layout or visual semantics break.
- Coverage for touched UI/visualizer files meets threshold.

### F6-T7 - Run UI Sanity and Performance Validation Pass
User story:
- As a project lead, I want a structured validation pass so we can confidently move to hardening with known UI/perf status.

Description:
- Execute mandatory UI sanity checklist items after responsiveness/perf changes.
- Record performance observations (device/browser context and perceived smoothness baseline).

Acceptance criteria:
- Desktop/mobile usability checks are recorded and pass.
- Pause/resume/reset and control gating still behave correctly after styling/perf changes.
- Performance baseline notes are captured in `docs/WORKLOG.md`.

### F6-T8 - Run Full Gates and Close F6
User story:
- As a project lead, I want fully verified closure so the next feature starts from a stable, polished UI baseline.

Description:
- Run full verification (`lint`, `test`, `test:coverage`, `typecheck`, `build`).
- Resolve in-scope issues and update board/worklog statuses.

Acceptance criteria:
- All quality gates pass.
- F6 tasks are marked done in board tracking.
- Worklog contains dated closure evidence and next smallest F7 iteration.

## F7 - Quality Hardening and Handoff

Feature goal:
- Harden quality gates, regression safety, and documentation handoff so the project is stable for continued development and future contributors/agents.

Feature-level Definition of Done:
- Coverage policy for touched code is enforced and documented.
- Critical user flows have regression-focused tests.
- Coordination docs and implementation status are aligned.
- Release-readiness checklist is captured with known risks/open items.
- Full verification gates pass and handoff notes are recorded.

### F7-T1 - Define Release Readiness and Hardening Checklist
User story:
- As a project lead, I want a concrete hardening checklist so final stabilization work is objective and trackable.

Description:
- Define checklist sections for quality gates, regressions, coverage, docs alignment, and operational notes.
- Record pass/fail criteria for each section.

Acceptance criteria:
- A hardening checklist is documented in coordination docs.
- Criteria are measurable and map to existing scripts/process.
- Checklist is referenced in worklog closure entries.

### F7-T2 - Enforce Coverage Thresholds for Touched Code
User story:
- As a maintainer, I want coverage expectations enforced so quality does not regress as features evolve.

Description:
- Ensure current test setup enforces the 80% lines/branches requirement for touched code.
- Add or adjust config/documentation for consistent local and CI behavior.

Acceptance criteria:
- Coverage policy is enforced or explicitly validated in project scripts/config.
- Touched-code coverage is demonstrably >=80% lines/branches.
- Any exceptions are documented with rationale.

### F7-T3 - Add Regression Tests for Critical User Flows
User story:
- As a user, I want core interactions to remain reliable after future changes.

Description:
- Add focused regression tests for critical flows:
  - algorithm selection and run
  - playback controls (start/pause/resume/reset)
  - randomize and size/speed interactions
- Prioritize high-risk integration paths.

Acceptance criteria:
- Regression tests cover the agreed critical flows.
- Tests fail meaningfully when flow contracts break.
- Test suite remains deterministic and maintainable.

### F7-T4 - Verify Cross-Feature Integration Consistency
User story:
- As a maintainer, I want consistent behavior across algorithms and UI states so users see predictable results.

Description:
- Validate interactions across implemented features (algorithms, renderer, controls, state transitions).
- Fix inconsistencies in labels, states, or behavior discovered during validation.

Acceptance criteria:
- All supported algorithms execute through the same pipeline without special-case breakage.
- UI state transitions remain valid across feature boundaries.
- Integration issues found during this pass are resolved or explicitly logged.

### F7-T5 - Align Documentation and Coordinator Artifacts
User story:
- As a new contributor/agent, I want docs and board status to match implementation so I can continue work confidently.

Description:
- Synchronize `AGENTS.md`, `CLAUDE.md`, roadmap/board/features docs, and worklog references.
- Ensure current project status and next roadmap items are accurate.

Acceptance criteria:
- Coordination files reflect current implemented state.
- Outstanding items and next iteration are clearly identified.
- No stale status mismatches remain in core docs.

### F7-T6 - Create Handoff Notes and Known Issues Register
User story:
- As the next engineer/agent, I want a concise handoff so I can start quickly without rediscovering context.

Description:
- Add a handoff note summarizing architecture, current capabilities, known issues, and next recommended tasks.
- Link active bugfix tickets (for example `BF-INS-001`) and roadmap priorities.

Acceptance criteria:
- Handoff notes are committed in docs and easy to locate.
- Known issues include severity and suggested next action.
- Next smallest iteration is clearly proposed.

### F7-T7 - Run Full Quality Gates and Close F7
User story:
- As a project lead, I want final gate evidence so this release baseline is trustworthy and auditable.

Description:
- Run full verification (`lint`, `test`, `test:coverage`, `typecheck`, `build`).
- Resolve in-scope failures.
- Mark board/worklog closure for F7.

Acceptance criteria:
- All quality gates pass.
- F7 tasks are marked done in board tracking.
- Worklog includes dated closure evidence and explicitly states recommended next track (new feature or bugfix).

## F8 - Merge Sort and Quick Sort Expansion

Feature goal:
- Add Merge Sort and Quick Sort with deterministic, visualization-friendly step emissions so users can learn divide-and-conquer sorting behaviors.

Feature-level Definition of Done:
- Merge Sort and Quick Sort are implemented using the shared step contract (or additive metadata that remains backward-compatible).
- Both algorithms are available through the shared runner and algorithm selector pipeline.
- Tests validate correctness, step integrity, and pipeline compatibility for both algorithms.
- Existing Bubble/Insertion/Selection behavior remains stable.
- Full verification gates pass and F8 closure is recorded in worklog.

### F8-T1 - Define Divide-and-Conquer Step Semantics
User story:
- As a learner, I want merge/partition operations represented clearly so I can follow recursive algorithm behavior in the visualizer.

Description:
- Define how Merge Sort and Quick Sort operations map to the existing step model.
- If needed, add optional metadata (e.g., `operation`, `range`, `pivotIndex`) without breaking current algorithms.

Acceptance criteria:
- Step semantics for merge and partition phases are explicitly documented.
- Any contract changes are additive and backward-compatible.
- Existing algorithm tests continue to pass after contract updates.

### F8-T2 - Add Deterministic Fixtures for Merge/Quick Edge Cases
User story:
- As a maintainer, I want deterministic fixtures covering tricky cases so regressions in divide-and-conquer implementations are caught reliably.

Description:
- Add fixture inputs for duplicates, nearly sorted arrays, reverse sorted arrays, and repeated values.
- Add helper expectations specific to merge/partition behaviors where needed.

Acceptance criteria:
- Fixture set includes representative edge and non-trivial cases for both algorithms.
- Fixtures are deterministic and reusable across both test suites.
- Helper assertions remain generic where possible.

### F8-T3 - Implement Merge Sort as Typed Step Emitter
User story:
- As a learner, I want Merge Sort to show split/merge progression so I can understand how sorted subarrays are combined.

Description:
- Implement Merge Sort with deterministic step emission reflecting compare and write operations.
- Keep implementation renderer-agnostic and aligned with shared contract.

Acceptance criteria:
- Merge Sort emits ordered typed steps ending with sorted snapshot.
- Behavior is deterministic for identical inputs.
- Input mutation behavior is consistent with project conventions and covered by tests.

### F8-T4 - Add Merge Sort Correctness and Step-Integrity Tests
User story:
- As a reviewer, I want thorough Merge Sort tests so algorithm correctness and educational step quality are preserved.

Description:
- Add correctness tests over fixture matrix.
- Add step-integrity assertions (valid indices, stable lengths, meaningful operation progression).

Acceptance criteria:
- Merge Sort passes correctness tests for all fixtures.
- Step-integrity checks pass for representative scenarios.
- Coverage for touched merge files meets project threshold.

### F8-T5 - Implement Quick Sort as Typed Step Emitter
User story:
- As a learner, I want Quick Sort to show partition behavior and pivot effects so I can see how subranges are recursively sorted.

Description:
- Implement Quick Sort with deterministic pivot strategy and step emission for compare/swap/partition operations.
- Keep implementation pure and compatible with renderer expectations.

Acceptance criteria:
- Quick Sort emits ordered typed steps ending with sorted snapshot.
- Pivot/partition operations are representable in emitted metadata.
- Behavior is deterministic for identical input and strategy.

### F8-T6 - Add Quick Sort Correctness and Step-Integrity Tests
User story:
- As a maintainer, I want Quick Sort tested against edge cases so partition bugs and unstable visual states are caught early.

Description:
- Add fixture-based correctness tests for Quick Sort.
- Add integrity assertions for partition-related step semantics and index validity.

Acceptance criteria:
- Quick Sort passes correctness tests for all fixtures.
- Step-integrity tests pass for partition edge cases.
- Coverage for touched quicksort files meets project threshold.

### F8-T7 - Register Merge/Quick in Runner and Pipeline
User story:
- As a user, I want Merge Sort and Quick Sort available in algorithm selection so I can compare them with existing algorithms.

Description:
- Extend runner registration and app algorithm pipeline to include Merge and Quick.
- Ensure selection and playback paths remain consistent across all algorithms.

Acceptance criteria:
- Runner supports Bubble, Insertion, Selection, Merge, and Quick IDs.
- Pipeline can produce steps for Merge and Quick without regressions.
- Existing algorithms continue to run unchanged.

### F8-T8 - Add Multi-Algorithm Regression/Smoke Coverage
User story:
- As a maintainer, I want end-to-end algorithm pipeline smoke coverage so newly added algorithms do not break existing flows.

Description:
- Expand smoke tests to include Merge and Quick through shared pipeline.
- Verify algorithm selector options and execution path remain stable.

Acceptance criteria:
- Smoke tests pass for all five algorithms.
- Failures clearly isolate algorithm, runner, or pipeline sources.
- Regression coverage for existing algorithms remains green.

### F8-T9 - Run Full Gates and Close F8
User story:
- As a project lead, I want final gate evidence and closure notes so post-v1 algorithm expansion is complete and auditable.

Description:
- Run full verification (`lint`, `test`, `test:coverage`, `typecheck`, `build`).
- Resolve in-scope issues, update board/worklog, and capture next recommended track.

Acceptance criteria:
- All quality gates pass.
- F8 tasks are marked done in board tracking.
- Worklog includes dated F8 closure evidence and next suggested iteration.

## F9 - Comparison Page Foundation and Algorithm Selection

Feature goal:
- Add a dedicated comparison page where users can select multiple algorithms via checkbox dropdown and see one panel per selected algorithm.

Feature-level Definition of Done:
- Comparison page is available via dedicated route (recommended `/compare`).
- Multi-select dropdown supports selecting/toggling algorithms to compare.
- Responsive panel grid renders one panel per selected algorithm.
- Comparison-page state is deterministic and test-covered.
- Full verification gates pass and F9 closure is recorded in worklog.

### F9-T1 - Add Comparison Route and Navigation Entry
User story:
- As a user, I want a dedicated comparison page so I can compare multiple algorithms without disrupting the single-visualization page.

Description:
- Add routing/navigation support for a separate comparison page.
- Ensure route loads cleanly and does not break existing app entry flow.

Acceptance criteria:
- Comparison page is reachable through UI navigation.
- Existing main page route remains functional.
- Route initialization compiles and runs without runtime errors.

### F9-T2 - Define Comparison Page State Model
User story:
- As a maintainer, I want a typed state model for comparison mode so multi-algorithm behavior is predictable and testable.

Description:
- Define state for selected algorithms, shared controls, and panel instances.
- Include defaults and constraints (recommended minimum selected algorithms for run).

Acceptance criteria:
- Comparison state model is typed and centralized.
- State transitions for selection updates are deterministic.
- Invalid states are guarded (for example, no unsupported algorithm IDs).

### F9-T3 - Implement Multi-Select Dropdown with Checkboxes
User story:
- As a user, I want to tick algorithms from a dropdown so I can customize which algorithms appear in the comparison.

Description:
- Build dropdown UI with checkbox items for all supported algorithms.
- Support toggling algorithms on/off while preserving current selection state.

Acceptance criteria:
- Dropdown lists all supported algorithms with checkbox state.
- Toggling updates selected algorithm list immediately.
- Control remains accessible and usable on desktop/mobile.

### F9-T4 - Build Dynamic Comparison Panel Grid
User story:
- As a user, I want one chart panel per selected algorithm so I can visually compare them side by side.

Description:
- Implement responsive grid that renders panels from selected algorithms.
- Ensure panel identity is stable when selection changes.

Acceptance criteria:
- Number of rendered panels matches number of selected algorithms.
- Panel add/remove behavior is stable and deterministic.
- Grid remains usable at common screen sizes.

### F9-T5 - Add Shared Compare Controls Skeleton
User story:
- As a user, I want familiar controls on comparison page so workflow matches the main page.

Description:
- Add shared controls (array size, speed, randomize, start/reset placeholders) to comparison page shell.
- Wire to comparison state without full execution fan-out yet.

Acceptance criteria:
- Controls are visible and update comparison-mode state.
- Control states are consistent with selected algorithms.
- No execution regressions are introduced in main page.

### F9-T6 - Add Selection and Layout Tests
User story:
- As a maintainer, I want automated coverage for selection and panel rendering so future UI changes do not break comparison setup.

Description:
- Add tests for dropdown selection behavior, state updates, and panel grid rendering.
- Include edge case checks (empty selection handling, rapid toggle sequences).

Acceptance criteria:
- Tests validate multi-select and panel-count mapping behavior.
- Tests fail meaningfully on selection/panel regressions.
- Coverage for touched comparison page files meets threshold.

### F9-T7 - Run Full Gates and Close F9
User story:
- As a project lead, I want gate evidence and closure notes so synchronized execution work can start from a stable compare-page base.

Description:
- Run full verification (`lint`, `test`, `test:coverage`, `typecheck`, `build`).
- Resolve in-scope failures and update board/worklog statuses.

Acceptance criteria:
- All quality gates pass.
- F9 tasks are marked done in board tracking.
- Worklog contains dated closure evidence and next smallest F10 iteration.

## F10 - Synchronized Multi-Algorithm Execution and Rendering

Feature goal:
- Enable all selected algorithms to start concurrently on shared input and animate in parallel for fair, real-time comparison.

Feature-level Definition of Done:
- A shared run session model exists for synchronized multi-algorithm starts.
- All selected algorithms run from the same initial array (or deterministic seed).
- Comparison panels animate concurrently with per-panel completion handling.
- Shared controls fan out correctly across all running panels.
- Full verification gates pass and F10 closure is recorded in worklog.

### F10-T1 - Define Multi-Run Session Contract
User story:
- As a maintainer, I want a clear multi-run contract so synchronized behavior is deterministic and easier to debug.

Description:
- Define session shape including shared input, selected algorithms, per-panel step streams, and run status.
- Specify synchronization guarantees and completion behavior.

Acceptance criteria:
- Session contract is typed and documented.
- Shared-input guarantees are explicit and testable.
- Existing single-run code paths remain compatible.

### F10-T2 - Implement Shared Input Generation for Compare Runs
User story:
- As a user, I want all compared algorithms to start with identical data so the comparison is fair.

Description:
- Generate one source array (or seed) for each run and distribute clones to each algorithm execution.
- Prevent accidental cross-algorithm mutation.

Acceptance criteria:
- All selected algorithms receive equivalent initial input.
- Input cloning/immutability is validated in tests.
- Randomize behavior regenerates one shared input for next run.

### F10-T3 - Execute Selected Algorithms Concurrently
User story:
- As a user, I want one Start action to run all selected algorithms at once so I can compare behavior in real time.

Description:
- Orchestrate parallel step generation/loading for selected algorithms.
- Trigger panel playback initialization for all selected algorithms on single start.

Acceptance criteria:
- Start action initiates all selected algorithms in same run session.
- No selected algorithm is skipped during startup.
- Startup sequence is deterministic and test-covered.

### F10-T4 - Integrate Parallel Playback Across Panels
User story:
- As a learner, I want all algorithm panels animating together so differences in progression are obvious.

Description:
- Connect per-algorithm step streams to panel renderers.
- Keep panel playback isolated while sharing run lifecycle controls.

Acceptance criteria:
- Multiple panels animate concurrently without blocking each other.
- Per-panel failures/completion do not crash the full compare session.
- Rendering remains stable under 2-5 concurrent panels.

### F10-T5 - Implement Shared Control Fan-Out (Pause/Resume/Reset/Speed)
User story:
- As a user, I want one control action to affect all running comparison panels consistently.

Description:
- Wire pause/resume/reset/speed to apply uniformly across active panel playbacks.
- Ensure control behavior is deterministic when some panels already finished.

Acceptance criteria:
- Pause/resume impacts all non-complete panels.
- Reset returns full compare session to clean pre-run state.
- Speed changes apply consistently across active panels.

### F10-T6 - Handle Divergent Completion States
User story:
- As a learner, I want finished algorithms to remain visibly complete while slower ones continue, so performance and behavior differences are clear.

Description:
- Implement per-panel completion while run session remains active until all panels complete or user resets.
- Preserve completion styling/state for finished panels.

Acceptance criteria:
- Faster algorithms can complete early without stopping others.
- Completion state remains visible and stable for finished panels.
- Session end condition is deterministic and documented.

### F10-T7 - Add Compare-Run Orchestration Tests
User story:
- As a maintainer, I want tests for synchronization and fan-out logic so multi-run regressions are caught early.

Description:
- Add tests for shared input fairness, synchronized start, control fan-out, and divergent completion behavior.
- Include at least one non-trivial multi-algorithm scenario.

Acceptance criteria:
- Tests validate synchronized execution contracts.
- Failures isolate orchestration vs renderer/panel issues.
- Coverage for touched compare-run files meets threshold.

### F10-T8 - Run Full Gates and Close F10
User story:
- As a project lead, I want verified closure for synchronized execution so metadata and polish can proceed on a stable base.

Description:
- Run full verification (`lint`, `test`, `test:coverage`, `typecheck`, `build`).
- Resolve in-scope failures and update board/worklog statuses.

Acceptance criteria:
- All quality gates pass.
- F10 tasks are marked done in board tracking.
- Worklog contains dated closure evidence and next smallest F11 iteration.

## F11 - Comparative Metadata UX and Hardening

Feature goal:
- Improve educational value by showing algorithm metadata on each comparison panel and hardening compare mode for usability and stability.

Feature-level Definition of Done:
- Every comparison panel shows algorithm name, time complexity, and short description.
- Metadata is sourced from centralized registry and remains consistent across pages.
- Compare-mode layout and readability are stable for common panel counts.
- Regression/performance checks for compare mode are in place.
- Full verification gates pass and F11 closure is recorded in worklog.

### F11-T1 - Create Central Algorithm Metadata Registry
User story:
- As a maintainer, I want one metadata source so algorithm labels, complexity, and descriptions stay consistent across the app.

Description:
- Define registry entries for all supported algorithms.
- Include fields: display name, time complexity (best/avg/worst as applicable), short educational description.

Acceptance criteria:
- Registry exists and is typed.
- All supported algorithms have complete metadata entries.
- Consumers can resolve metadata by algorithm ID.

### F11-T2 - Render Metadata Header on Each Compare Panel
User story:
- As a learner, I want algorithm name and complexity visible above each chart so I can interpret what I am seeing.

Description:
- Add panel header component with algorithm name, complexity, and concise description.
- Ensure metadata updates correctly when selection changes.

Acceptance criteria:
- Every rendered compare panel shows correct metadata.
- Metadata remains accurate after selection changes and reruns.
- Header styling remains readable at mobile/desktop widths.

### F11-T3 - Refine Comparative Layout and Readability
User story:
- As a user, I want the comparison page to remain readable with multiple selected algorithms.

Description:
- Improve spacing, typography hierarchy, and responsive panel behavior for 2-5 panels.
- Keep controls and metadata legible without overlap/clipping.

Acceptance criteria:
- Compare page is usable with at least 2, 3, and 5 selected panels.
- No major overlap/truncation in typical viewport sizes.
- Visual hierarchy supports quick scan of panel metadata and chart.

### F11-T4 - Add Compare-Page Regression and Metadata Tests
User story:
- As a maintainer, I want compare-page tests for metadata and interaction stability so UX regressions are caught pre-merge.

Description:
- Add tests verifying metadata mapping, panel count/layout behavior, and key control interactions in compare mode.
- Include checks for algorithm selector toggles and rerun behavior.

Acceptance criteria:
- Tests validate metadata correctness for all supported algorithms.
- Tests cover representative compare-page interactions.
- Coverage for touched compare-page files meets threshold.

### F11-T5 - Run Performance/UX Validation for Compare Mode
User story:
- As a project lead, I want confidence that multi-panel compare mode remains smooth and understandable under normal usage.

Description:
- Execute UI sanity checks for compare route with multiple panel counts.
- Record performance observations for concurrent animation sessions.

Acceptance criteria:
- UI sanity checks pass for compare mode controls and rendering.
- Performance notes are captured in worklog with context.
- Known limitations (if any) are documented for follow-up.

### F11-T6 - Run Full Gates and Close F11
User story:
- As a project lead, I want final verification and closure notes so the comparison experience can be considered complete and ready.

Description:
- Run full verification (`lint`, `test`, `test:coverage`, `typecheck`, `build`).
- Resolve in-scope failures and update board/worklog statuses.

Acceptance criteria:
- All quality gates pass.
- F11 tasks are marked done in board tracking.
- Worklog contains dated closure evidence and next suggested roadmap track.
