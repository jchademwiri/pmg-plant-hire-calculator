# Development Plan – South African Plant Hire Calculator

This document provides a structured, implementation-focused roadmap for building the **Plant Hire Calculator** web application. The system generates compliant **plant hire payment certificates** based on South African municipal tender rules, including overtime formulas, public holiday logic, and tiered continuity discounts.

---

## Phase 1 – Project Initialization & Environment Setup

### 🎯 Goal

Establish a clean **Next.js 14+** environment configured with **Tailwind CSS**.

### 1️⃣ Create the Project Scaffold

```bash
npx create-next-app@latest plant-hire-calculator
```

**Recommended Setup Options**

| Setting          | Selection   | Reason                                                |
| ---------------- | ----------- | ----------------------------------------------------- |
| TypeScript       | No          | Provided component is JSX (TS still compatible later) |
| ESLint           | Yes         | Enforces code quality                                 |
| Tailwind CSS     | Yes         | Required for UI styling                               |
| `src/` directory | No          | Use root `app/` structure                             |
| App Router       | Yes         | Modern Next.js standard                               |
| Import alias     | Yes (`@/*`) | Cleaner imports                                       |

---

### 2️⃣ Install Required Dependencies

```bash
npm install lucide-react
```

Lucide provides the icon set used throughout the interface.

---

### 3️⃣ Clean Default Boilerplate

| File                    | Action                                             |
| ----------------------- | -------------------------------------------------- |
| `app/globals.css`       | Remove default styles but keep Tailwind directives |
| `app/page.js` or `.tsx` | Clear starter content                              |

---

## Phase 2 – Core Business Logic Implementation

### 🎯 Goal

Implement all pricing, discount, and calendar rules required for South African invoicing.

### 1️⃣ Create Component Structure

```
/components
  └── PlantHireCalculator.jsx
```

Add to the **first line** of the file:

```javascript
'use client';
```

---

### 2️⃣ Implement Core Logic Functions

#### 🇿🇦 `getSAHolidays(year)`

* Include fixed public holidays (Freedom Day, Youth Day, etc.)
* Calculate Easter-based holidays dynamically
* Implement the **Sunday Rule**: if a holiday falls on Sunday, the following Monday is observed

#### 💰 `calculateRates(baseRate)`

Implements municipal overtime formulas:

| Day Type                | Formula                      |
| ----------------------- | ---------------------------- |
| Saturday                | `Base + (0.05 × Base × 1.5)` |
| Sunday / Public Holiday | `Base + (0.05 × Base × 2.0)` |

#### 🔄 `calculatePeriods(idleDays, month)`

* Detect continuous working streaks
* Any **Idle Day** resets discount continuity

#### 🎯 `getDiscountTier(daysWorked)`

| Days | Discount |
| ---- | -------- |
| 1–4  | 0%       |
| 5–14 | 5%       |
| 15+  | 10%      |

---

### 3️⃣ UI Modules (Contained in One File)

| Component             | Responsibility                                                     |
| --------------------- | ------------------------------------------------------------------ |
| **DayPicker**         | Calendar grid showing Idle (Red), Weekend (Grey), Holiday (Purple) |
| **EquipmentCard**     | Machine entry card with rate configuration + month navigation      |
| **Invoice Generator** | Groups billing lines by Discount Tier → Day Type → Date Range      |

Paste the full source code into:

```
components/PlantHireCalculator.jsx
```

✔ Verify `'use client';` is the very first line.

---

## Phase 3 – Integration & Configuration

### 🎯 Goal

Connect the calculator to the app layout and confirm Tailwind is active.

### 1️⃣ Update Main Entry Page

**File:** `app/page.js` or `app/page.tsx`

```jsx
import PlantHireCalculator from '@/components/PlantHireCalculator';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <PlantHireCalculator />
    </main>
  );
}
```

---

### 2️⃣ Tailwind Configuration Check

**File:** `tailwind.config.js` or `.ts`

```js
content: [
  "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
],
```

Restart the dev server if Tailwind changes were made.

---

## Phase 4 – Testing & Validation (QA)

### 🎯 Goal

Verify calculations against expected municipal billing behavior.

Start the dev server:

```bash
npm run dev
```

Open: **[http://localhost:3000](http://localhost:3000)**

---

### ✅ Validation Scenarios

#### Scenario A – Continuity Break

| Setup                                         | Expected Result                                  |
| --------------------------------------------- | ------------------------------------------------ |
| Days 1–4 worked, Day 5 idle, Days 6–20 worked | Days 1–4 → 0% discount; Days 6–20 → 10% discount |

#### Scenario B – Overtime Formula Check

| Base Rate | Expected Saturday | Expected Sunday |
| --------- | ----------------- | --------------- |
| R6,800    | R7,310            | R7,480          |

#### Scenario C – Holiday Detection

Navigate to **April** or **December**.

| Expectation                                                                   |
| ----------------------------------------------------------------------------- |
| Easter holidays and Christmas auto-detected and billed at Sunday/Holiday rate |

---

## Phase 5 – Deployment (Optional)

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

For live hosting, deploy easily using **Vercel** or any Node-compatible hosting provider.

---

## Outcome

Following this plan results in a fully functional **South African–compliant Plant Hire Calculator** with accurate discount logic, overtime calculations, and automated holiday handling.
