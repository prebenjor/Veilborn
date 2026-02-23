# Veilborn Working Rules

Before planning or implementing any feature, read `MANIFESTO.md`.
Active manifesto mode is Revision B (uncapped Belief + offline progression).

## Priority Order

1. `MANIFESTO.md` (canonical design source)
2. `docs/roadmap.json` (execution status + milestone ledger)
3. `docs/GAME_REFERENCE.md` (implementation-level feature/balance snapshot)
4. Existing code and tests
5. New task-specific instructions

## Implementation Guardrails

- Favor systems that reinforce indirect influence, uncertainty, and persistent memory.
- Do not add mechanics that turn Veilborn into direct-click optimization.
- Keep event text in-universe by default.
- Treat UI legibility as progression, not static presentation.
- Keep each play session capable of a meaningful 20-40 minute milestone.

If a request conflicts with the manifesto, flag it and ask whether to revise the manifesto or make an intentional exception.

## Documentation Contract

Before implementing:
- Read `MANIFESTO.md`, `docs/roadmap.json`, and `docs/GAME_REFERENCE.md`.

After implementing gameplay/system changes:
- Update `docs/GAME_REFERENCE.md` for formulas, constants, and behavior changes.
- Update `docs/roadmap.json` milestone/PF status if scope changes.
- If design intent changed, update `MANIFESTO.md` in the same change.

Hard rule:
- Never finish a gameplay or systems task without verifying and updating `docs/GAME_REFERENCE.md` in that same change set.

## Repository Rule

- Primary remote: `origin` at `https://github.com/prebenjor/Veilborn.git`.
- Push all completed changes to this repository unless explicitly told otherwise.
