# Counter — Progressive Product Specification

**Document type:** Functional product specification  
**Milestones:** V1 — Basic Counter · V2 — Bounded Counter · V3 — Configurable Counter  
**Purpose:** Define three successive, independently demonstrable versions of the same counter product. Each milestone adds requirements while retaining all previously accepted behavior.  
**Audience:** Developers, testers, and reviewers.

## How to use this specification

Complete and verify each milestone before proceeding to the next. A milestone is finished only when its acceptance criteria and relevant edge cases are satisfied. Unless a later milestone explicitly changes a rule, earlier requirements remain in effect.

This document describes **what the product must do**, not how to implement it. It intentionally does not define component structures, state-management techniques, file organization, algorithms, libraries, or code.

---

# Milestone 1 — V1: Basic Counter

## Product goal

Provide a minimal interactive counter that allows a person to increase or decrease a displayed whole number.

## User-facing requirements

1. The page prominently displays the current counter value.
2. The counter starts at **0** on a fresh page load.
3. An **Increment (+)** control increases the value by exactly **1** per activation.
4. A **Decrement (−)** control decreases the value by exactly **1** per activation.
5. The displayed value immediately reflects the latest completed action.
6. The counter can move above or below zero; there are **no minimum or maximum limits** in this milestone.
7. The two controls remain identifiable and usable with a keyboard, and the current value is readable as text.

## Acceptance scenarios

- Given a fresh page load, the displayed value is **0**.
- Given a value of **0**, when Increment is activated once, the displayed value becomes **1**.
- Given a value of **1**, when Decrement is activated once, the displayed value becomes **0**.
- Given a value of **0**, when Decrement is activated twice, the displayed value becomes **−2**.
- Given any value, repeated activations change it by one per activation without skipped or duplicated updates.

## Explicitly out of scope

Limits, Reset, progress, status messages, configurable inputs, input validation, operation history, Undo, statistics, and remembering values across reloads.

---

# Milestone 2 — V2: Bounded Counter and Visual Feedback

## Product goal

Extend the counter with fixed operating boundaries and feedback that helps a person understand their position within the permitted range.

## Rules and user-facing requirements

### A. Fixed counter settings

1. The minimum permitted value is **0**.
2. The maximum permitted value is **10**.
3. The starting and reset value is **0**.
4. Increment and Decrement continue to change the count by exactly **1**, provided the result remains within the permitted range.
5. The counter never displays a value below **0** or above **10**.

### B. Available actions

1. **Increment (+)** is unavailable when the value is **10**.
2. **Decrement (−)** is unavailable when the value is **0**.
3. A new **Reset** control restores the value to **0**.
4. Reset is unavailable when the value is already **0**.
5. Unavailable controls must be visibly disabled and must not change the counter when activated.

### C. Status feedback

Display one of four mutually exclusive statuses, based on the current counter value:

| Status | Condition | User-facing meaning |
| --- | --- | --- |
| At minimum | Value is **0** | The lower boundary has been reached. |
| Normal | Value is **1–7** | The value is within the ordinary operating range. |
| Near limit | Value is **8–9** | The value has reached at least **80%** of the range but is not at its maximum. |
| At maximum | Value is **10** | The upper boundary has been reached. |

The current status must be clearly communicated in the interface. Boundary states should also be identifiable from the relevant disabled controls.

### D. Progress and remaining actions

1. Display progress from **0%** at value 0 to **100%** at value 10.
2. Progress changes proportionally as the value changes.
3. Show a visual progress indicator and a readable percentage.
4. Display how many successful increments remain before the maximum is reached. At value 8, for example, the display reads **2 increments remaining**.
5. Use singular wording when exactly one increment remains.
6. Progress and remaining increments update immediately after increment, decrement, or reset.

## Acceptance scenarios

- At **0**, Decrement and Reset are disabled; status is **At minimum**; progress is **0%**; **10 increments** remain.
- At **7**, status is **Normal**; progress is **70%**; **3 increments** remain.
- At **8**, status changes to **Near limit**; progress is **80%**; **2 increments** remain.
- At **10**, Increment is disabled; status is **At maximum**; progress is **100%**; **0 increments** remain.
- At **10**, activating Reset changes the value to **0**, restores the minimum status, and updates all visual feedback.
- No action ever causes the displayed value to exceed the permitted range.

## Explicitly out of scope

User-editable boundaries or step size, validation, history, Undo, statistics, and persistence between page loads.

---

# Milestone 3 — V3: Configurable Counter, Validation, History, Undo, and Persistence

## Product goal

Turn the bounded counter into a configurable, auditable tool. A person can define the counting range and step size, receive immediate validation, reverse eligible actions, inspect recent activity, and return to their saved counter later.

V3 retains V2's counter, status, progress, remaining-increments display, and Reset controls. Its configuration values replace V2's fixed settings.

## A. Configuration settings

Provide three clearly labeled, editable numeric fields:

| Field | Default | Meaning |
| --- | ---: | --- |
| Minimum | **0** | Lowest permitted counter value. |
| Maximum | **10** | Highest permitted counter value. |
| Step | **1** | Exact amount added or subtracted by each successful increment or decrement. |

1. Users may edit each field independently.
2. Inputs permit temporary intermediate states during editing, including an empty field, without crashing the page or silently replacing what the user typed.
3. A configuration becomes **applied** as soon as all three input values form a valid configuration.
4. While the current input draft is invalid, the **last valid applied configuration** remains the basis for displayed count, status, progress, and range calculations.
5. The interface must clearly indicate that an invalid draft has not been applied.

## B. Validation rules

Validation feedback appears beside the relevant field whenever its current value is invalid.

**Minimum**
- Required.
- Must be a whole number, including negative whole numbers.
- Must be strictly smaller than Maximum.

**Maximum**
- Required.
- Must be a whole number, including negative whole numbers.
- Must be strictly greater than Minimum.

**Step**
- Required.
- Must be a positive whole number.
- Must not exceed the distance from Minimum to Maximum.

Additional behavior:

1. Values must be within the supported safe whole-number range; values that cannot be represented safely are invalid.
2. Empty, fractional, and otherwise invalid numeric entries are rejected with comprehensible field-level messages.
3. Validation reflects dependencies across fields; changing one field may invalidate another.
4. An invalid draft makes Increment, Decrement, Reset, and Undo unavailable until all fields are valid.
5. Invalid entries remain visible and editable so the user can correct them.
6. Display an overall warning when the current configuration draft is invalid.

## C. Applied configuration and boundaries

1. As soon as the draft is valid, its Minimum, Maximum, and Step become the applied configuration.
2. The counter is always kept within the **applied** range.
3. If an applied change makes the current count lower than Minimum, the count becomes Minimum.
4. If an applied change makes the current count higher than Maximum, the count becomes Maximum.
5. If the current count is still inside the new range, it stays unchanged.
6. A valid change to **any** applied configuration setting (Minimum, Maximum, or Step) clears the available Undo sequence, whether or not the count changes.
7. An invalid draft never changes the applied settings or clamps the count.

## D. Counter actions

1. **Increment** adds exactly Step, only when the complete resulting value would be at or below Maximum.
2. **Decrement** subtracts exactly Step, only when the complete resulting value would be at or above Minimum.
3. No partial increments or decrements are allowed to reach a boundary.
4. An unavailable action is visibly disabled and causes no change or history entry.
5. **Reset** returns the count to **0** if zero is within the applied range; otherwise, it returns to the nearest boundary to zero.
6. Reset is disabled when the count already equals that reset target.
7. Each successful action immediately updates the value and all related visual feedback.

Examples:

- Minimum **0**, Maximum **10**, Step **3**, Count **9**: Increment is disabled, because a full increment would result in 12.
- Minimum **−5**, Maximum **5**, Count **2**: Reset sets the value to **0**.
- Minimum **4**, Maximum **10**, Count **8**: Reset sets the value to **4**.
- Minimum **−10**, Maximum **−2**, Count **−6**: Reset sets the value to **−2**.

## E. Status, progress, and remaining increments

Use the **applied** configuration for all calculations, including while an invalid draft is being edited.

1. Status is **At minimum** when Count equals Minimum.
2. Status is **At maximum** when Count equals Maximum.
3. Otherwise, status is **Near limit** once progress is at least **80%**, or **Normal** below that threshold.
4. Progress is **0%** at Minimum, **100%** at Maximum, and proportional between those endpoints.
5. Remaining increments means the number of **full Step-sized increments** that can still succeed before another increment is disallowed; do not count an incomplete step.
6. Status, percentage, and remaining increments must adapt correctly to negative ranges and non-unit steps.

Example: With Minimum 0, Maximum 10, Step 3, Count 3, progress is **30%** and **2 full increments** remain (to 6 and 9).

## F. Activity history

Record every successful count-changing event as an activity entry containing:

- A unique identifier.
- The type of event.
- The count immediately before the event.
- The count immediately after the event.
- The time the event occurred.

Supported event types:

- Increment
- Decrement
- Reset
- Undo
- Configuration adjustment

Behavior:

1. Show the **10 most recent** entries in reverse chronological order (newest first).
2. Keep older entries as part of the session's complete activity history; the visible 10-entry limit is a display limit only.
3. Display the event type, the before-and-after values, and a readable timestamp.
4. Record a **configuration adjustment** only when applying new valid settings actually changes the count by clamping it.
5. Record an **Undo** when it changes the count.
6. Do not record disabled actions or actions that do not change the count.
7. If more than 10 entries exist, indicate that only the latest 10 are currently displayed.
8. If no entries exist, show a clear empty-history message.

## G. Undo

1. Users can undo the most recent eligible counter action: Increment, Decrement, or Reset.
2. Multiple eligible actions may be undone sequentially, most recent first.
3. Each Undo restores the count to its value before the undone action.
4. Undo does not itself become an undoable action.
5. Undo generates an activity entry recording the value change, but does **not** restore or delete older activity-log entries.
6. Undo is disabled when no eligible actions remain.
7. An applied configuration change clears the Undo sequence, even when no clamping occurs.
8. Undo must never restore a value outside the currently applied range.
9. New counter actions after an Undo do not offer a Redo feature.
10. The Undo sequence is available only during the current page session and does not survive reloads.

## H. Statistics

Display three statistics:

| Statistic | Definition |
| --- | --- |
| Increments | Number of recorded successful Increment events. |
| Decrements | Number of recorded successful Decrement events. |
| Total changes | Sum of recorded successful Increment, Decrement, and Reset events. |

1. Statistics use the **complete** activity history, not just the 10 visible entries.
2. Undo and Configuration adjustment events do not add to these statistics.
3. Undo does not subtract previously counted events; statistics summarize recorded activity, not the net movement of the counter.
4. Statistics refresh whenever relevant activity is recorded or restored.

## I. Persistence across reloads

Remember the following across page reloads in the same browser:

- Current counter value.
- Last valid applied Minimum, Maximum, and Step.
- Complete activity history.

Behavior:

1. On first use with no saved data, start with Count **0**, Minimum **0**, Maximum **10**, Step **1**, and empty history.
2. On returning, restore the saved count, applied configuration, and history.
3. After reload, configuration input fields reflect the last valid applied configuration, **not** incomplete or invalid drafts.
4. Do not restore the Undo sequence after reload.
5. If saved configuration is missing or invalid, use the default configuration.
6. If the saved count is missing or invalid, use the initial count, adjusted to the restored valid range.
7. If a saved count lies outside the restored valid range, adjust it to the nearest boundary.
8. If saved history is missing, use empty history. Invalid entries must not crash the page.
9. If saved information is corrupted, incomplete, or cannot be accessed, the product remains usable and falls back safely.
10. Only valid applied configuration values are saved; incomplete drafts are not persisted.

## J. Interface and accessibility

Keep a cohesive, responsive interface with four distinguishable sections:

1. **Counter:** Current value, status, progress bar, remaining full increments, Increment, Decrement, Reset, and Undo.
2. **Configuration:** Minimum, Maximum, and Step inputs, individual validation errors, and an overall invalid-configuration warning.
3. **Statistics:** Increment count, Decrement count, and Total changes.
4. **History:** Recent operation list, timestamps, and an empty state.

The product must also:

- Make unavailable controls clearly distinguishable from available ones.
- Keep controls keyboard-accessible with readable labels.
- Associate validation errors with their respective input fields.
- Communicate progress and status using text as well as visuals.
- Keep the interface usable on both narrow and wide screens.

## K. Milestone 3 acceptance scenarios

**Configuration and validation**

- Given default settings, editing Maximum from **10** to **5** while Count is **8** results in applied Maximum **5**, Count **5**, a Configuration adjustment history entry, and cleared Undo availability.
- Given default settings, clearing the Maximum field shows a required-field error; the previously applied Maximum remains **10** and counter-changing controls are disabled until the draft is valid.
- Given Minimum **0** and Maximum **10**, entering Step **11** shows an error and does not apply that step.
- Given a valid Step change from **1** to **2**, Undo availability is cleared even if the Count stays the same.
- Given Minimum **5** and Maximum **5**, the configuration is invalid until the range becomes nonempty.

**Counter and derived feedback**

- Given Minimum **0**, Maximum **10**, Step **3**, Count **9**, Increment is disabled; progress is **90%**; there are **0 full increments** remaining.
- Given Minimum **−5**, Maximum **5**, Step **2**, Count **−5**, progress is **0%** and **5 full increments** remain.
- Given Minimum **4**, Maximum **10**, Count **8**, Reset changes Count to **4**.
- Given Count at the Maximum boundary, status reads **At maximum**, progress reads **100%**, and Increment is unavailable.

**History, Undo, and statistics**

- Starting from Count **0**, Increment twice produces two Increment entries and Increment statistic **2**.
- Undo once restores Count **1**, records an Undo event, and leaves Increment statistic **2**.
- After all eligible actions are undone, Undo becomes unavailable.
- When more than 10 changes have been recorded, the interface shows only the latest 10 but statistics still count all qualifying entries.
- Applying a valid configuration that clamps Count records exactly one Configuration adjustment; applying settings that leave Count unchanged records none.

**Persistence**

- After changing the configuration, performing operations, and refreshing, the count, valid configuration, and complete activity history are restored.
- After refreshing, Undo is unavailable until a new eligible action occurs.
- After typing an invalid draft and refreshing, the inputs show the last **valid** configuration.
- Corrupted saved information never prevents the counter from becoming usable.

---

# Milestone completion checklist

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

**Completion standard:** Each version can be demonstrated independently and meets every acceptance scenario for its milestone. V3 preserves all applicable V1 and V2 behavior, except where configurable settings explicitly supersede fixed defaults.

**End of specification.**
