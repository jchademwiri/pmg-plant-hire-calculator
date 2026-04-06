import React from 'react';
import { Receipt } from 'lucide-react';
import type { Equipment, DayType, InvoiceGroupData } from '../types';
import { calculatePeriods, getSAHolidays, calculateLineTotal, formatCurrency, formatDayRanges } from '../utils/calculations';

interface InvoiceBreakdownProps {
  equipment: Equipment;
  currentMonth: Date;
}

export const InvoiceBreakdown: React.FC<InvoiceBreakdownProps> = ({ equipment, currentMonth }) => {
  const periods = calculatePeriods(equipment.idleDays, currentMonth);
  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();
  const saHolidays = getSAHolidays(year);
  
  const invoiceGroups: Record<number, InvoiceGroupData> = {};

  periods.forEach(period => {
    const tierKey = period.tier.discount;
    
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

  let totalCost = 0;
  Object.values(invoiceGroups).forEach(group => {
    (Object.keys(group.types) as DayType[]).forEach(type => {
      const days = group.types[type];
      let rate = 0;
      if (type === 'WEEKDAYS') rate = equipment.rates.weekday;
      else if (type === 'SATURDAYS') rate = equipment.rates.saturday;
      else rate = equipment.rates.sunday;

      totalCost += calculateLineTotal(days.length, rate, group.tier.discount);
    });
  });

  return (
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
        <div className="overflow-y-auto max-h-87.5">
          {Object.keys(invoiceGroups).length === 0 ? (
             <div className="text-center py-8 text-xs text-slate-400 italic">
                Mark periods on the calendar to see breakdown.
             </div>
          ) : (
            Object.keys(invoiceGroups).sort((a,b) => parseInt(a) - parseInt(b)).map((tierKey) => {
              const group = invoiceGroups[parseInt(tierKey)];
              
              const typeOrder: DayType[] = ['WEEKDAYS', 'SATURDAYS', 'SUNDAYS & PUBLIC HOLIDAYS'];
              
              return (
                <div key={tierKey} className="border-b last:border-0 border-slate-100">
                  {typeOrder.map(type => {
                    const days = group.types[type];
                    if (days.length === 0) return null;

                    let rate = 0;
                    if (type === 'WEEKDAYS') rate = equipment.rates.weekday;
                    else if (type === 'SATURDAYS') rate = equipment.rates.saturday;
                    else rate = equipment.rates.sunday;

                    const total = calculateLineTotal(days.length, rate, group.tier.discount);
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
  );
};
