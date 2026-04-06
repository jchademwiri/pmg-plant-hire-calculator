# Plant Hire Calculator – Next.js (App Router) Replication Guide

This guide explains how to recreate the **Plant Hire Calculator** application in a standard **Next.js 14+** environment using the **App Router** and **Tailwind CSS**.

---

## Prerequisites

Ensure the following tools are installed:

* **Node.js** v18.17 or later
* **npm**, **yarn**, or **pnpm**

---

## Step 1: Create the Next.js Project

Open a terminal and run:

```bash
npx create-next-app@latest plant-hire-calculator
cd plant-hire-calculator
```

When prompted during setup, select:

* ✔ TypeScript — **Yes**
* ✔ ESLint — **Yes**
* ✔ Tailwind CSS — **Yes**
* ✔ App Router — **Yes**

---

## Step 2: Install Required Dependencies

The calculator uses **Lucide React** for icons.

```bash
npm install lucide-react
# or
yarn add lucide-react
# or
pnpm add lucide-react
```

---

## Step 3: Add the Calculator Component

1. In the project root, create a new folder named:

```
/components
```

2. Inside that folder, create a file named:

```
PlantHireCalculator.tsx
```

3. At the very top of the file, add:

```tsx
'use client';
```

4. Paste the full **Plant Hire Calculator component code** into this file.

> This directive is required because the calculator uses `useState` and other client-side interactivity.

---

## Step 4: Render the Component on the Home Page

Open:

```
app/page.tsx
```

Replace the default boilerplate with:

```tsx
import PlantHireCalculator from '@/components/PlantHireCalculator';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <PlantHireCalculator />
    </main>
  );
}
```

---

## Step 5: Verify Tailwind CSS Configuration

Open **tailwind.config.ts** and confirm the `content` array includes the components directory:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

If styles are not appearing, this is usually the cause.

---

## Step 6: Ensure Global Tailwind Styles Are Loaded

Open:

```
app/globals.css
```

Confirm it contains:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Step 7: Run the Development Server

Start the app:

```bash
npm run dev
```

Visit:

```
http://localhost:3000
```

You should now see the fully working **Plant Hire Calculator**.

---

## Troubleshooting

### ❌ "useState is not defined" or Server Component Error

Ensure `'use client';` is the **first line** in:

```
components/PlantHireCalculator.tsx
```

---

### ❌ Icons Not Showing

Verify installation:

```bash
npm list lucide-react
```

If missing, reinstall the package.

---

### ❌ Tailwind Styles Not Applying

Check the following:

* `tailwind.config.ts` includes the **components** folder
* `app/globals.css` contains the Tailwind directives
* The dev server was restarted after installing Tailwind

---

## Result

You now have a clean, portable **Next.js App Router** setup running the **Plant Hire Calculator** with proper client-side interactivity and Tailwind styling.
