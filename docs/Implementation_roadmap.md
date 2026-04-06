# Plant Hire Calculator — Implementation Roadmap
**Stack:** Next.js 16 · React 19 · Tailwind CSS v4 · TypeScript · Biome  
**Feature path:** `src/features/plant-hire-calculator/`  
**Rule:** Zero changes to calculation logic in `utils/calculations.ts` — all business rules stay intact.

---

## Codebase Audit (Current State vs Previous Astro Project)

### ✅ What migrated ********cor**re**ct**ly**
- All component logic is identical to the Astro version
- Folder renamed from `src/components/PlantHireCalculator/` → `src/features/plant-hire-calculator/` (good convention)
- `'use client'` directive correctly placed at top of `index.tsx`
- `page.tsx` correctly imports from `@/features/plant-hire-calculator`
- Tailwind v4 via `@tailwindcss/postcss` — correct, no `tailwind.config.ts` needed
- Biome replaces ESLint/Prettier — already configured in `biome.json`
- Next.js 16.2.2 with React 19.2.4

### ⚠️ Things to address (non-breaking, covered in phases below)
1. **No localStorage persistence** — data lost on refresh (high priority)
2. **No VAT display** — SA invoices typically show 15% VAT
3. **No invoice metadata** — no client name, invoice number, PO reference
4. **`useEquipmentManager` uses stale closure pattern** — `setEquipment([...equipment])` instead of `setEquipment(prev => ...)`
5. **`bg-linear-to-br` / `bg-linear-to-r`** — these are Tailwind v4 syntax, correct, but verify they render (v3 used `bg-gradient-to-br`)
6. **No print/export** — you're probably screenshotting or copy-pasting
7. **No "New Month" workflow** — have to manually clear idle days each month
8. **No duplicate equipment** — can't copy a machine with same rates
9. **`easterSunday` variable declared but never used** in `calculations.ts` (minor lint warning)

---

## Phase Overview

| Phase | Feature | Effort | Ships as |
|-------|---------|--------|----------|
| 1 | localStorage persistence + state fix | ~30 min | Complete feature |
| 2 | VAT toggle (15%) | ~20 min | Complete feature |
| 3 | Invoice metadata (client, invoice no, PO) | ~30 min | Complete feature |
| 4 | Duplicate equipment + New Month workflow | ~25 min | Complete feature |
| 5 | Print / PDF-ready invoice view | ~45 min | Complete feature |

### Progress Status (Current Implementation)

- ✅ **Phase 1 completed**
- ✅ **Phase 2 completed**
- ✅ **Phase 3 completed**
- ✅ **Phase 4 completed**
- ⏳ **Phase 5 not started**

---

## Phase 1 — localStorage Persistence + State Fix

### What this does
Right now every page refresh wipes your entire setup — all equipment, rates, and idle days are gone. This phase makes the app remember everything automatically. You'll also see an "Auto-saved" indicator so you know it's working. The state fix prevents a rare bug where rapid updates could produce stale data.

### Files to change
- `src/features/plant-hire-calculator/hooks/useEquipmentManager.ts` — full replacement
- `src/features/plant-hire-calculator/index.tsx` — add month persistence + auto-save indicator

### No changes to
- `utils/calculations.ts` ✅
- Any component files ✅

---

### Step 1.1 — Replace `useEquipmentManager.ts`

**Cursor prompt:**
```
Replace the entire contents of src/features/plant-hire-calculator/hooks/useEquipmentManager.ts with the following. Do not modify any other files.
```

```typescript
import { useState, useEffect } from 'react';
import type { Equipment, Rates } from '../types';
import { calculateRates } from '../utils/calculations';

const STORAGE_KEY = 'phc-equipment-v1';

const defaultEquipment = (): Equipment[] => [
  {
    id: '1',
    name: 'Dropside',
    rates: calculateRates(5200),
    idleDays: [],
  },
];

const loadFromStorage = (): Equipment[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultEquipment();
    const parsed = JSON.parse(raw) as Equipment[];
    // Rehydrate Date objects — JSON.parse gives strings, not Dates
    return parsed.map((item) => ({
      ...item,
      idleDays: (item.idleDays || []).map((d) => new Date(d as unknown as string)),
    }));
  } catch {
    return defaultEquipment();
  }
};

const saveToStorage = (equipment: Equipment[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(equipment));
  } catch {
    // Storage unavailable (private browsing, quota exceeded) — fail silently
  }
};

export const useEquipmentManager = () => {
  const [equipment, setEquipment] = useState<Equipment[]>(() => loadFromStorage());

  // Auto-save on every change
  useEffect(() => {
    saveToStorage(equipment);
  }, [equipment]);

  const addEquipment = (name: string, rate: string) => {
    if (!name.trim() || !rate) return;
    const baseRate = parseFloat(rate);
    if (isNaN(baseRate) || baseRate <= 0) return;

    const newItem: Equipment = {
      id: Date.now().toString(),
      name: name.trim(),
      rates: calculateRates(baseRate),
      idleDays: [],
    };
    // Functional update — avoids stale closure bug
    setEquipment((prev) => [...prev, newItem]);
  };

  const removeEquipment = (id: string) => {
    setEquipment((prev) => prev.filter((item) => item.id !== id));
  };

  const duplicateEquipment = (id: string) => {
    setEquipment((prev) => {
      const source = prev.find((item) => item.id === id);
      if (!source) return prev;
      const copy: Equipment = {
        ...source,
        id: Date.now().toString(),
        name: `${source.name} (Copy)`,
        idleDays: [], // Start fresh — rates carry over, idle days do not
      };
      const idx = prev.findIndex((item) => item.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  const updateIdleDays = (id: string, days: Date[]) => {
    setEquipment((prev) =>
      prev.map((item) => (item.id === id ? { ...item, idleDays: days } : item))
    );
  };

  const updateRates = (id: string, newRates: Rates) => {
    setEquipment((prev) =>
      prev.map((item) => (item.id === id ? { ...item, rates: newRates } : item))
    );
  };

  // Clears only the idle days belonging to a specific month, across all equipment
  const clearMonthIdleDays = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    setEquipment((prev) =>
      prev.map((item) => ({
        ...item,
        idleDays: item.idleDays.filter(
          (d) => !(d.getFullYear() === year && d.getMonth() === monthIndex)
        ),
      }))
    );
  };

  return {
    equipment,
    addEquipment,
    removeEquipment,
    duplicateEquipment,
    updateIdleDays,
    updateRates,
    clearMonthIdleDays,
  };
};
```

---

### Step 1.2 — Update `index.tsx` to persist month + show auto-save indicator

**Cursor prompt:**
```
In src/features/plant-hire-calculator/index.tsx, make the following changes only:

1. Add two new imports at the top (after existing imports):
   import { useEffect } from 'react';

2. Change the useState for currentMonth to lazy-load from localStorage:
   Replace:  const [currentMonth, setCurrentMonth] = useState(new Date());
   With:
   const [currentMonth, setCurrentMonth] = useState<Date>(() => {
     try {
       const saved = localStorage.getItem('phc-month-v1');
       if (saved) { const d = new Date(saved); if (!isNaN(d.getTime())) return d; }
     } catch { /* ignore */ }
     return new Date();
   });

3. Add a useEffect after the useState declarations to persist the month:
   useEffect(() => {
     try { localStorage.setItem('phc-month-v1', currentMonth.toISOString()); } catch { /* ignore */ }
   }, [currentMonth]);

4. Add destructuring for the new hook methods:
   Replace:  const { equipment, addEquipment, removeEquipment, updateIdleDays, updateRates } = useEquipmentManager();
   With:     const { equipment, addEquipment, removeEquipment, duplicateEquipment, updateIdleDays, updateRates, clearMonthIdleDays } = useEquipmentManager();

5. In the header section, change the subtitle paragraph to:
   <p className="text-slate-500 font-medium text-sm">
     Strict period discounting · South Africa
     <span className="ml-3 inline-flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
       Auto-saved
     </span>
   </p>

Do not change anything else.
```

---

### ✅ Ship checkpoint
Run `bun dev`. Refresh the page — your equipment, rates, and idle days should survive. The green "Auto-saved" pulse should be visible in the header.

### Implementation notes (actual)

- Added hydration-safe localStorage loading (load persisted values in `useEffect` after mount).
- Added guarded persistence writes so defaults do not overwrite saved data on first render.
- `useEquipmentManager` includes functional updates and localStorage persistence.

---

## Phase 2 — VAT Toggle (15%)

### What this does
South African VAT is 15%. Municipal invoices need to show the VAT amount and total inclusive of VAT. This adds a toggle button in the footer that switches between ex-VAT and incl-VAT display. When toggled on, it shows a breakdown row (sub-total / VAT / total). The state is not persisted — it defaults off each session since whether to include VAT depends on the specific submission.

### Files to change
- `src/features/plant-hire-calculator/components/GrandTotalFooter.tsx` — full replacement
- `src/features/plant-hire-calculator/components/index.ts` — no change needed
- `src/features/plant-hire-calculator/index.tsx` — add two props to `GrandTotalFooter`

---

### Step 2.1 — Replace `GrandTotalFooter.tsx`

**Cursor prompt:**
```
Replace the entire contents of src/features/plant-hire-calculator/components/GrandTotalFooter.tsx with the following:
```

```typescript
'use client';

import React, { useState } from 'react';
import { Info, ToggleLeft, ToggleRight, ChevronUp, ChevronDown } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

const VAT_RATE = 0.15;

interface GrandTotalFooterProps {
  total: number;
  equipmentCount: number;
  currentMonth: Date;
}

export const GrandTotalFooter: React.FC<GrandTotalFooterProps> = ({
  total,
  equipmentCount,
  currentMonth,
}) => {
  const [vatEnabled, setVatEnabled] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const vatAmount = vatEnabled ? total * VAT_RATE : 0;
  const totalIncVat = total + vatAmount;

  const monthLabel = currentMonth.toLocaleDateString('en-ZA', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="sticky bottom-4 z-10">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700">

        {/* VAT breakdown panel — only shown when VAT is on and user expands */}
        {vatEnabled && showBreakdown && (
          <div className="px-6 pt-4 pb-3 border-b border-slate-700 grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Sub-total (excl. VAT)</div>
              <div className="font-semibold">{formatCurrency(total)}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">VAT (15%)</div>
              <div className="font-semibold text-amber-400">{formatCurrency(vatAmount)}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Total (incl. VAT)</div>
              <div className="font-bold text-emerald-400 text-lg">{formatCurrency(totalIncVat)}</div>
            </div>
          </div>
        )}

        {/* Main footer row */}
        <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left side */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="p-2.5 bg-emerald-500 rounded-lg text-emerald-950 shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">{monthLabel}</h3>
              <p className="text-slate-400 text-xs">
                {equipmentCount} machine{equipmentCount !== 1 ? 's' : ''} calculated
              </p>
            </div>

            {/* VAT toggle button */}
            <button
              onClick={() => setVatEnabled((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                vatEnabled
                  ? 'bg-amber-500 text-amber-950 border-amber-400 hover:bg-amber-400'
                  : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
              }`}
              title="Toggle 15% VAT"
            >
              {vatEnabled
                ? <ToggleRight className="w-3.5 h-3.5" />
                : <ToggleLeft className="w-3.5 h-3.5" />}
              VAT 15%
            </button>

            {/* Breakdown toggle — only shown when VAT is on */}
            {vatEnabled && (
              <button
                onClick={() => setShowBreakdown((v) => !v)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showBreakdown
                  ? <ChevronDown className="w-3 h-3" />
                  : <ChevronUp className="w-3 h-3" />}
                {showBreakdown ? 'Hide' : 'Show'} breakdown
              </button>
            )}
          </div>

          {/* Right side — the big number */}
          <div className="text-right">
            <div className="text-3xl font-extrabold text-emerald-400">
              {formatCurrency(vatEnabled ? totalIncVat : total)}
            </div>
            {vatEnabled && (
              <div className="text-xs text-amber-400 mt-0.5">incl. VAT</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

### Step 2.2 — Update `index.tsx` to pass `currentMonth` to footer

**Cursor prompt:**
```
In src/features/plant-hire-calculator/index.tsx, find the GrandTotalFooter usage and add the currentMonth prop:

Replace:
  <GrandTotalFooter 
    total={grandTotal}
    equipmentCount={equipment.length}
  />

With:
  <GrandTotalFooter 
    total={grandTotal}
    equipmentCount={equipment.length}
    currentMonth={currentMonth}
  />
```

---

### ✅ Ship checkpoint
The footer now shows the month name. Click "VAT 15%" — it toggles amber and shows the inclusive total. Click "Show breakdown" to see the three-column split.

### Implementation notes (actual)

- VAT layout was refined for space efficiency:
  - breakdown now shows compactly in the footer (sub-total excl. VAT + VAT amount),
  - inclusive total remains the large main number in the footer.
- VAT toggle state is now persisted in localStorage (`phc-vat-v1`).
- VAT state was lifted to `index.tsx` and passed into `GrandTotalFooter` as props.

---

## UX Refinements Implemented (Beyond Original Phases)

- `RatesConfig` was moved out of each equipment card to reduce vertical clutter.
- A header-level `Configure Rates` button now opens a compact overlay panel.
- Active equipment for rate editing is explicit:
  - selecting/clicking a card sets it as active,
  - active card is highlighted and shows an "Editing rates" badge.
- Spacing in the top layout was tightened so key information remains visible with less scrolling.

---

## Phase 3 — Invoice Metadata (Client, Invoice Number, PO Reference)

### What this does
Adds a thin input bar above the equipment cards for: Client / Municipality name, Invoice Number (e.g. INV-2025-047), and PO / Reference Number. These fields are optional — the calculator works fine without them. The values are persisted to localStorage and will pre-populate the print view in Phase 5. They're stored separately from equipment so clearing one doesn't affect the other.

### Files to add
- `src/features/plant-hire-calculator/components/InvoiceHeader.tsx` — new file

### Files to change
- `src/features/plant-hire-calculator/components/index.ts` — add export
- `src/features/plant-hire-calculator/index.tsx` — add state + render component

---

### Step 3.1 — Create `InvoiceHeader.tsx`

**Cursor prompt:**
```
Create a new file at src/features/plant-hire-calculator/components/InvoiceHeader.tsx with the following content:
```

```typescript
import React from 'react';
import { FileText } from 'lucide-react';

export interface InvoiceMeta {
  clientName: string;
  invoiceNumber: string;
  poReference: string;
}

interface InvoiceHeaderProps {
  meta: InvoiceMeta;
  onChange: (meta: InvoiceMeta) => void;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ meta, onChange }) => {
  const update = (field: keyof InvoiceMeta, value: string) => {
    onChange({ ...meta, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl px-5 py-4 shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-3.5 h-3.5 text-emerald-600" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice Details</span>
        <span className="text-[10px] text-slate-400">(optional · appears on printed invoice)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Client / Municipality
          </label>
          <input
            type="text"
            placeholder="e.g. City of Tshwane"
            value={meta.clientName}
            onChange={(e) => update('clientName', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Invoice Number
          </label>
          <input
            type="text"
            placeholder="e.g. INV-2025-047"
            value={meta.invoiceNumber}
            onChange={(e) => update('invoiceNumber', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
            PO / Reference
          </label>
          <input
            type="text"
            placeholder="e.g. PO-0042-TW"
            value={meta.poReference}
            onChange={(e) => update('poReference', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
      </div>
    </div>
  );
};
```

---

### Step 3.2 — Export from `components/index.ts`

**Cursor prompt:**
```
In src/features/plant-hire-calculator/components/index.ts, add this line at the end:

export { InvoiceHeader } from './InvoiceHeader';
export type { InvoiceMeta } from './InvoiceHeader';
```

---

### Step 3.3 — Wire into `index.tsx`

**Cursor prompt:**
```
In src/features/plant-hire-calculator/index.tsx, make these changes:

1. Add InvoiceHeader and InvoiceMeta to the components import:
   import { EquipmentCard, AddEquipmentForm, GrandTotalFooter, EmptyState, CalculationRules, InvoiceHeader } from './components';
   import type { InvoiceMeta } from './components';

2. Add this constant above the component function (outside it):
   const META_KEY = 'phc-invoice-meta-v1';
   const loadMeta = (): InvoiceMeta => {
     try {
       const raw = localStorage.getItem(META_KEY);
       return raw ? JSON.parse(raw) : { clientName: '', invoiceNumber: '', poReference: '' };
     } catch {
       return { clientName: '', invoiceNumber: '', poReference: '' };
     }
   };

3. Inside the component, add this state after the existing useState declarations:
   const [invoiceMeta, setInvoiceMeta] = useState<InvoiceMeta>(() => loadMeta());

4. Add this useEffect after the existing useEffects (or after the month useEffect added in Phase 1):
   useEffect(() => {
     try { localStorage.setItem(META_KEY, JSON.stringify(invoiceMeta)); } catch { /* ignore */ }
   }, [invoiceMeta]);

5. In the JSX, add the InvoiceHeader component between the page header div and the AddEquipmentForm:
   <InvoiceHeader meta={invoiceMeta} onChange={setInvoiceMeta} />
```

---

### ✅ Ship checkpoint
Three input fields appear below the page heading. Type a client name — refresh the page. It should still be there.

---

## Phase 4 — Duplicate Equipment + New Month Workflow

### What this does

**Duplicate:** A copy icon on each equipment card creates an identical machine directly below it — same rates, no idle days. Saves time when you have multiple machines of the same type at the same rate.

**New Month:** A button in the footer that clears idle days for the current month across all equipment, then advances the month. Equipment and rates are untouched. The button shows the actual next month name (e.g. `→ May 2026`) so you know what you're advancing to. This replaces the tedious process of manually un-ticking every idle day at month-end.

### Files to change
- `src/features/plant-hire-calculator/components/EquipmentCard.tsx` — add `onDuplicate` prop + Copy button
- `src/features/plant-hire-calculator/components/GrandTotalFooter.tsx` — add New Month button
- `src/features/plant-hire-calculator/index.tsx` — wire up both

> Note: `duplicateEquipment` and `clearMonthIdleDays` were already added to `useEquipmentManager` in Phase 1, so the hook needs no changes.

---

### Step 4.1 — Add duplicate button to `EquipmentCard.tsx`

**Cursor prompt:**
```
In src/features/plant-hire-calculator/components/EquipmentCard.tsx, make these changes only:

1. Add Copy to the lucide-react import:
   import { Calculator, Trash2, ChevronDown, ChevronUp, AlertCircle, Copy } from 'lucide-react';

2. Add onDuplicate to the EquipmentCardProps interface:
   onDuplicate: () => void;

3. Add onDuplicate to the destructured props:
   { item, currentMonth, onRemove, onDuplicate, onUpdateIdleDays, onUpdateRates, onMonthChange }

4. In the header action buttons (the div containing the Trash2 button), add a Copy button immediately before the Trash2 button:
   <button
     onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
     className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
     title="Duplicate equipment (same rates, no idle days)"
   >
     <Copy className="w-4 h-4" />
   </button>

Do not change any calculation logic or other parts of the component.
```

---

### Step 4.2 — Add New Month button to `GrandTotalFooter.tsx`

**Cursor prompt:**
```
In src/features/plant-hire-calculator/components/GrandTotalFooter.tsx, make these changes:

1. Add CalendarPlus to the lucide-react import.

2. Add two new props to the GrandTotalFooterProps interface:
   onNewMonth: () => void;
   nextMonthLabel: string;

3. Destructure both new props in the component function signature.

4. In the JSX, after the closing tag of the "Right side — the big number" div, add this button group div:
   <div className="flex flex-col gap-1.5 ml-2 shrink-0">
     <button
       onClick={onNewMonth}
       className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors"
       title="Clear this month's idle days for all equipment, then advance to next month"
     >
       <CalendarPlus className="w-3.5 h-3.5" />
       → {nextMonthLabel}
     </button>
   </div>
```

---

### Step 4.3 — Wire both features in `index.tsx`

**Cursor prompt:**
```
In src/features/plant-hire-calculator/index.tsx, make these changes:

1. Add a handleNewMonth function after handlePresetSelect:
   const handleNewMonth = () => {
     clearMonthIdleDays(currentMonth);
     const next = new Date(currentMonth);
     next.setMonth(next.getMonth() + 1);
     setCurrentMonth(next);
   };

2. Add a nextMonthLabel constant after handleNewMonth:
   const nextMonthLabel = new Date(
     currentMonth.getFullYear(),
     currentMonth.getMonth() + 1,
     1
   ).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' });

3. Update the EquipmentCard render to pass onDuplicate:
   Add this prop:  onDuplicate={() => duplicateEquipment(item.id)}

4. Update the GrandTotalFooter to pass the new props:
   Add:  onNewMonth={handleNewMonth}
   Add:  nextMonthLabel={nextMonthLabel}
```

---

### ✅ Ship checkpoint
- Each equipment card shows a copy icon (left of the trash). Click it — a duplicate appears below with "(Copy)" in the name.
- The footer shows a `→ May 2026` style button (or whatever next month is). Click it — idle days clear, month advances, equipment stays.

---

## Phase 5 — Print / PDF Invoice View

### What this does
A "Print Invoice" button opens a full-screen overlay showing a clean, print-ready invoice document. It uses the browser's native `window.print()` to print or save as PDF — no extra dependencies needed. The invoice includes: client/PO metadata from Phase 3, all equipment line items grouped by machine, per-machine subtotals, the VAT block from Phase 2 (respects whether VAT is toggled on), a discount legend for municipal compliance, and today's date.

The overlay has two buttons: "Print / Save PDF" and "Close". The print CSS hides the overlay chrome so only the white document prints. All calculations come directly from your existing utility functions — nothing is recalculated differently.

### Files to add
- `src/features/plant-hire-calculator/components/PrintView.tsx` — new file

### Files to change
- `src/features/plant-hire-calculator/components/index.ts` — add export
- `src/features/plant-hire-calculator/components/GrandTotalFooter.tsx` — add Print button
- `src/features/plant-hire-calculator/index.tsx` — wire up print state + pass VAT to PrintView

---

### Step 5.1 — Create `PrintView.tsx`

**Cursor prompt:**
```
Create a new file at src/features/plant-hire-calculator/components/PrintView.tsx with the following content:
```

```typescript
'use client';

import React from 'react';
import type { Equipment, DayType, InvoiceGroupData } from '../types';
import {
  calculatePeriods,
  getSAHolidays,
  calculateLineTotal,
  formatCurrency,
  formatDayRanges,
} from '../utils/calculations';
import type { InvoiceMeta } from './InvoiceHeader';

const VAT_RATE = 0.15;

interface PrintViewProps {
  equipment: Equipment[];
  currentMonth: Date;
  meta: InvoiceMeta;
  vatEnabled: boolean;
  onClose: () => void;
}

// Build invoice line groups for one piece of equipment
const buildGroups = (
  eq: Equipment,
  currentMonth: Date
): Record<number, InvoiceGroupData> => {
  const periods = calculatePeriods(eq.idleDays, currentMonth);
  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();
  const saHolidays = getSAHolidays(year);
  const groups: Record<number, InvoiceGroupData> = {};

  for (const period of periods) {
    const tierKey = period.tier.discount;
    if (!groups[tierKey]) {
      groups[tierKey] = {
        tier: period.tier,
        types: {
          WEEKDAYS: [],
          SATURDAYS: [],
          'SUNDAYS & PUBLIC HOLIDAYS': [],
        },
      };
    }
    for (let d = period.start; d <= period.end; d++) {
      const date = new Date(year, monthIndex, d);
      const isHol = saHolidays.some(
        (h) =>
          h.getDate() === d &&
          h.getMonth() === monthIndex &&
          h.getFullYear() === year
      );
      if (isHol || date.getDay() === 0) {
        groups[tierKey].types['SUNDAYS & PUBLIC HOLIDAYS'].push(d);
      } else if (date.getDay() === 6) {
        groups[tierKey].types.SATURDAYS.push(d);
      } else {
        groups[tierKey].types.WEEKDAYS.push(d);
      }
    }
  }
  return groups;
};

export const PrintView: React.FC<PrintViewProps> = ({
  equipment,
  currentMonth,
  meta,
  vatEnabled,
  onClose,
}) => {
  const typeOrder: DayType[] = [
    'WEEKDAYS',
    'SATURDAYS',
    'SUNDAYS & PUBLIC HOLIDAYS',
  ];

  const monthLabel = currentMonth.toLocaleDateString('en-ZA', {
    month: 'long',
    year: 'numeric',
  });

  const today = new Date().toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Build all sections
  let grandTotalExVat = 0;

  type LineItem = {
    dayType: string;
    days: number;
    rate: number;
    discount: number;
    total: number;
    ranges: string;
  };

  const sections = equipment
    .map((eq) => {
      const groups = buildGroups(eq, currentMonth);
      const lines: LineItem[] = [];
      let subtotal = 0;

      for (const tierKey of Object.keys(groups).sort(
        (a, b) => Number(a) - Number(b)
      )) {
        const group = groups[Number(tierKey)];
        for (const type of typeOrder) {
          const days = group.types[type];
          if (days.length === 0) continue;
          const rate =
            type === 'WEEKDAYS'
              ? eq.rates.weekday
              : type === 'SATURDAYS'
                ? eq.rates.saturday
                : eq.rates.sunday;
          const total = calculateLineTotal(days.length, rate, group.tier.discount);
          subtotal += total;
          lines.push({
            dayType: type,
            days: days.length,
            rate,
            discount: group.tier.discount,
            total,
            ranges: formatDayRanges(days),
          });
        }
      }

      grandTotalExVat += subtotal;
      return { name: eq.name, lines, subtotal };
    })
    .filter((s) => s.lines.length > 0);

  const vatAmount = vatEnabled ? grandTotalExVat * VAT_RATE : 0;
  const totalIncVat = grandTotalExVat + vatAmount;

  return (
    <>
      {/* Print-specific CSS */}
      <style>{`
        @media print {
          body > *:not(#phc-print-root) { display: none !important; }
          #phc-print-root { position: fixed; inset: 0; background: white; }
          .no-print { display: none !important; }
          @page { margin: 15mm; }
        }
      `}</style>

      <div
        id="phc-print-root"
        className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
      >
        {/* Overlay controls — hidden when printing */}
        <div className="no-print fixed top-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-lg"
          >
            Print / Save PDF
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium shadow-lg"
          >
            Close
          </button>
        </div>

        {/* The invoice document */}
        <div
          className="bg-white w-full max-w-4xl rounded-xl shadow-2xl"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          {/* Header band */}
          <div className="bg-slate-900 text-white px-10 py-8 rounded-t-xl">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">PLANT HIRE</h1>
                <p className="text-slate-400 text-sm mt-0.5">Payment Certificate</p>
              </div>
              <div className="text-right">
                {meta.invoiceNumber && (
                  <div className="text-emerald-400 font-bold text-lg">
                    {meta.invoiceNumber}
                  </div>
                )}
                <div className="text-slate-400 text-sm">{today}</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">
                  Billing Period
                </div>
                <div className="font-semibold">{monthLabel}</div>
              </div>
              {meta.clientName && (
                <div>
                  <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">
                    Client
                  </div>
                  <div className="font-semibold">{meta.clientName}</div>
                </div>
              )}
              {meta.poReference && (
                <div>
                  <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">
                    PO / Reference
                  </div>
                  <div className="font-semibold">{meta.poReference}</div>
                </div>
              )}
            </div>
          </div>

          {/* Line items table */}
          <div className="px-10 py-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800">
                  <th className="text-left py-2 text-xs font-bold text-slate-600 uppercase tracking-wider w-1/4">
                    Equipment
                  </th>
                  <th className="text-left py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Day Type
                  </th>
                  <th className="text-left py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="text-right py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="text-right py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="text-right py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Disc.
                  </th>
                  <th className="text-right py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section, si) => (
                  <React.Fragment key={si}>
                    {section.lines.map((line, li) => (
                      <tr
                        key={li}
                        className={`border-b border-slate-100 ${li === 0 ? 'border-t border-slate-200' : ''}`}
                      >
                        <td className="py-2 pr-4 align-top">
                          {li === 0 && (
                            <span className="font-semibold text-slate-800">
                              {section.name}
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-3 text-slate-700 align-top font-medium text-xs">
                          {line.dayType}
                        </td>
                        <td className="py-2 pr-3 text-slate-500 text-xs align-top">
                          {line.ranges}
                        </td>
                        <td className="py-2 pr-3 text-right text-slate-700 align-top">
                          {line.days}
                        </td>
                        <td className="py-2 pr-3 text-right text-slate-700 align-top">
                          {formatCurrency(line.rate)}
                        </td>
                        <td className="py-2 pr-3 text-right align-top">
                          {line.discount > 0 ? (
                            <span className="text-emerald-700 font-medium">
                              {line.discount}%
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2 text-right font-semibold text-slate-800 align-top">
                          {formatCurrency(line.total)}
                        </td>
                      </tr>
                    ))}
                    {/* Per-machine subtotal row */}
                    <tr className="bg-slate-50">
                      <td
                        colSpan={6}
                        className="py-1.5 px-2 text-xs text-slate-400 italic text-right"
                      >
                        {section.name} subtotal
                      </td>
                      <td className="py-1.5 text-right font-bold text-slate-600 text-sm">
                        {formatCurrency(section.subtotal)}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {/* Totals block */}
            <div className="mt-6 flex justify-end">
              <div className="w-72 border border-slate-200 rounded-lg overflow-hidden">
                <div className="flex justify-between px-4 py-2.5 border-b border-slate-200">
                  <span className="text-sm text-slate-600">Sub-total (excl. VAT)</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(grandTotalExVat)}
                  </span>
                </div>
                {vatEnabled && (
                  <div className="flex justify-between px-4 py-2.5 border-b border-slate-200 bg-amber-50">
                    <span className="text-sm text-slate-600">VAT (15%)</span>
                    <span className="font-semibold text-amber-700">
                      {formatCurrency(vatAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between px-4 py-3 bg-slate-900 text-white">
                  <span className="font-bold text-sm">
                    TOTAL{vatEnabled ? ' (incl. VAT)' : ''}
                  </span>
                  <span className="font-bold text-emerald-400 text-lg">
                    {formatCurrency(vatEnabled ? totalIncVat : grandTotalExVat)}
                  </span>
                </div>
              </div>
            </div>

            {/* Compliance legend */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-xs text-slate-400 leading-relaxed">
              <p className="font-semibold text-slate-500 mb-1">Discount Tiers Applied:</p>
              <p>
                Standard (0%): 1–4 continuous working days ·
                Silver (5%): 5–14 continuous working days ·
                Gold (10%): 15+ continuous working days
              </p>
              <p className="mt-1">
                Overtime rates: Saturday = Base + (5% × 1.5) ·
                Sunday / Public Holiday = Base + (5% × 2.0)
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
```

---

### Step 5.2 — Export from `components/index.ts`

**Cursor prompt:**
```
In src/features/plant-hire-calculator/components/index.ts, add at the end:

export { PrintView } from './PrintView';
```

---

### Step 5.3 — Add Print button to `GrandTotalFooter.tsx`

**Cursor prompt:**
```
In src/features/plant-hire-calculator/components/GrandTotalFooter.tsx, make these changes:

1. Add Printer to the lucide-react import.

2. Add this prop to the GrandTotalFooterProps interface:
   onPrint: () => void;

3. Destructure onPrint in the component function signature.

4. In the button group div added in Phase 4 (the one containing the New Month button), add a Print button above the New Month button:
   <button
     onClick={onPrint}
     className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-600"
     title="Preview and print invoice"
   >
     <Printer className="w-3.5 h-3.5" />
     Print Invoice
   </button>
```

---

### Step 5.4 — Wire print state and VAT into `index.tsx`

**Cursor prompt:**
```
In src/features/plant-hire-calculator/index.tsx, make these changes:

1. Add PrintView to the components import.

2. Add vatEnabled state inside the component:
   const [vatEnabled, setVatEnabled] = useState(false);

3. Add showPrint state inside the component:
   const [showPrint, setShowPrint] = useState(false);

4. Add the PrintView conditionally at the very top of the returned JSX (before the outer div):
   {showPrint && (
     <PrintView
       equipment={equipment}
       currentMonth={currentMonth}
       meta={invoiceMeta}
       vatEnabled={vatEnabled}
       onClose={() => setShowPrint(false)}
     />
   )}

5. Update GrandTotalFooter to pass the new props:
   Add:  onPrint={() => setShowPrint(true)}

6. Update GrandTotalFooter to pass vatEnabled — since GrandTotalFooter manages its own
   VAT toggle state internally, no vatEnabled prop is needed there. Instead, lift VAT state
   if you want PrintView and Footer to share the same toggle. 
   
   To lift VAT state: 
   a. Remove the internal vatEnabled useState from GrandTotalFooter.tsx
   b. Add vatEnabled and onVatToggle to GrandTotalFooterProps
   c. Pass vatEnabled={vatEnabled} and onVatToggle={() => setVatEnabled(v => !v)} from index.tsx
   d. Update the toggle button onClick in GrandTotalFooter to call onVatToggle instead of setVatEnabled
   e. Update the breakdown and total display to use the prop vatEnabled instead of local state
```

---

### ✅ Ship checkpoint
Click "Print Invoice" in the footer — the overlay appears. You'll see the full invoice document with your client name, invoice number, equipment lines, per-machine subtotals, and the VAT block (if toggled on). Click "Print / Save PDF" — the browser print dialog opens. The overlay chrome disappears in the print preview. Click "Close" to dismiss.

---

## Final Cleanup — Minor Issues

### Step 6.1 — Remove unused `easterSunday` variable

**Cursor prompt:**
```
In src/features/plant-hire-calculator/utils/calculations.ts, find this line inside getSAHolidays:

  const easterSunday = new Date(year, month - 1, day);

Remove it. The variable is declared but never used. Do not change any other lines in this file.
```

---

### Step 6.2 — Tailwind v4 gradient class verification

**Cursor prompt:**
```
In src/features/plant-hire-calculator/index.tsx, check these two class strings:

1. bg-linear-to-br  (on the outer div)
2. bg-linear-to-r   (on the h1 gradient text)

These are Tailwind v4 syntax. If the gradient is not appearing on the background or the heading text in the browser, replace them:
- bg-linear-to-br → bg-gradient-to-br
- bg-linear-to-r  → bg-gradient-to-r

Only make this change if the gradients are visually broken. Do not change any other classes.
```

---

## Summary of All Changes

| File | Phase | Action |
|------|-------|--------|
| `hooks/useEquipmentManager.ts` | 1 | Full replacement — localStorage + functional updates + duplicate + clearMonth |
| `index.tsx` | 1 | Month persistence + auto-save indicator |
| `components/GrandTotalFooter.tsx` | 2, 4, 5 | VAT toggle + New Month button + Print button |
| `index.tsx` | 2 | Pass `currentMonth` to footer |
| `components/InvoiceHeader.tsx` | 3 | New file |
| `components/index.ts` | 3, 5 | Add exports |
| `index.tsx` | 3 | Invoice meta state + InvoiceHeader render |
| `components/EquipmentCard.tsx` | 4 | Add Copy button + `onDuplicate` prop |
| `index.tsx` | 4 | Wire `duplicateEquipment`, `clearMonthIdleDays`, New Month handler |
| `components/PrintView.tsx` | 5 | New file |
| `index.tsx` | 5 | Print state + VAT lift + wire PrintView |
| `utils/calculations.ts` | 6 | Remove unused `easterSunday` variable |

**Total new files:** 2 (`InvoiceHeader.tsx`, `PrintView.tsx`)  
**Total modified files:** 5  
**Zero changes to:** `calculations.ts` business logic, `types/index.ts`, `DayPicker`, `MonthNavigator`, `QuickIdleButtons`, `RatesConfig`, `InvoiceBreakdown`, `AddEquipmentForm`, `EmptyState`, `CalculationRules`

---

## Notes for Cursor

- Each phase is fully self-contained and can be committed separately
- Cursor prompts are written to be copy-pasted directly — each one targets a single file
- If Cursor generates extra code not mentioned in a prompt, reject the change and re-prompt with the specific targeted instruction
- After each phase, run `bun dev` and verify before moving to the next phase
- Biome will lint automatically on save — address any warnings before committing
