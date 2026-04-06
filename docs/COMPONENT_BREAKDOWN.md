# Component Breakdown Summary

## 📦 File Size Comparison

| File | Before | After | Reduction |
|------|--------|-------|-----------|
| Main Component | ~900 lines | ~90 lines | 90% smaller |
| Largest Sub-Component | N/A | ~150 lines | N/A |
| Average Component | N/A | ~60 lines | N/A |

## 🎯 Component Responsibilities Matrix

| Component | Lines | Responsibility | Dependencies |
|-----------|-------|----------------|--------------|
| **PlantHireCalculator** | ~90 | Main orchestrator | hooks, components |
| **EquipmentCard** | ~140 | Equipment container | All sub-components |
| **InvoiceBreakdown** | ~130 | Invoice display logic | utils/calculations |
| **DayPicker** | ~110 | Calendar UI | utils/calculations |
| **AddEquipmentForm** | ~60 | Form handling | types |
| **RatesConfig** | ~80 | Rate configuration | types, utils |
| **QuickIdleButtons** | ~80 | Quick toggles | utils/calculations |
| **MonthNavigator** | ~40 | Month navigation | None |
| **GrandTotalFooter** | ~35 | Total display | utils/calculations |
| **EmptyState** | ~15 | Placeholder UI | None |
| **CalculationRules** | ~20 | Info display | None |

## 🏗️ Architecture Layers

```
┌─────────────────────────────────────────────┐
│         PlantHireCalculator (Main)          │
│  - Global state orchestration               │
│  - Month management                         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Custom Hooks Layer                   │
│  - useEquipmentManager (state)              │
│  - useGrandTotal (calculations)             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Component Layer                      │
│  - EquipmentCard (container)                │
│  - AddEquipmentForm                         │
│  - Utility Components                       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Business Logic Layer                 │
│  - calculations.ts (pure functions)         │
│  - constants.ts (data)                      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Type Layer                           │
│  - index.ts (TypeScript definitions)        │
└─────────────────────────────────────────────┘
```

## 🔄 Data Flow

### Equipment Management Flow
```
User adds equipment
    ↓
AddEquipmentForm → onSubmit
    ↓
PlantHireCalculator → handleAddEquipment
    ↓
useEquipmentManager → addEquipment
    ↓
equipment state updated
    ↓
EquipmentCard re-renders with new data
```

### Idle Days Selection Flow
```
User clicks calendar day
    ↓
DayPicker → toggleDay
    ↓
EquipmentCard → onUpdateIdleDays
    ↓
useEquipmentManager → updateIdleDays
    ↓
equipment.idleDays updated
    ↓
InvoiceBreakdown recalculates
    ↓
useGrandTotal recalculates (memoized)
```

### Rate Configuration Flow
```
User changes rate value
    ↓
RatesConfig → handleRateChange
    ↓
EquipmentCard → onUpdateRates
    ↓
useEquipmentManager → updateRates
    ↓
equipment.rates updated
    ↓
InvoiceBreakdown recalculates totals
```

## 📋 Component API Reference

### PlantHireCalculator
**Props:** None (root component)
**State:**
- `currentMonth: Date` - Currently displayed month
- `newEquipmentName: string` - Form input
- `newDailyRate: string` - Form input

### EquipmentCard
**Props:**
```typescript
{
  item: Equipment;
  currentMonth: Date;
  onRemove: () => void;
  onUpdateIdleDays: (days: Date[]) => void;
  onUpdateRates: (rates: Rates) => void;
  onMonthChange: (date: Date) => void;
}
```
**Internal State:**
- `isCollapsed: boolean` - Card expand/collapse state

### DayPicker
**Props:**
```typescript
{
  month: Date;
  selectedDays: Date[];
  onDaysChange: (days: Date[]) => void;
}
```
**Features:**
- Visual calendar grid
- Weekend highlighting
- SA holiday indicators
- Interactive day selection

### InvoiceBreakdown
**Props:**
```typescript
{
  equipment: Equipment;
  currentMonth: Date;
}
```
**Calculations:**
- Period segmentation
- Discount tier assignment
- Day type categorization
- Line item totals

### RatesConfig
**Props:**
```typescript
{
  rates: Rates;
  onRatesChange: (rates: Rates) => void;
}
```
**Features:**
- Weekday rate input
- Saturday rate (with formula)
- Sunday/Holiday rate (with formula)
- Reset to formula button

## 🎨 Styling Approach

All components use **Tailwind CSS** utility classes:

- **Consistent spacing**: `p-4`, `gap-6`, `space-y-4`
- **Color palette**: 
  - Primary: `emerald-*`
  - Secondary: `slate-*`
  - Accent: `amber-*`, `purple-*`
- **Interactive states**: `hover:`, `focus:`, `active:`
- **Responsive**: `md:`, `lg:` breakpoints
- **Animations**: `transition-*`, `animate-in`

## 🧩 Reusable Patterns

### 1. Controlled Input Pattern
```tsx
<input
  value={state}
  onChange={(e) => setState(e.target.value)}
  className="..."
/>
```

### 2. Conditional Rendering
```tsx
{condition ? <ComponentA /> : <ComponentB />}
```

### 3. List Rendering
```tsx
{items.map(item => (
  <Component key={item.id} {...item} />
))}
```

### 4. Event Handler Composition
```tsx
onClick={(e) => {
  e.stopPropagation();
  handler();
}}
```

## 🚀 Performance Optimizations

1. **Memoized Calculations**: `useGrandTotal` uses `useMemo`
2. **Conditional Rendering**: Collapsed cards don't render children
3. **Efficient Updates**: Only affected components re-render
4. **Key Props**: Proper keys for list items prevent unnecessary renders

## 🧪 Testing Considerations

### Unit Tests
- Test business logic functions independently
- Test custom hooks with `@testing-library/react-hooks`
- Test individual components with `@testing-library/react`

### Integration Tests
- Test equipment addition flow
- Test idle day selection flow
- Test calculation accuracy

### E2E Tests
- Test complete user workflows
- Verify calculations across multiple scenarios
- Test responsive behavior

## 📚 Further Reading

For developers working with this codebase:

1. **React Best Practices**: Component composition patterns
2. **TypeScript**: Type safety and interfaces
3. **Tailwind CSS**: Utility-first CSS approach
4. **Custom Hooks**: State management patterns
5. **Testing**: Component testing strategies

## 🎯 Maintenance Checklist

When modifying the calculator:

- [ ] Update relevant component(s) only
- [ ] Ensure TypeScript types are correct
- [ ] Update tests if behavior changes
- [ ] Check responsive design
- [ ] Verify calculations remain accurate
- [ ] Update documentation if needed

## 💡 Extension Ideas

Potential features to add:

1. **Export to PDF/Excel** - Add export functionality
2. **Equipment Templates** - Save and load configurations
3. **Multi-month View** - See multiple months at once
4. **Client Management** - Associate equipment with clients
5. **Invoice History** - Save and retrieve past invoices
6. **Custom Discount Rules** - User-configurable discounts
7. **Equipment Categories** - Group equipment by type
8. **Currency Selector** - Support multiple currencies

Each of these can be added as new components without disrupting existing code!
