# Car Story — Backlog

_Last updated: 2026-05-26_

Lightweight, single-source backlog for bugs, polish items, and small ideas
surfaced between releases. Keep it in git so commits/PRs can reference IDs.

- **Scope**: items that don't deserve a roadmap entry yet. Anything bigger
  (phase work, monetization, big features) belongs in [`ROADMAP.md`](./ROADMAP.md).
- **ID convention**: `B-###` bug, `I-###` improvement, `D-###` idea/discovery.
  Never reuse a number, even after closing.
- **Status**: `open` → `in-progress` → `done` (or `wontfix` / `dup`).
- **Workflow**: add items as soon as you spot them. When you start one, flip
  status. When you ship, set status to `done` and add the commit hash.

---

## Open (snapshot)

| ID    | Title                                                                  | Type | Priority | Source / date          |
| ----- | ---------------------------------------------------------------------- | ---- | -------- | ---------------------- |
| B-001 | Fuel and Issue logs not openable from History tab (service logs work) | Bug  | High     | Phone test, 2026-05-26 |

---

## Bugs

### B-001 — Fuel and Issue logs not openable from History tab

- **Status**: open
- **Priority**: High (regression in a core surface — discovered on 2.2.0 build awaiting review)
- **Reported**: 2026-05-26 (Hyun, phone test of 2.2.0)
- **Repro**: Open the History tab → tap a fuel log entry → nothing happens.
  Same for issue log entries. Service log entries open their detail view
  correctly.
- **Expected**: all three log types open their respective detail screens from
  the History tab, consistent with service logs.
- **Suspected scope**: row tap handler / navigation routing in the History
  list. Service rows likely route through a handler that fuel/issue rows are
  missing, or the router doesn't know about the fuel/issue detail routes from
  this entry point.
- **Likely files**: `autolog-app/app/(tabs)/timeline.js` (History tab),
  detail screens under `autolog-app/app/` for fuel / issue / service logs.
  Confirm before editing.
- **Acceptance**: tapping any fuel or issue entry in History opens the same
  detail view you'd get from the per-vehicle log list, with back nav intact.
- **Notes**: include in the first post-review patch (2.2.1 if 2.2.0 ships,
  fold into 2.2.0 if Apple kicks it back for unrelated reasons).

---

## Improvements

_None yet._

---

## Ideas / Discovery

_None yet._

---

## Recently closed

_None yet._
