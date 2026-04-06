```ts
import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Info, 
  Calculator, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Wand2,
  Receipt,
  Palmtree,
  Sun,
  Moon,
  Coins,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// --- BUSINESS LOGIC ---

const getDiscountTier = (days) => {
  if (days >= 15) {
    return { discount: 10, label: 'Gold Tier', color: 'text-amber-600', bg: 'bg-amber-100', borderColor: 'border-amber-200' };
  } else if (days >= 5) {
    return { discount: 5, label: 'Silver Tier', color: 'text-emerald-600', bg: 'bg-emerald-100', borderColor: 'border-emerald-200' };
  } else {
    return { discount: 0, label: 'Standard', color: 'text-slate-500', bg: 'bg-slate-50', borderColor: 'border-slate-100' };
  }
};

// Currency Formatter (Space as thousands separator)
const formatCurrency = (val) => {
  return "R" + (val || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

// Strict Logic: Any idle day breaks the period
const calculatePeriods = (idleDays, month) => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const lastDay = new Date(year, monthIndex + 1, 0);
  const totalDaysInMonth = lastDay.getDate();
  
  // Get set of idle dates for current month
  const idleDaySet = new Set(
    (idleDays || [])
      .filter(d => d.getMonth() === monthIndex && d.getFullYear() === year)
      .map(d => d.getDate())
  );

  const periods = [];
  let currentStart = null;

  // Iterate through every day of the month
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const isIdle = idleDaySet.has(d);

    if (!isIdle) {
      // It's a working day
      if (currentStart === null) {
        currentStart = d;
      }
      // If it's the last day of month, close the period
      if (d === totalDaysInMonth) {
         periods.push({ start: currentStart, end: d, length: (d - currentStart + 1) });
      }
    } else {
      // It's an idle day
      if (currentStart !== null) {
        // Close the previous working period
        periods.push({ start: currentStart, end: d - 1, length: ((d - 1) - currentStart + 1) });
        currentStart = null;
      }
    }
  }

  // Calculate stats for each period
  return periods.map(p => ({
    ...p,
    tier: getDiscountTier(p.length)
  }));
};

const getSAHolidays = (year) => {
  // Easter Algorithm
  const f = Math.floor,
    G = year % 19,
    C = f(year / 100),
    H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
    I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
    J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
    L = I - J,
    month = 3 + f((L + 40) / 44),
    day = L + 28 - 31 * f(month / 4);
  
  const easterSunday = new Date(year, month - 1, day);
  const goodFriday = new Date(year, month - 1, day - 2);
  const familyDay = new Date(year, month - 1, day + 1); // Monday after Easter

  // Fixed holidays
  const fixedDates = [
    new Date(year, 0, 1),   // New Year's Day
    new Date(year, 2, 21),  // Human Rights Day
    new Date(year, 3, 27),  // Freedom Day
    new Date(year, 4, 1),   // Workers' Day
    new Date(year, 5, 16),  // Youth Day
    new Date(year, 7, 9),   // National Women's Day
    new Date(year, 8, 24),  // Heritage Day
    new Date(year, 11, 16), // Day of Reconciliation
    new Date(year, 11, 25), // Christmas Day
    new Date(year, 11, 26), // Day of Goodwill
  ];

  const holidays = [goodFriday, familyDay];

  // Add fixed dates and handle Sunday Rule
  fixedDates.forEach(date => {
    holidays.push(date);
    if (date.getDay() === 0) { // Sunday
      const mondayObserved = new Date(date);
      mondayObserved.setDate(date.getDate() + 1);
      holidays.push(mondayObserved);
    }
  });

  return holidays;
};

// Helper to convert [1, 2, 3, 5, 6] to "1-3, 5-6"
const formatDayRanges = (days) => {
  if (days.length === 0) return '';
  
  const sorted = [...days].sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== prev + 1) {
      ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
      start = sorted[i];
    }
    prev = sorted[i];
  }
  ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
  return ranges.join(', ');
};

// Calculate Overtime Rates based on Base Rate
const calculateRates = (baseRate) => {
  const r = parseFloat(baseRate) || 0;
  return {
    weekday: r,
    // Formula: Base + (5% of Base * 1.5)
    saturday: r + (r * 0.05 * 1.5),
    // Formula: Base + (5% of Base * 2)
    sunday: r + (r * 0.05 * 2.0)
  };
};

const PRESETS = [
  { name: 'Excavator 1.5T', rate: 2500 },
  { name: 'Dumper 6T', rate: 1800 },
  { name: 'Roller 120', rate: 1200 },
  { name: 'Telehandler', rate: 3000 },
];

// --- COMPONENTS ---

const DayPicker = ({ month, selectedDays, onDaysChange }) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const saHolidays = getSAHolidays(year);

  const isDaySelected = (day) => {
    return selectedDays.some(
      (d) =>
        d.getDate() === day &&
        d.getMonth() === monthIndex &&
        d.getFullYear() === year
    );
  };
  
  const isHoliday = (day) => {
    return saHolidays.some(
      (d) => 
        d.getDate() === day &&
        d.getMonth() === monthIndex &&
        d.getFullYear() === year
    );
  };

  const toggleDay = (day) => {
    const date = new Date(year, monthIndex, day);
    const isSelected = isDaySelected(day);

    if (isSelected) {
      onDaysChange(
        selectedDays.filter(
          (d) =>
            !(
              d.getDate() === day &&
              d.getMonth() === monthIndex &&
              d.getFullYear() === year
            )
        )
      );
    } else {
      onDaysChange([...selectedDays, date]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, i) => (
          <div
            key={day}
            className={`text-center text-[10px] font-bold uppercase tracking-wider ${
              i === 0 || i === 6 ? 'text-amber-500' : 'text-slate-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const selected = isDaySelected(day);
          const dateObj = new Date(year, monthIndex, day);
          const dayOfWeek = dateObj.getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const isPublicHoliday = isHoliday(day);

          return (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`
                aspect-square rounded-md text-xs font-medium transition-all duration-200
                flex items-center justify-center relative border
                ${selected 
                  ? 'bg-red-500 text-white border-red-600 shadow-sm scale-105 hover:bg-red-600' 
                  : isWeekend 
                    ? 'bg-slate-100 text-slate-500 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                    : 'bg-white text-slate-700 border-slate-100 hover:border-emerald-300 hover:bg-emerald-50'
                }
              `}
            >
              {day}
              {isPublicHoliday && !selected && (
                 <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-purple-400 rounded-full" title="SA Public Holiday"></div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
        <div className="flex items-center gap-1">
           <div className="w-2 h-2 bg-red-500 rounded-full"></div>
           <span>Idle</span>
        </div>
        <div className="flex items-center gap-1">
           <div className="w-2 h-2 bg-slate-200 rounded-sm border border-slate-300"></div>
           <span>Wknd</span>
        </div>
        <div className="flex items-center gap-1">
           <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
           <span>SA Hol</span>
        </div>
      </div>
    </div>
  );
};

const EquipmentCard = ({ item, currentMonth, onRemove, onUpdateIdleDays, onUpdateRates, onMonthChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // 1. Calculate Periods (Continuity)
  const periods = calculatePeriods(item.idleDays, currentMonth);

  // 2. Prepare Bank Holidays for lookup
  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();
  const saHolidays = getSAHolidays(year);
  
  // 3. Process Invoice Lines
  const invoiceGroups = {};

  periods.forEach(period => {
    const tierKey = period.tier.discount; // 0, 5, 10
    
    if (!invoiceGroups[tierKey]) {
      invoiceGroups[tierKey] = {
        tier: period.tier,
        types: {
          'WEEKDAYS': [],
          'SATURDAYS': [],
          'SUNDAYS & PUBLIC HOLIDAYS': []
        }
      };
    }

    // Iterate days in this period and bucket them
    for (let d = period.start; d <= period.end; d++) {
      const date = new Date(year, monthIndex, d);
      const isHol = saHolidays.some(h => 
        h.getDate() === d && h.getMonth() === monthIndex && h.getFullYear() === year
      );
      
      if (isHol || date.getDay() === 0) {
        invoiceGroups[tierKey].types['SUNDAYS & PUBLIC HOLIDAYS'].push(d);
      } else if (date.getDay() === 6) {
        invoiceGroups[tierKey].types['SATURDAYS'].push(d);
      } else {
        invoiceGroups[tierKey].types['WEEKDAYS'].push(d);
      }
    }
  });

  // Calculate total cost
  let totalCost = 0;
  Object.values(invoiceGroups).forEach(group => {
    Object.keys(group.types).forEach(type => {
      const days = group.types[type];
      let rate = 0;
      if (type === 'WEEKDAYS') rate = item.rates.weekday;
      else if (type === 'SATURDAYS') rate = item.rates.saturday;
      else rate = item.rates.sunday; // Sun & Hol

      const subtotal = days.length * rate;
      const discount = subtotal * (group.tier.discount / 100);
      totalCost += (subtotal - discount);
    });
  });

  // Helper to mark specific day types (UI Interaction)
  const toggleSpecificDays = (e, dayIndex) => {
    e.stopPropagation();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const idleTimestamps = new Set(item.idleDays.map(d => d.getTime()));
    
    let anyUnselected = false;
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, monthIndex, d);
        if (date.getDay() === dayIndex && !idleTimestamps.has(date.getTime())) {
            anyUnselected = true;
            break;
        }
    }

    let newIdleDays = [...item.idleDays];
    if (anyUnselected) {
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, monthIndex, d);
            if (date.getDay() === dayIndex && !idleTimestamps.has(date.getTime())) {
                newIdleDays.push(date);
            }
        }
    } else {
        newIdleDays = newIdleDays.filter(d => 
             d.getMonth() !== monthIndex || d.getFullYear() !== year || d.getDay() !== dayIndex
        );
    }
    onUpdateIdleDays(newIdleDays);
  };

  const toggleSAHolidays = (e) => {
      e.stopPropagation();
      const holidays = saHolidays.filter(d => d.getMonth() === monthIndex);
      if (holidays.length === 0) return; 

      const idleTimestamps = new Set(item.idleDays.map(d => d.getTime()));
      let anyUnselected = holidays.some(h => !idleTimestamps.has(h.getTime()));
      
      let newIdleDays = [...item.idleDays];
      if (anyUnselected) {
          holidays.forEach(h => {
              if (!idleTimestamps.has(h.getTime())) newIdleDays.push(h);
          });
      } else {
          const holTimestamps = new Set(holidays.map(h => h.getTime()));
          newIdleDays = newIdleDays.filter(d => !holTimestamps.has(d.getTime()));
      }
      onUpdateIdleDays(newIdleDays);
  };

  const handleRateChange = (type, value) => {
      onUpdateRates({
          ...item.rates,
          [type]: parseFloat(value) || 0
      });
  };

  const resetRatesToFormula = () => {
      onUpdateRates(calculateRates(item.rates.weekday));
  };

  const handlePrevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    onMonthChange(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    onMonthChange(next);
  };

  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Header */}
      <div 
        className="bg-slate-50 border-b border-slate-100 p-3 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors select-none"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">{item.name}</h3>
            <p className="text-xs text-slate-500 font-medium">{formatCurrency(item.rates.weekday)} (Base)</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right mr-2 hidden sm:block">
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total</div>
              <div className="font-bold text-emerald-700 text-base">{formatCurrency(totalCost)}</div>
           </div>
           <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
           <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove Item"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          {isCollapsed ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronUp className="w-5 h-5 text-slate-400" />}
        </div>
      </div>

      {/* Body */}
      {!isCollapsed && (
        <div className="p-4 grid lg:grid-cols-[250px_1fr] gap-6 animate-in slide-in-from-top-2 duration-200">
           {/* Left: Calendar & Rates */}
           <div className="space-y-4">
              
              {/* Month Selector inside Card */}
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-slate-500"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-slate-700">{monthLabel}</span>
                <button 
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-slate-500"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Calendar Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    Mark Idle Days
                    </h4>
                </div>
                {/* Quick Actions */}
                <div className="flex gap-1.5 mb-2">
                    <button 
                    onClick={(e) => toggleSpecificDays(e, 6)}
                    className="flex-1 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-1 rounded-md transition-colors flex items-center justify-center gap-1"
                    title="Toggle Saturdays"
                    >
                    <Moon className="w-3 h-3" />
                    Sat
                    </button>
                    <button 
                    onClick={(e) => toggleSpecificDays(e, 0)}
                    className="flex-1 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-1 rounded-md transition-colors flex items-center justify-center gap-1"
                    title="Toggle Sundays"
                    >
                    <Sun className="w-3 h-3" />
                    Sun
                    </button>
                    <button 
                    onClick={toggleSAHolidays}
                    className="flex-1 text-[10px] font-medium bg-purple-50 hover:bg-purple-100 text-purple-700 px-1.5 py-1 rounded-md transition-colors flex items-center justify-center gap-1"
                    title="Toggle SA Public Holidays"
                    >
                    <Palmtree className="w-3 h-3" />
                    SA Hol
                    </button>
                </div>
                <DayPicker 
                    month={currentMonth}
                    selectedDays={item.idleDays}
                    onDaysChange={onUpdateIdleDays}
                />
              </div>

              {/* Rates Configuration */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 relative">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                        <Coins className="w-3.5 h-3.5 text-emerald-500" />
                        Rates Config
                    </h4>
                    <button 
                        onClick={resetRatesToFormula}
                        title="Reset to Formula"
                        className="text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                      <div className="flex items-center justify-between">
                          <label className="text-[10px] font-medium text-slate-500">Weekday</label>
                          <div className="flex items-center bg-white border border-slate-200 rounded px-2 py-1 w-24 focus-within:ring-1 focus-within:ring-emerald-500">
                              <span className="text-[10px] text-slate-400 mr-1">R</span>
                              <input 
                                  type="number" 
                                  className="w-full text-xs outline-none text-right font-medium text-slate-700"
                                  value={item.rates.weekday}
                                  onChange={(e) => handleRateChange('weekday', e.target.value)}
                              />
                          </div>
                      </div>
                      <div className="flex items-center justify-between">
                          <label className="text-[10px] font-medium text-slate-500">
                            Saturday
                            <span className="block text-[8px] text-slate-400 font-normal">Base + (5% × 1.5)</span>
                          </label>
                          <div className="flex items-center bg-white border border-slate-200 rounded px-2 py-1 w-24 focus-within:ring-1 focus-within:ring-emerald-500">
                              <span className="text-[10px] text-slate-400 mr-1">R</span>
                              <input 
                                  type="number" 
                                  className="w-full text-xs outline-none text-right font-medium text-slate-700"
                                  value={item.rates.saturday}
                                  onChange={(e) => handleRateChange('saturday', e.target.value)}
                              />
                          </div>
                      </div>
                      <div className="flex items-center justify-between">
                          <label className="text-[10px] font-medium text-slate-500">
                            Sun/Hol
                            <span className="block text-[8px] text-slate-400 font-normal">Base + (5% × 2.0)</span>
                          </label>
                          <div className="flex items-center bg-white border border-slate-200 rounded px-2 py-1 w-24 focus-within:ring-1 focus-within:ring-emerald-500">
                              <span className="text-[10px] text-slate-400 mr-1">R</span>
                              <input 
                                  type="number" 
                                  className="w-full text-xs outline-none text-right font-medium text-slate-700"
                                  value={item.rates.sunday}
                                  onChange={(e) => handleRateChange('sunday', e.target.value)}
                              />
                          </div>
                      </div>
                  </div>
              </div>
           </div>

           {/* Right: Invoice Rows */}
           <div className="flex flex-col h-full">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Receipt className="w-3.5 h-3.5 text-emerald-500" />
                Invoice Breakdown
              </h4>
              
              <div className="bg-slate-50 rounded-lg border border-slate-100 flex-1 flex flex-col overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 p-2 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2 text-right">Days</div>
                  <div className="col-span-2 text-right">Disc.</div>
                  <div className="col-span-3 text-right">Total</div>
                </div>

                {/* Rows */}
                <div className="overflow-y-auto max-h-[350px]">
                  {Object.keys(invoiceGroups).length === 0 ? (
                     <div className="text-center py-8 text-xs text-slate-400 italic">
                        Mark periods on the calendar to see breakdown.
                     </div>
                  ) : (
                    // 1. Sort Tiers (0, 5, 10)
                    Object.keys(invoiceGroups).sort((a,b) => a - b).map((tierKey) => {
                      const group = invoiceGroups[tierKey];
                      
                      // 2. Iterate Day Types in specific order: Weekdays, Saturdays, Sundays/Hols
                      const typeOrder = ['WEEKDAYS', 'SATURDAYS', 'SUNDAYS & PUBLIC HOLIDAYS'];
                      
                      return (
                        <div key={tierKey} className={`border-b last:border-0 border-slate-100`}>
                          {typeOrder.map(type => {
                            const days = group.types[type];
                            if (days.length === 0) return null;

                            // Lookup correct rate
                            let rate = 0;
                            if (type === 'WEEKDAYS') rate = item.rates.weekday;
                            else if (type === 'SATURDAYS') rate = item.rates.saturday;
                            else rate = item.rates.sunday;

                            const subtotal = days.length * rate;
                            const total = subtotal * (1 - group.tier.discount / 100);
                            const rangeStr = formatDayRanges(days);

                            return (
                              <div key={type} className="grid grid-cols-12 gap-2 p-2 text-xs hover:bg-slate-50/50 transition-colors">
                                <div className="col-span-5 font-medium text-slate-700">
                                  <div className="flex flex-col">
                                    <span className="text-slate-900 font-bold">{type}</span>
                                    <span className="text-[10px] text-slate-400 font-normal mt-0.5">{rangeStr}</span>
                                  </div>
                                </div>
                                <div className="col-span-2 text-right font-medium text-slate-600 mt-1">
                                  <div className="flex flex-col items-end">
                                      <span>{days.length}</span>
                                      <span className="text-[9px] text-slate-400">@ {formatCurrency(rate)}</span>
                                  </div>
                                </div>
                                <div className={`col-span-2 text-right font-bold mt-1 ${group.tier.discount > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                  {group.tier.discount}%
                                </div>
                                <div className="col-span-3 text-right font-bold text-slate-800 mt-1">
                                  {formatCurrency(total)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer Totals */}
                <div className="mt-auto border-t border-slate-200 p-3 bg-slate-50">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium text-xs">Final Amount</span>
                    <span className="text-xl font-bold text-emerald-700">{formatCurrency(totalCost)}</span>
                  </div>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // Initial state updated to include rates structure
  const [equipment, setEquipment] = useState([
    { 
        id: '1', 
        name: 'Excavator 20T', 
        rates: calculateRates(2500), 
        idleDays: [] 
    } 
  ]);
  const [newEquipmentName, setNewEquipmentName] = useState('');
  const [newDailyRate, setNewDailyRate] = useState('');

  const addEquipment = (e) => {
    e?.preventDefault(); // Handle form submit
    if (!newEquipmentName || !newDailyRate) return;

    const baseRate = parseFloat(newDailyRate);
    const newItem = {
      id: Date.now().toString(),
      name: newEquipmentName,
      rates: calculateRates(baseRate),
      idleDays: [],
    };

    setEquipment([...equipment, newItem]);
    setNewEquipmentName('');
    setNewDailyRate('');
  };

  const removeEquipment = (id) => {
    setEquipment(equipment.filter((item) => item.id !== id));
  };

  const updateIdleDays = (id, days) => {
    setEquipment(
      equipment.map((item) =>
        item.id === id ? { ...item, idleDays: days } : item
      )
    );
  };

  const updateRates = (id, newRates) => {
    setEquipment(
      equipment.map((item) => 
        item.id === id ? { ...item, rates: newRates } : item
      )
    );
  };

  const fillPreset = (preset) => {
    setNewEquipmentName(preset.name);
    setNewDailyRate(preset.rate);
  };

  const monthYear = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Calculate Grand Total
  const grandTotal = equipment.reduce((sum, item) => {
    // 1. Calculate Periods
    const periods = calculatePeriods(item.idleDays, currentMonth);
    const year = currentMonth.getFullYear();
    const monthIndex = currentMonth.getMonth();
    const saHolidays = getSAHolidays(year);

    // 2. Calculate Item Total considering different rates
    let itemTotal = 0;
    periods.forEach(period => {
        // Iterate days in this period
        for (let d = period.start; d <= period.end; d++) {
            const date = new Date(year, monthIndex, d);
            const isHol = saHolidays.some(h => 
                h.getDate() === d && h.getMonth() === monthIndex && h.getFullYear() === year
            );
            
            let dailyRate = item.rates.weekday;
            if (isHol || date.getDay() === 0) dailyRate = item.rates.sunday;
            else if (date.getDay() === 6) dailyRate = item.rates.saturday;

            itemTotal += dailyRate * (1 - period.tier.discount / 100);
        }
    });

    return sum + itemTotal;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section - REMOVED MONTH SELECTOR */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-600 mb-2">
              Plant Hire Calculator
            </h1>
            <p className="text-slate-500 font-medium">
              Strict period discounting (Gaps break continuity)
            </p>
          </div>
        </div>

        {/* Add Equipment Bar */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
           {/* Presets */}
           <div className="flex flex-wrap gap-2 mb-4">
             <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide py-1.5">Quick Add:</span>
             {PRESETS.map((preset, idx) => (
               <button
                 key={idx}
                 onClick={() => fillPreset(preset)}
                 className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition-colors"
               >
                 {preset.name}
               </button>
             ))}
           </div>

           <form onSubmit={addEquipment} className="flex flex-col md:flex-row gap-3">
            <input
              placeholder="Equipment Name (e.g., Dump Truck)"
              value={newEquipmentName}
              onChange={(e) => setNewEquipmentName(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-medium">R</span>
              <input
                placeholder="Rate"
                type="number"
                value={newDailyRate}
                onChange={(e) => setNewDailyRate(e.target.value)}
                className="w-full md:w-32 pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add
            </button>
          </form>
        </div>

        {/* Equipment List */}
        <div className="space-y-4">
          {equipment.length === 0 ? (
             <div className="text-center py-20 bg-white/50 border-2 border-dashed border-slate-300 rounded-2xl">
               <Calculator className="w-16 h-16 text-slate-300 mx-auto mb-4" />
               <h3 className="text-lg font-medium text-slate-500">No equipment added yet</h3>
               <p className="text-slate-400">Add a machine above to start calculating</p>
             </div>
          ) : (
            equipment.map((item) => (
              <EquipmentCard 
                key={item.id} 
                item={item} 
                currentMonth={currentMonth}
                onRemove={() => removeEquipment(item.id)}
                onUpdateIdleDays={(days) => updateIdleDays(item.id, days)}
                onUpdateRates={(newRates) => updateRates(item.id, newRates)}
                onMonthChange={setCurrentMonth}
              />
            ))
          )}
        </div>

        {/* Footer Summary */}
        {equipment.length > 0 && (
          <div className="sticky bottom-4 z-10">
            <div className="bg-slate-900 text-white rounded-xl shadow-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-700 backdrop-blur-xl bg-opacity-95">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500 rounded-lg text-emerald-950">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="font-bold text-lg">Invoice Total</h3>
                   <p className="text-slate-400 text-sm">{equipment.length} machine{equipment.length !== 1 && 's'} calculated</p>
                </div>
              </div>
              <div className="text-4xl font-extrabold text-emerald-400">
                {formatCurrency(grandTotal)}
              </div>
            </div>
          </div>
        )}

        {/* Rules Card */}
        <div className="bg-slate-100 rounded-xl p-6 text-sm text-slate-600 border border-slate-200">
          <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Calculation Rules
          </h4>
          <ul className="grid md:grid-cols-3 gap-4 list-disc list-inside marker:text-emerald-500">
            <li>Any idle day <span className="font-medium text-red-600">breaks continuity</span>.</li>
            <li>5-14 continuous days: <span className="font-medium text-emerald-700">5% Off</span>.</li>
            <li>15+ continuous days: <span className="font-medium text-emerald-700">10% Off</span>.</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default App;
```