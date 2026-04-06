import React from 'react';
import { Moon, Sun, Palmtree } from 'lucide-react';
import { getSAHolidays } from '../utils/calculations';

interface QuickIdleButtonsProps {
  currentMonth: Date;
  idleDays: Date[];
  onIdleDaysChange: (days: Date[]) => void;
}

export const QuickIdleButtons: React.FC<QuickIdleButtonsProps> = ({ 
  currentMonth, 
  idleDays, 
  onIdleDaysChange 
}) => {
  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();
  const lastDay = new Date(year, monthIndex + 1, 0);
  const daysInMonth = lastDay.getDate();

  const toggleSpecificDays = (e: React.MouseEvent, dayIndex: number) => {
    e.stopPropagation();
    const idleTimestamps = new Set(idleDays.map(d => d.getTime()));
    
    let anyUnselected = false;
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, monthIndex, d);
        if (date.getDay() === dayIndex && !idleTimestamps.has(date.getTime())) {
            anyUnselected = true;
            break;
        }
    }

    let newIdleDays = [...idleDays];
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
    onIdleDaysChange(newIdleDays);
  };

  const toggleSAHolidays = (e: React.MouseEvent) => {
      e.stopPropagation();
      const saHolidays = getSAHolidays(year);
      const holidays = saHolidays.filter(d => d.getMonth() === monthIndex);
      if (holidays.length === 0) return; 

      const idleTimestamps = new Set(idleDays.map(d => d.getTime()));
      let anyUnselected = holidays.some(h => !idleTimestamps.has(h.getTime()));
      
      let newIdleDays = [...idleDays];
      if (anyUnselected) {
          holidays.forEach(h => {
              if (!idleTimestamps.has(h.getTime())) newIdleDays.push(h);
          });
      } else {
          const holTimestamps = new Set(holidays.map(h => h.getTime()));
          newIdleDays = newIdleDays.filter(d => !holTimestamps.has(d.getTime()));
      }
      onIdleDaysChange(newIdleDays);
  };

  return (
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
  );
};
