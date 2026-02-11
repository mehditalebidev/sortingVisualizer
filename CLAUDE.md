# Agent Instructions (Mirror)

Primary instruction file: `AGENTS.md`.
Read and follow `AGENTS.md` first.

Critical rules:
- Build a TypeScript sorting visualizer using HTML Canvas API.
- v1 algorithms: Bubble, Insertion, Selection.
- Follow strict iterative flow: Feature -> Task -> Subtask.
- Split work if an iteration would touch more than 6 files.
- For every completed increment, run:
  - lint
  - tests
  - coverage
  - typecheck
  - build
- Require at least 80% lines/branches coverage for touched code.
- If any verification fails, block and fix before continuing.
- Record each increment in `docs/WORKLOG.md`.
- Keep roadmap and board updated in `docs/coordination/ROADMAP.md` and `docs/coordination/BOARD.md`.
- Keep detailed feature/task definitions in `docs/coordination/FEATURES.md`.
- Track standalone bugfix tickets in `docs/coordination/BUGFIXES.md`.
- Use `docs/coordination/HARDENING_CHECKLIST.md` for F7 release-readiness criteria.
- Apply relevant `skills/` guidance before implementation.
- Use feature branch per feature.
- Product spec lives in `docs/PROJECT.md`.
