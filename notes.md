# PMG Plant Hire Calculator — Feature Implementation Plan

## Overview

Three additive features, zero breaking changes to existing logic:

1. **Company Branding** — user's own company details shown in the app header and on printed invoices
2. **Client Directory** — saved client list with dropdown selection in the invoice header
3. **Equipment Catalogue** — user-managed equipment list; top 8 most-used auto-populate quick-add buttons, full list available via dropdown

All data lives in `localStorage`. All fields are optional. Existing behaviour is unchanged if the user never visits Settings.

---

## Storage Keys (new)

| Key | Type | Contents |
|-----|------|----------|
| `phc-company-v1` | JSON | Company branding object |
| `phc-clients-v1` | JSON | `Client[]` array |
| `phc-catalogue-v1` | JSON | `CatalogueItem[]` array |

Existing keys (`phc-equipment-v1`, `phc-month-v1`, `phc-vat-v1`, `phc-invoice-meta-v1`) are untouched.

---

## New Types  
**File:** `src/features/plant-hire-calculator/types/index.ts` — append only, no changes to existing interfaces

```ts
export interface CompanyProfile {
  name: string;        // e.g. "PMG Plant Hire"
  registration: string; // e.g. "2019/123456/07"
  vatNumber: string;   // e.g. "4123456789"
  address: string;     // multi-line ok
  phone: string;
  email: string;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  poPrefix: string;    // e.g. "TW-" auto-fills PO field
}

export interface CatalogueItem {
  id: string;
  name: string;
  rate: number;
  usageCount: number;  // incremented each time item is added to a session
}
```

---

## Phase 1 — Settings Panel

### What it does
A slide-in panel (not a new page — keeps the app single-page) accessible via a Settings icon in the app header. Three tabs: **Company**, **Clients**, **Equipment Catalogue**.

### New files
- `src/features/plant-hire-calculator/components/SettingsPanel.tsx`
- `src/features/plant-hire-calculator/components/settings/CompanyTab.tsx`
- `src/features/plant-hire-calculator/components/settings/ClientsTab.tsx`
- `src/features/plant-hire-calculator/components/settings/CatalogueTab.tsx`
- `src/features/plant-hire-calculator/hooks/useCompanyProfile.ts`
- `src/features/plant-hire-calculator/hooks/useClientDirectory.ts`
- `src/features/plant-hire-calculator/hooks/useCatalogue.ts`

### Files to change
- `src/features/plant-hire-calculator/components/index.ts` — add `SettingsPanel` export
- `src/features/plant-hire-calculator/index.tsx` — add settings icon button to header, render `SettingsPanel`
- `src/features/plant-hire-calculator/types/index.ts` — append new interfaces

### Hook pattern (same hydration-safe pattern already used)

```ts
// useCompanyProfile.ts
export const useCompanyProfile = () => {
  const [profile, setProfile] = useState<CompanyProfile>(defaultProfile());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // load from localStorage on mount
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    // save to localStorage on change
  }, [profile, loaded]);

  return { profile, setProfile };
};
```

### SettingsPanel UI
- Fixed right-side drawer, `z-50`, slides in with CSS transition
- Backdrop button closes it
- Three tab buttons at top: Company · Clients · Equipment
- Each tab is its own component
- Save is automatic (controlled inputs, persisted on change)

---

## Phase 2 — Company Branding

### What it does
- App header shows company name (replaces "Plant Hire Calculator" title) if set
- Printed invoice shows company name, registration, VAT number, address, phone, email in a "From" block

### Files to change
- `src/features/plant-hire-calculator/index.tsx` — read `profile.name` from `useCompanyProfile`, show in header
- `src/features/plant-hire-calculator/components/PrintView.tsx` — add company block to invoice header section

### PrintView change (additive only)
Below the "Plant Hire / Payment Certificate" title, add:
```
{profile.name && (
  <div className="mt-4 text-xs text-neutral-500">
    <p className="font-semibold text-neutral-800">{profile.name}</p>
    {profile.registration && <p>Reg: {profile.registration}</p>}
    {profile.vatNumber && <p>VAT: {profile.vatNumber}</p>}
    {profile.address && <p>{profile.address}</p>}
  </div>
)}
```

---

## Phase 3 — Client Directory

### What it does
- `ClientsTab` in Settings: add / edit / delete saved clients (name, contact, email, phone, address, PO prefix)
- `InvoiceHeader` gets a client dropdown — selecting a client auto-fills `clientName` and optionally pre-fills `poReference` with the client's PO prefix
- Free-text input still works if no client is selected or user types manually

### Files to change
- `src/features/plant-hire-calculator/components/InvoiceHeader.tsx` — add client dropdown above the text inputs
- `src/features/plant-hire-calculator/index.tsx` — pass `clients` from `useClientDirectory` into `InvoiceHeader`

### InvoiceHeader dropdown behaviour
```
[Select client ▾]  ← dropdown, shows saved clients
  City of Tshwane
  Ekurhuleni Metro
  ─────────────────
  + Add new client  ← opens Settings > Clients tab

Client / Municipality: [City of Tshwane    ]  ← auto-filled, still editable
PO / Reference:        [TW-               ]   ← pre-filled with poPrefix, still editable
```

Selecting a client fills the fields but does not lock them — user can still type freely.

---

## Phase 4 — Equipment Catalogue & Smart Quick-Add

### What it does
- `CatalogueTab` in Settings: add / edit / delete catalogue items (name + rate)
- Each time a user adds equipment to a session, `usageCount` for that catalogue item increments
- `AddEquipmentForm` quick-add buttons show the **top 8 by usageCount** from the catalogue (falls back to hardcoded `EQUIPMENT_PRESETS` if catalogue is empty)
- A "More…" dropdown in the quick-add bar shows the full catalogue list

### Files to change
- `src/features/plant-hire-calculator/components/AddEquipmentForm.tsx` — accept `catalogueItems` prop, show top 8 as buttons + "More…" dropdown
- `src/features/plant-hire-calculator/hooks/useEquipmentManager.ts` — call `onCatalogueUse(name)` callback when `addEquipment` is called (passed in from parent)
- `src/features/plant-hire-calculator/index.tsx` — wire `useCatalogue` → `AddEquipmentForm`, increment usage on add

### AddEquipmentForm prop change (backwards compatible)
```ts
interface AddEquipmentFormProps {
  // existing props unchanged
  catalogueItems?: CatalogueItem[];  // optional — falls back to EQUIPMENT_PRESETS
}
```

### Quick-add logic
```ts
const quickItems = catalogueItems && catalogueItems.length > 0
  ? [...catalogueItems].sort((a, b) => b.usageCount - a.usageCount).slice(0, 8)
  : EQUIPMENT_PRESETS;
```

---

## Implementation Order

| Phase | Effort | Risk |
|-------|--------|------|
| 1 — Settings panel shell + hooks | ~45 min | Low — purely additive |
| 2 — Company branding | ~20 min | Low — read-only display |
| 3 — Client directory | ~30 min | Low — InvoiceHeader gets one new prop |
| 4 — Equipment catalogue | ~30 min | Low — AddEquipmentForm gets one optional prop |

Start with Phase 1 (hooks + panel shell) since Phases 2–4 all depend on the hooks being in place.

---

## Files Summary

### New files (8)
```
src/features/plant-hire-calculator/
  components/
    SettingsPanel.tsx
    settings/
      CompanyTab.tsx
      ClientsTab.tsx
      CatalogueTab.tsx
  hooks/
    useCompanyProfile.ts
    useClientDirectory.ts
    useCatalogue.ts
```

### Modified files (6)
```
src/features/plant-hire-calculator/
  types/index.ts                    — append 3 new interfaces
  components/index.ts               — add SettingsPanel export
  components/InvoiceHeader.tsx      — add client dropdown
  components/AddEquipmentForm.tsx   — accept catalogueItems prop
  components/PrintView.tsx          — add company block
  index.tsx                         — wire all hooks, settings button
```

### Untouched
```
utils/calculations.ts   ✅
utils/constants.ts      ✅  (still used as fallback)
hooks/useEquipmentManager.ts  ✅ (minor: optional callback param)
All other components    ✅
```

---

## Notes

- Settings panel uses the same hydration-safe `useEffect` load pattern already established in the codebase
- No new routing — single page, drawer pattern
- No new dependencies needed
- `EQUIPMENT_PRESETS` in `constants.ts` stays as the fallback when catalogue is empty
- All new fields are optional — app works identically for users who never open Settings
