import React from 'react';
import { Info } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

interface GrandTotalFooterProps {
  total: number;
  equipmentCount: number;
}

export const GrandTotalFooter: React.FC<GrandTotalFooterProps> = ({ total, equipmentCount }) => {
  return (
    <div className="sticky bottom-4 z-10">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-700 backdrop-blur-xl bg-opacity-95">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500 rounded-lg text-emerald-950">
            <Info className="w-6 h-6" />
          </div>
          <div>
             <h3 className="font-bold text-lg">Invoice Total</h3>
             <p className="text-slate-400 text-sm">{equipmentCount} machine{equipmentCount !== 1 && 's'} calculated</p>
          </div>
        </div>
        <div className="text-4xl font-extrabold text-emerald-400">
          {formatCurrency(total)}
        </div>
      </div>
    </div>
  );
};
