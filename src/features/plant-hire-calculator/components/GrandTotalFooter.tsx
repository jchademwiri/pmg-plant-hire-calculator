'use client';

import React from 'react';
import { Info, ToggleLeft, ToggleRight, CalendarPlus, Printer } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

const VAT_RATE = 0.15;

interface GrandTotalFooterProps {
  total: number;
  equipmentCount: number;
  currentMonth: Date;
  vatEnabled: boolean;
  onVatToggle: () => void;
  onNewMonth: () => void;
  nextMonthLabel: string;
  onPrint: () => void;
}

export const GrandTotalFooter: React.FC<GrandTotalFooterProps> = ({
  total,
  equipmentCount,
  currentMonth,
  vatEnabled,
  onVatToggle,
  onNewMonth,
  nextMonthLabel,
  onPrint,
}) => {
  const vatAmount = vatEnabled ? total * VAT_RATE : 0;
  const totalIncVat = total + vatAmount;

  const monthLabel = currentMonth.toLocaleDateString('en-ZA', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="sticky bottom-4 z-10">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700">
        {vatEnabled && (
          <div className="px-6 pt-4 pb-3 border-b border-slate-700 text-sm">
            <div className="max-w-md ml-auto space-y-2 text-right">
              <div className="flex items-center justify-end gap-3">
                <div className="text-slate-400 text-xs uppercase tracking-wide">Sub-total (excl. VAT)</div>
                <div className="font-semibold">{formatCurrency(total)}</div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <div className="text-slate-400 text-xs uppercase tracking-wide">VAT (15%)</div>
                <div className="font-semibold text-amber-400">{formatCurrency(vatAmount)}</div>
              </div>
            </div>
          </div>
        )}

        <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="p-2.5 bg-emerald-500 rounded-lg text-emerald-950 shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">{monthLabel}</h3>
              <p className="text-slate-400 text-xs">
                {equipmentCount} machine{equipmentCount !== 1 ? 's' : ''} calculated
              </p>
            </div>

            <button
              onClick={onVatToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                vatEnabled
                  ? 'bg-amber-500 text-amber-950 border-amber-400 hover:bg-amber-400'
                  : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
              }`}
              title="Toggle 15% VAT"
            >
              {vatEnabled ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
              VAT 15%
            </button>

          </div>

          <div className="text-right">
            <div className="text-3xl font-extrabold text-emerald-400">
              {formatCurrency(vatEnabled ? totalIncVat : total)}
            </div>
            {vatEnabled && <div className="text-xs text-amber-400 mt-0.5">incl. VAT</div>}
          </div>
          <div className="flex flex-col gap-1.5 ml-2 shrink-0">
            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-600 cursor-pointer"
              title="Preview and print invoice"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Invoice
            </button>
            <button
              onClick={onNewMonth}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors"
              title="Clear this month's idle days for all equipment, then advance to next month"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              → {nextMonthLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
