import { useMemo } from 'react';
import type { Equipment } from '../types';
import { calculatePeriods, getSAHolidays, calculateLineTotal } from '../utils/calculations';

export const useGrandTotal = (equipment: Equipment[], currentMonth: Date): number => {
  return useMemo(() => {
    return equipment.reduce((sum, item) => {
      const periods = calculatePeriods(item.idleDays, currentMonth);
      const year = currentMonth.getFullYear();
      const monthIndex = currentMonth.getMonth();
      const saHolidays = getSAHolidays(year);

      let itemTotal = 0;
      periods.forEach(period => {
        let weekdayCount = 0;
        let saturdayCount = 0;
        let sundayHolCount = 0;

        for (let d = period.start; d <= period.end; d++) {
          const date = new Date(year, monthIndex, d);
          const isHol = saHolidays.some(h => 
            h.getDate() === d && h.getMonth() === monthIndex && h.getFullYear() === year
          );

          if (isHol || date.getDay() === 0) sundayHolCount += 1;
          else if (date.getDay() === 6) saturdayCount += 1;
          else weekdayCount += 1;
        }

        itemTotal += calculateLineTotal(weekdayCount, item.rates.weekday, period.tier.discount);
        itemTotal += calculateLineTotal(saturdayCount, item.rates.saturday, period.tier.discount);
        itemTotal += calculateLineTotal(sundayHolCount, item.rates.sunday, period.tier.discount);
      });

      return sum + itemTotal;
    }, 0);
  }, [equipment, currentMonth]);
};
