# Veilborn - Devotion System

Purpose: architecture reference for Devotion across eras.

Scope split:
- Implemented now: Era I foundation + M21 path system.
- Deferred: balance calibration of per-path coefficients under M14.

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

## M21 Path Differentiation (Implemented)

### Era II emergence

- Act-heavy pattern trends toward `Fervour`
- Cult-heavy pattern trends toward `Accord`
- Emergence threshold: top momentum `>= 4`
- Switch threshold: challenger `>= 7` and at least `3` points ahead of active path

### Era III crystallization

Named paths:
- `Fervour`
- `Accord`
- `Reverence`
- `Ardour`

Each path receives distinct mechanical effects in Era III. Switching paths requires sustained behavior change, not instant toggles.

Runtime momentum sources:
- `Fervour`: start act `+2`, cast miracle `+2`
- `Accord`: form cult `+2`, follower rite `+1`
- `Reverence`: suppress rival `+2`
- `Ardour`: whisper/recruit/anoint prophet `+1`

Runtime effect layer:
- `momentumScale = clamp(1 + momentum*0.01, 1.0, 1.4)`
- `Fervour`: act return multiplier; Era III miracle gain multiplier
- `Accord`: cult output multiplier; Era III domain synergy bonus
- `Reverence`: Era III veil erosion reduction multiplier
- `Ardour`: Era III prophet output multiplier and faith-decay pressure reduction

### Run-to-run memory

Run 2+ starts with one free momentum point toward the prior run's dominant path threshold.

## Guardrails

- Devotion must not decay.
- Devotion must not punish inactivity.
- Path effects should be meaningful but not dominant over core systems.
