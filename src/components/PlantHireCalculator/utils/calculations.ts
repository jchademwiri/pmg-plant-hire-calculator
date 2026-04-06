import type { DiscountTier, Period, Rates } from '../types';

export const getDiscountTier = (days: number): DiscountTier => {
  if (days >= 15) {
    return { 
      discount: 10, 
      label: 'Gold Tier', 
      color: 'text-amber-600', 
      bg: 'bg-amber-100', 
      borderColor: 'border-amber-200' 
    };
  } else if (days >= 5) {
    return { 
      discount: 5, 
      label: 'Silver Tier', 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100', 
      borderColor: 'border-emerald-200' 
    };
  } else {
    return { 
      discount: 0, 
      label: 'Standard', 
      color: 'text-slate-500', 
      bg: 'bg-slate-50', 
      borderColor: 'border-slate-100' 
    };
  }
};

export const round2 = (val: number | undefined): number => {
  const safe = typeof val === 'number' && Number.isFinite(val) ? val : 0;
  return Math.round((safe + Number.EPSILON) * 100) / 100;
};

export const formatCurrency = (val: number | undefined): string => {
  return "R" + round2(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export const calculateLineTotal = (days: number, rate: number, discountPercent: number): number => {
  const subtotal = days * rate;
  const total = subtotal * (1 - discountPercent / 100);
  return round2(total);
};

export const calculatePeriods = (idleDays: Date[], month: Date): Period[] => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const lastDay = new Date(year, monthIndex + 1, 0);
  const totalDaysInMonth = lastDay.getDate();
  
  const idleDaySet = new Set(
    (idleDays || [])
      .filter(d => d.getMonth() === monthIndex && d.getFullYear() === year)
      .map(d => d.getDate())
  );

  const periods: Period[] = [];
  let currentStart: number | null = null;

  for (let d = 1; d <= totalDaysInMonth; d++) {
    const isIdle = idleDaySet.has(d);

    if (!isIdle) {
      if (currentStart === null) {
        currentStart = d;
      }
      if (d === totalDaysInMonth) {
         periods.push({ 
           start: currentStart, 
           end: d, 
           length: (d - currentStart + 1), 
           tier: getDiscountTier(d - currentStart + 1) 
         });
      }
    } else {
      if (currentStart !== null) {
        periods.push({ 
          start: currentStart, 
          end: d - 1, 
          length: ((d - 1) - currentStart + 1), 
          tier: getDiscountTier(((d - 1) - currentStart + 1)) 
        });
        currentStart = null;
      }
    }
  }

  return periods;
};

export const getSAHolidays = (year: number): Date[] => {
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
  const familyDay = new Date(year, month - 1, day + 1);

  const fixedDates = [
    new Date(year, 0, 1),
    new Date(year, 2, 21),
    new Date(year, 3, 27),
    new Date(year, 4, 1),
    new Date(year, 5, 16),
    new Date(year, 7, 9),
    new Date(year, 8, 24),
    new Date(year, 11, 16),
    new Date(year, 11, 25),
    new Date(year, 11, 26),
  ];

  const holidays = [goodFriday, familyDay];

  fixedDates.forEach(date => {
    holidays.push(date);
    if (date.getDay() === 0) {
      const mondayObserved = new Date(date);
      mondayObserved.setDate(date.getDate() + 1);
      holidays.push(mondayObserved);
    }
  });

  return holidays;
};

export const formatDayRanges = (days: number[]): string => {
  if (days.length === 0) return '';
  
  const sorted = [...days].sort((a, b) => a - b);
  const ranges: string[] = [];
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

export const calculateRates = (baseRate: number | string): Rates => {
  const r = typeof baseRate === 'string' ? parseFloat(baseRate) : baseRate;
  const safeR = isNaN(r) ? 0 : r;
  return {
    weekday: safeR,
    saturday: safeR + (safeR * 0.05 * 1.5),
    sunday: safeR + (safeR * 0.05 * 2.0)
  };
};
