import React, { useState } from 'react';
import { Calculator, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import type { Equipment, Rates } from '../types';
import { formatCurrency, calculatePeriods, getSAHolidays, calculateLineTotal } from '../utils/calculations';
import { DayPicker } from './DayPicker';
import { MonthNavigator } from './MonthNavigator';
import { QuickIdleButtons } from './QuickIdleButtons';
import { RatesConfig } from './RatesConfig';
import { InvoiceBreakdown } from './InvoiceBreakdown';

interface EquipmentCardProps {
  item: Equipment;
  currentMonth: Date;
  onRemove: () => void;
  onUpdateIdleDays: (days: Date[]) => void;
  onUpdateRates: (rates: Rates) => void;
  onMonthChange: (date: Date) => void;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ 
  item, 
  currentMonth, 
  onRemove, 
  onUpdateIdleDays, 
  onUpdateRates, 
  onMonthChange 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Calculate total cost for header display
  const periods = calculatePeriods(item.idleDays, currentMonth);
  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();
  const saHolidays = getSAHolidays(year);
  
  let totalCost = 0;
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

    totalCost += calculateLineTotal(weekdayCount, item.rates.weekday, period.tier.discount);
    totalCost += calculateLineTotal(saturdayCount, item.rates.saturday, period.tier.discount);
    totalCost += calculateLineTotal(sundayHolCount, item.rates.sunday, period.tier.discount);
  });

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
              <MonthNavigator 
                currentMonth={currentMonth}
                onMonthChange={onMonthChange}
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    Mark Idle Days
                  </h4>
                </div>
                
                <QuickIdleButtons 
                  currentMonth={currentMonth}
                  idleDays={item.idleDays}
                  onIdleDaysChange={onUpdateIdleDays}
                />
                
                <DayPicker 
                  month={currentMonth}
                  selectedDays={item.idleDays}
                  onDaysChange={onUpdateIdleDays}
                />
              </div>

              <RatesConfig 
                rates={item.rates}
                onRatesChange={onUpdateRates}
              />
           </div>

           {/* Right: Invoice Rows */}
           <InvoiceBreakdown 
             equipment={item}
             currentMonth={currentMonth}
           />
        </div>
      )}
    </div>
  );
};
