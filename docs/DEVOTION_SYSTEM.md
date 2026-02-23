# Veilborn - Devotion System

Purpose: architecture reference for Devotion across eras.

Scope split:
- Implemented now: Era I foundation only.
- Deferred: full path system (`M21`).

## Era I Foundation (Implemented)

Devotion is a momentum state that does not decay.

- Stack range: `0..3`
- Qualifying actions: Whisper, Recruit, Anoint Prophet
- Gain: +1 stack per qualifying action (capped at 3)
- Offline: persists, no gain/loss
- Reset: ascension only

Recruit amplification:

`recruit_followers = base_followers * (1 + 0.08 * devotion_stacks)`

Milestone omens (once per run):
- First stack: `Something stirs at the edge of attention.`
- First max stack: `The devotion of your followers has taken root.`
- First qualifying action after ascension: `The stillness returns. Begin again.`

## M21 Path Differentiation (Planned, Not Implemented)

### Era II emergence

- Act-heavy pattern trends toward `Fervour`
- Cult-heavy pattern trends toward `Accord`

### Era III crystallization

Named paths:
- `Fervour`
- `Accord`
- `Reverence`
- `Ardour`

Each path receives distinct mechanical effects in Era III. Switching paths requires sustained behavior change, not instant toggles.

### Run-to-run memory

Run 2+ starts with one free stack toward the prior run's dominant path threshold.

## Guardrails

- Devotion must not decay.
- Devotion must not punish inactivity.
- Path effects should be meaningful but not dominant over core systems.
