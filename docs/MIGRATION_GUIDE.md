# Migration Guide: From Monolithic to Modular Structure

## 🎯 Overview

This guide helps you transition from the single large `PlantHireCalculator.tsx` file to the new modular component structure.

## 📊 Before vs After Comparison

### Before (Monolithic)
```
src/components/
└── PlantHireCalculator.tsx (900+ lines)
```

### After (Modular)
```
src/components/PlantHireCalculator/
├── PlantHireCalculator.tsx (90 lines)
├── types/ (1 file)
├── utils/ (2 files)
├── hooks/ (2 files + index)
└── components/ (10 files + index)
```

## 🚀 Step-by-Step Migration

### Step 1: Create New Directory Structure

```bash
mkdir -p src/components/PlantHireCalculator/{types,utils,hooks,components}
```

### Step 2: Copy Files

Copy all the refactored files from the refactored-components folder into your project:

```bash
# From your project root
cp -r /path/to/refactored-components/* src/components/PlantHireCalculator/
```

### Step 3: Update Imports

Update any file that imports the calculator:

**Before:**
```tsx
import PlantHireCalculator from '@/components/PlantHireCalculator';
```

**After:**
```tsx
import PlantHireCalculator from '@/components/PlantHireCalculator/PlantHireCalculator';
// Or if you add an index.ts:
import PlantHireCalculator from '@/components/PlantHireCalculator';
```

### Step 4: Create Barrel Export (Optional)

Create `src/components/PlantHireCalculator/index.ts`:

```typescript
export { default } from './PlantHireCalculator';
export * from './types';
export * from './components';
export * from './hooks';
```

This allows cleaner imports:
```tsx
import PlantHireCalculator from '@/components/PlantHireCalculator';
```

### Step 5: Test Everything

Run your application and verify:
- ✅ Calculator loads correctly
- ✅ Can add equipment
- ✅ Calendar works
- ✅ Idle days can be marked
- ✅ Rates can be configured
- ✅ Invoice breakdown displays
- ✅ Grand total calculates correctly
- ✅ Month navigation works

### Step 6: Remove Old File

Once everything works:
```bash
rm src/components/PlantHireCalculator.tsx.old
# or whatever your old file was named
```

## 🔍 Key Changes to Note

### 1. Component Props

All components now have well-defined prop interfaces:

```typescript
interface EquipmentCardProps {
  item: Equipment;
  currentMonth: Date;
  onRemove: () => void;
  onUpdateIdleDays: (days: Date[]) => void;
  onUpdateRates: (rates: Rates) => void;
  onMonthChange: (date: Date) => void;
}
```

### 2. State Management

State is now managed through custom hooks:

```typescript
const {
  equipment,
  addEquipment,
  removeEquipment,
  updateIdleDays,
  updateRates,
} = useEquipmentManager();
```

### 3. Business Logic

All calculations moved to utility functions:

```typescript
import { 
  calculatePeriods, 
  formatCurrency, 
  getSAHolidays 
} from '../utils/calculations';
```

### 4. Type Safety

Types are centralized and exported:

```typescript
import type { Equipment, Rates, Period } from '../types';
```

## 🎨 Customization Guide

### Adding a New Equipment Preset

Edit `utils/constants.ts`:

```typescript
export const EQUIPMENT_PRESETS: EquipmentPreset[] = [
  // ... existing presets
  { name: 'Excavator', rate: 8500 },
];
```

### Modifying Discount Tiers

Edit the `getDiscountTier` function in `utils/calculations.ts`:

```typescript
export const getDiscountTier = (days: number): DiscountTier => {
  if (days >= 30) {
    return { discount: 15, label: 'Platinum Tier', ... };
  }
  // ... rest of tiers
};
```

### Adding a New Component

1. Create the component file in `components/`
2. Export it from `components/index.ts`
3. Import and use in parent component

Example - Adding a "Print Invoice" button:

```tsx
// components/PrintButton.tsx
import React from 'react';
import { Printer } from 'lucide-react';

interface PrintButtonProps {
  onClick: () => void;
}

export const PrintButton: React.FC<PrintButtonProps> = ({ onClick }) => {
  return (
    <button onClick={onClick} className="...">
      <Printer className="w-5 h-5" />
      Print Invoice
    </button>
  );
};

// components/index.ts
export { PrintButton } from './PrintButton';

// PlantHireCalculator.tsx
import { PrintButton } from './components';

// ... in your JSX:
<PrintButton onClick={handlePrint} />
```

## 🐛 Troubleshooting

### Issue: "Cannot find module" errors

**Solution:** Check your import paths. You might need to update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Issue: Components not rendering

**Solution:** Verify all exports in `index.ts` files:

```typescript
// components/index.ts should export all components
export { DayPicker } from './DayPicker';
export { MonthNavigator } from './MonthNavigator';
// ... etc
```

### Issue: TypeScript errors about types

**Solution:** Ensure types are imported correctly:

```typescript
// Use 'type' imports for type-only imports
import type { Equipment, Rates } from '../types';

// Regular imports for values
import { calculateRates } from '../utils/calculations';
```

## 📈 Benefits You'll See

After migration:

✅ **Faster Development** - Find and edit components quickly
✅ **Easier Testing** - Test components in isolation
✅ **Better Collaboration** - Multiple devs can work on different components
✅ **Reduced Bugs** - Smaller files = easier to reason about
✅ **Performance** - Memoization prevents unnecessary calculations
✅ **Future-Proof** - Easy to extend and modify

## 💾 Rollback Plan

If you need to rollback:

1. Keep your old file as `PlantHireCalculator.tsx.backup`
2. Restore it if needed:
   ```bash
   mv PlantHireCalculator.tsx.backup PlantHireCalculator.tsx
   ```

## 🎓 Next Steps

1. ✅ Complete the migration
2. 🧪 Write tests for individual components
3. 📚 Update your documentation
4. 🎨 Consider adding more features now that structure is cleaner
5. 🔄 Apply this pattern to other large components

## 💬 Need Help?

If you encounter issues:
1. Check the README.md for component usage
2. Review the original component for comparison
3. Check TypeScript errors for missing imports
4. Verify all file paths are correct

Happy refactoring! 🎉
