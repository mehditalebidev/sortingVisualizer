# Release Readiness and Hardening Checklist (F7)

This checklist is the release-readiness source for F7.
Each section contains objective pass criteria and required evidence.

## How to use this checklist

- Complete sections in F7 task order (`F7-T1` through `F7-T7`).
- Mark each item as Pass or Fail with direct evidence links/commands.
- If an item fails, fix scope issues before moving to the next F7 task.

## 1) Quality Gates

Pass criteria:
- `npm run lint` passes without errors.
- `npm run test` passes with deterministic results.
- `npm run test:coverage` passes and generates coverage artifacts.
- `npm run typecheck` passes without TypeScript errors.
- `npm run build` completes without runtime build failures.

Required evidence:
- Command outputs recorded in `docs/WORKLOG.md` for each completed F7 task.

## 2) Coverage Policy (Touched Code)

Pass criteria:
- Touched implementation files are validated at >=80% lines and >=80% branches.
- Coverage-check workflow is scriptable and documented for repeat use.
- Exceptions (if any) are documented with rationale and follow-up action.

Required evidence:
- `npm run test:coverage` output.
- `npm run coverage:touched` output.
- If running without a baseline commit, use `COVERAGE_TOUCHED_FILES=src/path.ts npm run coverage:touched` for explicit file validation.
- Exception note in `docs/WORKLOG.md` if applicable.

## 3) Critical-Flow Regression Safety

Pass criteria:
- Regression tests cover:
  - algorithm selection and run
  - playback controls (`start`, `pause`, `resume`, `reset`)
  - randomize plus size/speed interactions
- Tests fail meaningfully if the flow contracts regress.

Required evidence:
- Test file references and passing `npm run test` output.

## 4) Cross-Feature Integration Consistency

Pass criteria:
- Bubble, Insertion, and Selection execute through the same pipeline.
- UI state transitions remain valid across algorithm changes and playback states.
- Renderer, controls, and state remain behaviorally consistent without algorithm-specific UI hacks.

Required evidence:
- Integration test coverage references.
- Any discovered mismatch resolved or logged in known issues.

## 5) Documentation and Coordination Alignment

Pass criteria:
- `AGENTS.md` and `CLAUDE.md` critical rules stay aligned.
- `docs/coordination/BOARD.md` status and queue reflect actual implementation state.
- `docs/coordination/ROADMAP.md`, `docs/coordination/FEATURES.md`, and `docs/WORKLOG.md` are synchronized.

Required evidence:
- Updated docs with matching feature/task statuses.

## 6) Handoff and Known Issues

Pass criteria:
- A handoff note summarizes architecture, current capabilities, and recommended next iteration.
- Known issues include severity, impact, and suggested next action.
- Active bugfix references are linked if applicable.

Required evidence:
- Handoff document path recorded in `docs/WORKLOG.md`.

## 7) Final Closure

Pass criteria:
- All F7 tasks are marked `Done` in board tracking.
- Full verification gates pass after final changes.
- Worklog includes final closure evidence and the recommended next track.

Required evidence:
- Final F7 closure entry in `docs/WORKLOG.md`.
