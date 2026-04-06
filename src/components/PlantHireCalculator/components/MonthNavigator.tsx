import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthNavigatorProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({ currentMonth, onMonthChange }) => {
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
    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
      <button
        onClick={handlePrevMonth}
        className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-slate-500"
        aria-label="Previous month"
        title="Previous month"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-sm font-bold text-slate-700">{monthLabel}</span>
      <button 
        onClick={handleNextMonth}
        className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-slate-500"
        aria-label="Next month"
        title="Next month"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
