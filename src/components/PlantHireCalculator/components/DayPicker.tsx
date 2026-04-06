import React from 'react';
import { getSAHolidays } from '../utils/calculations';

interface DayPickerProps {
  month: Date;
  selectedDays: Date[];
  onDaysChange: (days: Date[]) => void;
}

export const DayPicker: React.FC<DayPickerProps> = ({ month, selectedDays, onDaysChange }) => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const lastDay = new Date(year, monthIndex + 1, 0);
  const daysInMonth = lastDay.getDate();
  const firstDayObj = new Date(year, monthIndex, 1);
  const startingDayOfWeek = firstDayObj.getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const saHolidays = getSAHolidays(year);

  const isDaySelected = (day: number) => {
    return selectedDays.some(
      (d) =>
        d.getDate() === day &&
        d.getMonth() === monthIndex &&
        d.getFullYear() === year
    );
  };
  
  const isHoliday = (day: number) => {
    return saHolidays.some(
      (d) => 
        d.getDate() === day &&
        d.getMonth() === monthIndex &&
        d.getFullYear() === year
    );
  };

  const toggleDay = (day: number) => {
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
