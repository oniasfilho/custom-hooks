# Counter

An interactive counter built in three successive milestones. Each version can be demonstrated on its own and keeps all previously accepted behavior unless a later milestone explicitly changes a rule.

The full requirements, rules, and acceptance scenarios live in [counter-product-spec.md](counter-product-spec.md). That document is the source of truth; this README is a summary.

## Milestones

Complete and verify each milestone before starting the next. A milestone is done only when all of its acceptance scenarios and edge cases pass.

### V1 — Basic Counter

A minimal counter that displays a whole number.

- Starts at **0** on a fresh page load.
- **Increment (+)** and **Decrement (−)** change the value by exactly 1.
- No limits: the value can go above or below zero.
- Controls work with a keyboard and the value is readable as text.

### V2 — Bounded Counter and Visual Feedback

Adds fixed boundaries and feedback about where the value sits within the range.

- The range is fixed at **0–10**, and the counter starts at **0**.
- Increment is disabled at 10 and Decrement is disabled at 0.
- A **Reset** control returns the value to 0 and is disabled when the value is already 0.
- A status shows one of **At minimum** (0), **Normal** (1–7), **Near limit** (8–9), or **At maximum** (10).
- A progress bar with a percentage, plus a count of increments remaining before the maximum ("1 increment" / "2 increments").

### V3 — Configurable Counter

Lets people set the range and step size, and adds validation, history, Undo, statistics, and persistence.

- **Configuration:** editable Minimum (default 0), Maximum (default 10), and Step (default 1). A draft is applied as soon as all three values are valid. While the draft is invalid, the last valid configuration stays in effect and the counter controls are disabled.
- **Validation:** every field is required and must be a safe whole number. Minimum must be below Maximum, and Step must be positive and no larger than the range. Errors appear beside the field they belong to, and an overall warning shows while the draft is invalid.
- **Boundaries:** the count is clamped into any newly applied range. Any applied configuration change clears Undo.
- **Actions:** Increment and Decrement move by a full Step only, with no partial steps to reach a boundary. Reset goes to 0 if 0 is in range, or otherwise to the boundary nearest 0.
- **Feedback:** status, progress, and remaining full increments are calculated from the applied configuration and handle negative ranges and non-unit steps.
- **History:** every count-changing event (Increment, Decrement, Reset, Undo, Configuration adjustment) is recorded with its before and after values and a timestamp. The 10 most recent are shown newest first, and the full history is kept.
- **Undo:** steps back through Increment, Decrement, and Reset actions one at a time. Undo cannot itself be undone, there is no Redo, and the Undo sequence does not survive a reload.
- **Statistics:** Increments, Decrements, and Total changes, counted over the full history. Undo does not subtract from them.
- **Persistence:** the count, the last valid configuration, and the full history survive reloads. Missing or corrupted saved data falls back safely to defaults.
- **Layout:** four sections (Counter, Configuration, Statistics, History) that are responsive and keyboard accessible.

## Capability checklist

| Capability | V1 | V2 | V3 |
| --- | :---: | :---: | :---: |
| Display current count | ✓ | ✓ | ✓ |
| Increment and decrement | ✓ | ✓ | ✓ |
| Counter boundaries | — | Fixed | Configurable |
| Reset | — | ✓ | ✓ |
| Progress, status, and remaining increments | — | ✓ | ✓ |
| Editable minimum, maximum, and step | — | — | ✓ |
| Input validation and applied/draft distinction | — | — | ✓ |
| Activity history | — | — | ✓ |
| Undo | — | — | ✓ |
| Operation statistics | — | — | ✓ |
| Persistence across reloads | — | — | ✓ |

## Tech stack

- [React](https://react.dev) 19 with TypeScript
- [Vite](https://vite.dev) for the dev server and build
- [Oxlint](https://oxc.rs) for linting

## Getting started

```sh
npm install
npm run dev
```

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reloading. |
| `npm run build` | Type-check and build for production. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run Oxlint. |
