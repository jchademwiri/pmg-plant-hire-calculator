### Overall approach

You have several categories of improvements (performance, accessibility/UX, code quality, DX, tests). A good plan is to tackle them in **small, independent batches**, starting with the safest/highest-impact changes.

Below is a concrete, ordered implementation plan you can follow.

---

### Phase 1 – Core calculation & state correctness

- **1.1 Extract shared calculation logic**
  - **Goal**: Avoid duplication between `EquipmentCard` and `InvoiceBreakdown`.
  - **Steps**:
    - Create a new utility or hook, e.g. `src/components/PlantHireCalculator/hooks/useEquipmentCalculations.ts` (or `utils/calculateEquipment.ts`).
    - Move shared logic for:
      - Building periods from start/end dates.
      - Counting weekday/Sat/Sun/holiday days.
      - Calculating per-period totals and invoice lines.
    - Update `EquipmentCard` and `InvoiceBreakdown` to call this shared function/hook instead of each having its own copy.
    - Manually verify outputs match before/after (same totals for a few sample inputs).

- **1.2 Fix state updates in `useEquipmentManager`**
  - **Goal**: Remove stale-closure risk and ensure reliable updates.
  - **Steps**:
    - In `useEquipmentManager`, change all `setEquipment([...equipment, ...])` / `setEquipment(equipment.filter(...))` calls to functional updates:
      - `setEquipment(prev => [...prev, newItem])`
      - `setEquipment(prev => prev.filter(...))`
      - Similar functional pattern for update functions.
    - Re-test adding/removing/updating equipment rapidly to confirm behavior.

- **1.3 Improve input parsing & validation**
  - **Goal**: Avoid `NaN` and bad coercion.
  - **Steps**:
    - Replace `parseFloat(value) || 0` with:
      - `const parsed = parseFloat(value); if (Number.isNaN(parsed)) { /* show error / skip update */ } else { ... }`.
    - Decide per-field behavior:
      - For required numeric fields: show an inline error and block submission.
      - For optional fields: allow empty (null/undefined) but not invalid strings.
    - Add basic UI feedback (small error text under invalid fields and/or red border).

---

### Phase 2 – Performance optimizations

- **2.1 Memoize holiday calculations**
  - **Goal**: Avoid recomputing SA holidays repeatedly.
  - **Steps**:
    - In your date/holiday utility file, create a cached wrapper:
      - e.g. `function getSAHolidaysByYear(year) { /* cache map[year] */ }`.
    - Internally call your existing `getSAHolidays` or refactor it to accept a year and use the cache.
    - Update `EquipmentCard`, `InvoiceBreakdown`, `DayPicker`, `QuickIdleButtons`, `useGrandTotal`, etc. to call the new memoized function.
    - Optionally, wrap with `useMemo` if the year itself is derived from props/selection.

- **2.2 Memoize derived values in components**
  - **Goal**: Reduce unnecessary recalculation and re-render work.
  - **Steps**:
    - In `EquipmentCard`, wrap expensive derived values (`totalCost`, computed periods, etc.) in `useMemo` keyed by relevant deps.
    - In `InvoiceBreakdown` and any other component that maps over large lists or does heavy math, use `useMemo` and `useCallback` where appropriate (especially for callback props passed down).
    - Verify that calculations still update correctly when inputs change.

- **2.3 Add `React.memo` to stable presentational components**
  - **Goal**: Avoid re-rendering static sections.
  - **Steps**:
    - Wrap `EmptyState`, `CalculationRules`, and `GrandTotalFooter` in `React.memo`.
    - Only do this where props are simple/stable; avoid premature optimization on highly dynamic components.

- **2.4 Simplify date comparisons**
  - **Goal**: Cleaner, more efficient date logic.
  - **Steps**:
    - Create a small helper in a date utils file, e.g. `isSameDay(a, b)` normalizing to midnight or comparing timestamps.
    - Replace repeated `getFullYear`/`getMonth`/`getDate` comparisons in `DayPicker` and `QuickIdleButtons` with this helper.

---

### Phase 3 – Accessibility and UX improvements

- **3.1 Proper labels & associations for form inputs**
  - **Goal**: Make forms screen-reader friendly and clearer visually.
  - **Steps**:
    - In `AddEquipmentForm`:
      - Add `<label htmlFor="...">Name</label>` etc. for each input.
      - Ensure each input has a unique `id` matching its label.
    - In `RatesConfig`:
      - Ensure existing labels have `htmlFor` matching input `id`s.
      - Avoid using placeholder as the only descriptor.
    - Re-check visually and with browser dev tools for accessible name.

- **3.2 Accessible and keyboard-friendly `DayPicker`**
  - **Goal**: Calendar usable via keyboard and screen readers.
  - **Steps**:
    - Add `aria-label` to day buttons, e.g. `"Mark 2026-02-10 as idle day"` or `"February 10, 2026"`.
    - Ensure the active/selected date has a visible focus outline (CSS) and maybe `aria-pressed` or `aria-current`.
    - Implement basic keyboard handling:
      - Arrow keys to move focus between days.
      - Enter/Space to toggle selection.
    - If there’s month navigation, ensure those controls are buttons with labels and keyboard support.

- **3.3 Focus management on expanding/collapsing sections**
  - **Goal**: Predictable focus when content expands.
  - **Steps**:
    - For expandable `EquipmentCard` sections:
      - Ensure the toggle control is a `<button>` with label (`aria-expanded`, `aria-controls`).
      - When expanding, optionally move focus to the first interactive element inside the expanded panel (or keep focus on the toggle but visually confirm expansion).

---

### Phase 4 – Developer experience (linting, formatting, project hygiene)

- **4.1 Add ESLint**
  - **Goal**: Enforce consistent patterns and catch bugs early.
  - **Steps**:
    - Install ESLint with React/TypeScript and Astro presets (e.g. `eslint`, `@typescript-eslint/*`, `eslint-plugin-react`, `eslint-plugin-astro` as appropriate).
    - Add an `.eslintrc` that:
      - Extends recommended configs.
      - Enables rules for hooks (`react-hooks/rules-of-hooks`), accessibility (`jsx-a11y` if using React JSX), and common pitfalls.
    - Add `npm run lint` script.
    - Fix or at least review the most important warnings first (especially any around hooks and potential bugs).

- **4.2 Add Prettier**
  - **Goal**: Automatic code formatting.
  - **Steps**:
    - Install `prettier` and, if needed, Astro/TS plugins.
    - Add `.prettierrc` and `.prettierignore`.
    - Add `npm run format` script.
    - Consider integrating with your editor’s “format on save”.

- **4.3 Optional: Git hooks**
  - **Goal**: Keep code quality consistent on commit.
  - **Steps**:
    - Add Husky or a simple pre-commit hook (if you like) to run `npm run lint` and/or `npm run format`.

---

### Phase 5 – Testing critical logic

- **5.1 Set up test framework**
  - **Goal**: Have a basic testing foundation.
  - **Steps**:
    - Add Vitest (commonly used with Vite/Astro) and configure it for TS and JSX.
    - Add `npm run test` and `npm run test:watch` scripts.

- **5.2 Unit tests for calculation & date utilities**
  - **Goal**: Lock in behavior of your most complex logic.
  - **Steps**:
    - Write tests for:
      - `getSAHolidays` / new `getSAHolidaysByYear`.
      - Extracted `calculatePeriods` / equipment summary logic.
      - Any `calculateLineTotal` or grand-total logic.
    - Use a few representative scenarios:
      - Cross-month ranges.
      - Ranges including weekends and holidays.
      - Edge cases (single-day hires, zero days, invalid inputs filtered out).

- **5.3 Component tests for main flows (optional but valuable)**
  - **Goal**: Ensure the overall calculator behaves correctly.
  - **Steps**:
    - Write a small number of tests for:
      - Adding equipment and seeing totals update.
      - Marking idle days and watching cost adjustments.
      - Changing rates and verifying recalculated totals.

---

### Suggested execution order

1. **Phase 1 and 2 (correctness + performance)** – they share code areas and are relatively low-risk.
2. **Phase 3 (accessibility/UX)** – improves user-facing quality without deep architectural changes.
3. **Phase 4 (DX)** – add ESLint/Prettier once core improvements are in place, then refactor with auto-fixes.
4. **Phase 5 (tests)** – once logic is centralized and stable, lock it in with tests.

If you tell me which phase you want to start with (e.g. “performance” or “accessibility”), I can then draft concrete code changes and file-by-file steps for that part.