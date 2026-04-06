# 🏗️ Plant Hire Calculator (South Africa 🇿🇦)

A production-ready web application for generating accurate **plant hire payment certificates** aligned with South African municipal tender requirements. Built for daily operational use — survives page refreshes, produces print-ready invoices, and handles all SA public holiday and overtime rate logic automatically.

---

## 📋 Tender Specification

**This calculator is built specifically for the following Tshwane tenders:**

* **Tshwane Tender SLA SS 01-2023-24**
* **Tshwane Tender SLA SS 02-2023-24**

These tender documents define the **core calculation logic, rate structures, discount tiers, and compliance rules** implemented in this system.

⚠️ **Continuous Compliance & Updates**
This application is actively maintained to remain aligned with:

* The latest **Service Level Agreements (SLAs)**
* Updated **tender documents**
* Any **contractual amendments or addendums** issued during active projects

As such, the system should always be considered a **living tool**, evolving alongside current project requirements. Users are advised to always work on the **latest deployed version** to ensure full compliance.

---

## 🌍 Open Source Purpose

This repository is open source to support **contractors, estimators, and project teams** working on similar municipal tenders.

The goal is simple:

* Help users **get pricing right quickly**
* Eliminate repetitive manual calculations
* Reduce errors in **discount application, overtime rates, and billing logic**

Instead of recalculating rates, discounts, and compliance rules manually for every invoice, this tool provides a **reliable, repeatable, and audit-friendly approach** based on real tender requirements.

While the system is tailored to Tshwane tenders listed above, it can also serve as a **reference implementation** for similar plant hire contracts across South Africa.

---

## 🚀 Key Features

### 💾 Persistent Session

Everything is automatically saved to your browser. Equipment, rates, idle days, invoice metadata, VAT preference, and current billing month all survive page refreshes and tab closures — no manual save required. The "Auto-saved" indicator in the header confirms state is being written.

### 🇿🇦 South African Context

**Currency Formatting**

* ZAR with space as thousands separator
* Example: `R109 720.00`

**Public Holiday Detection**

* All fixed SA public holidays
* Dynamic Easter-based holidays (Good Friday, Family Day)
* Sunday Rule: if a public holiday falls on a Sunday, the following Monday is observed

### 🧮 Smart Rate Calculations

Rates are automatically derived from the Base Daily Rate:

| Day Type                  | Formula                  | Description             |
| ------------------------- | ------------------------ | ----------------------- |
| Weekdays                  | Base Rate                | Standard daily charge   |
| Saturdays                 | Base + (5% × Base × 1.5) | Time-and-a-half loading |
| Sundays & Public Holidays | Base + (5% × Base × 2.0) | Double-time loading     |

Any calculated rate can be manually overridden via the **Configure Rates** panel to accommodate special contract terms.

### 🎯 Tiered Discount Logic (Continuous Work)

| Continuous Days Worked | Discount Applied |
| ---------------------- | ---------------- |
| 1–4 Days               | 0% (Standard)    |
| 5–14 Days              | 5% (Silver Tier) |
| 15+ Days               | 10% (Gold Tier)  |

Any day marked as **Idle** breaks continuity and resets the discount cycle for that machine.

### 🧾 Invoice Generation

Real-time invoice breakdown per machine:

* Groups line items by Discount Tier and Day Type
* Displays date ranges (e.g. `Weekdays: 1–5, 8–12`)
* Calculates totals based on rates, discounts, and working days
* Optional VAT (15%) with sub-total / VAT / total breakdown

### 🖨️ Print-Ready Invoice

A clean print view (Phase 5 — see roadmap) produces a municipal-style payment certificate with:

* Client, invoice number, PO reference from the Invoice Details bar
* All machines with per-machine subtotals
* VAT block (respects the toggle state)
* Discount tier compliance legend
* Browser-native PDF export via `Print / Save PDF`

---

## 🛠️ Technology Stack

| Layer      | Technology              |
| ---------- | ----------------------- |
| Runtime    | Bun                     |
| Framework  | Next.js 16 (App Router) |
| UI Library | React 19                |
| Styling    | Tailwind CSS v4         |
| Icons      | Lucide React            |
| Linting    | Biome 2                 |
| Language   | TypeScript 5            |

---

## 📦 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/plant-hire-calculator.git
cd plant-hire-calculator
```

### 2️⃣ Install Dependencies

```bash
bun install
```

### 3️⃣ Run the Development Server

```bash
bun dev
```

Open your browser at:

```
http://localhost:3000
```

---

## 📂 Project Structure

```
src/
├── app/
│   ├── globals.css              # Tailwind v4 import
│   ├── layout.tsx               # Root layout (Geist fonts)
│   └── page.tsx                 # Entry point → PlantHireCalculator
└── features/
    └── plant-hire-calculator/
        ├── index.tsx            # Main orchestrator ('use client')
        ├── types/
        │   └── index.ts         # All TypeScript interfaces
        ├── utils/
        │   ├── calculations.ts  # Business logic (pure functions)
        │   └── constants.ts     # Equipment presets
        ├── hooks/
        │   ├── useEquipmentManager.ts   # Equipment CRUD + localStorage
        │   ├── useGrandTotal.ts         # Memoized total calculation
        │   └── index.ts
        └── components/
            ├── AddEquipmentForm.tsx
            ├── CalculationRules.tsx
            ├── DayPicker.tsx
            ├── EmptyState.tsx
            ├── EquipmentCard.tsx
            ├── GrandTotalFooter.tsx
            ├── InvoiceBreakdown.tsx
            ├── InvoiceHeader.tsx
            ├── MonthNavigator.tsx
            ├── QuickIdleButtons.tsx
            ├── RatesConfig.tsx
            └── index.ts
```

---

## 📝 Usage Guide

### 1️⃣ Fill In Invoice Details (Optional)

Enter Client / Municipality, Invoice Number, and PO Reference at the top. These persist across sessions and appear in the print view.

### 2️⃣ Add Equipment

Use the Quick Add presets (Dropside, ADT, FEL, etc.) or type a custom name and base daily rate. The Saturday and Sunday/Holiday rates are calculated automatically.

### 3️⃣ Configure Rates (if needed)

Click **Configure Rates** in the header, or select any equipment card first, then adjust rates via the floating panel. Use the reset button to restore the formula-derived values.

### 4️⃣ Set the Billing Month

Use the arrow buttons inside each equipment card to navigate months. All cards share the same month — changing it on one changes it for all.

### 5️⃣ Mark Idle Days

Click calendar dates to mark them **Idle (Red)**:

* Idle days are not billed
* Idle days break the discount continuity streak
* Use **Sat** / **Sun** / **SA Hol** quick buttons to toggle entire categories at once

### 6️⃣ Duplicate Equipment

Click the copy icon on any card to insert an identical machine directly below it — same rates, no idle days. Useful when multiple units of the same plant type are deployed at the same contract rate.

### 7️⃣ Review the Invoice Breakdown

Each card shows real-time line items grouped by day type and discount tier. The grand total footer updates live.

### 8️⃣ Toggle VAT

Click **VAT 15%** in the footer to switch between ex-VAT and incl-VAT display. The breakdown row shows the split. VAT preference is saved across sessions.

### 9️⃣ Advance to Next Month

Click **→ [Next Month]** in the footer. The app clears idle days for the current month across all equipment, advances the month, and keeps all machines and rates intact.

### 🔟 Print the Invoice

Click **Print Invoice** in the footer to open the print overlay. Review the document, then click **Print / Save PDF** to use the browser's native print dialog.

---

## 🧮 Calculation Rules (Tender Compliance)

### Discount Structure

| Days Worked | Rule                    |
| ----------- | ----------------------- |
| 1–4 Days    | No discount             |
| 5–14 Days   | 5% off applicable rate  |
| 15+ Days    | 10% off applicable rate |

Any idle day resets the continuous work counter.

### Overtime Rate Formulas

```
Rate = Base + (5% of Base × Factor)
```

| Day Type                  | Factor | Formula                    |
| ------------------------- | ------ | -------------------------- |
| Saturdays                 | 1.5    | Base + (0.05 × Base × 1.5) |
| Sundays & Public Holidays | 2.0    | Base + (0.05 × Base × 2.0) |

### VAT

South African standard VAT rate of 15% is applied to the total ex-VAT amount when the VAT toggle is enabled.

---

## 💾 Local Storage Keys

The app uses these keys — safe to clear if you want a fresh start:

| Key                   | Contents                         |
| --------------------- | -------------------------------- |
| `phc-equipment-v1`    | All equipment, rates, idle days  |
| `phc-month-v1`        | Current billing month (ISO date) |
| `phc-vat-v1`          | VAT toggle preference            |
| `phc-invoice-meta-v1` | Client name, invoice no, PO ref  |

To reset the app completely: open browser DevTools → Application → Local Storage → delete all `phc-*` keys, then refresh.

---

## 🔧 Equipment Presets

Default presets with common South African plant hire rates:

| Preset          | Base Rate |
| --------------- | --------- |
| Dropside        | R5 200.00 |
| ADT             | R5 913.04 |
| FEL             | R4 769.57 |
| Bulldozer       | R6 360.00 |
| Skid Steer      | R2 434.78 |
| Concrete Cutter | R415.88   |

To modify presets, edit `src/features/plant-hire-calculator/utils/constants.ts`.

---

## 🗺️ Roadmap

* [x] Phase 1 — localStorage persistence + functional state updates
* [x] Phase 2 — VAT toggle (15%) with breakdown display
* [x] Phase 3 — Invoice metadata (client, invoice number, PO reference)
* [x] Phase 4 — Duplicate equipment + New Month workflow
* [x] Phase 4b — Floating rates panel with active equipment selection
* [ ] Phase 5 — Print / PDF invoice view
* [ ] Phase 6 — Supabase auth + database (invoice history, multi-device)
* [ ] Phase 7 — Analytics dashboard (revenue by machine, utilisation heatmap)

---

## 📄 License

Private — Playhouse Media Group (PTY) Ltd
