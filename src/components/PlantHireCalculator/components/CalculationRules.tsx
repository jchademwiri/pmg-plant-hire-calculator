import React from 'react';
import { Info } from 'lucide-react';

export const CalculationRules: React.FC = () => {
  return (
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
  );
};
