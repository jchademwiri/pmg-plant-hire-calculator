import React from 'react';
import { Coins, RefreshCw } from 'lucide-react';
import type { Rates } from '../types';
import { calculateRates } from '../utils/calculations';

interface RatesConfigProps {
  rates: Rates;
  onRatesChange: (rates: Rates) => void;
}

export const RatesConfig: React.FC<RatesConfigProps> = ({ rates, onRatesChange }) => {
  const handleRateChange = (type: keyof Rates, value: string) => {
    onRatesChange({
      ...rates,
      [type]: parseFloat(value) || 0
    });
  };

  const resetRatesToFormula = () => {
    onRatesChange(calculateRates(rates.weekday));
  };

  return (
    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 relative">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
          <Coins className="w-3.5 h-3.5 text-emerald-500" />
          Rates Config
        </h4>
        <button 
          onClick={resetRatesToFormula}
          title="Reset to Formula"
          className="text-slate-400 hover:text-emerald-600 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-medium text-slate-500">Weekday</label>
          <div className="flex items-center bg-white border border-slate-200 rounded px-2 py-1 w-24 focus-within:ring-1 focus-within:ring-emerald-500">
            <span className="text-[10px] text-slate-400 mr-1">R</span>
            <input 
              type="number" 
              className="w-full text-xs outline-none text-right font-medium text-slate-700"
              placeholder="0.00"
              value={rates.weekday}
              onChange={(e) => handleRateChange('weekday', e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-medium text-slate-500">
            Saturday
            <span className="block text-[8px] text-slate-400 font-normal">Base + (5% × 1.5)</span>
          </label>
          <div className="flex items-center bg-white border border-slate-200 rounded px-2 py-1 w-24 focus-within:ring-1 focus-within:ring-emerald-500">
            <span className="text-[10px] text-slate-400 mr-1">R</span>
            <input 
              type="number" 
              className="w-full text-xs outline-none text-right font-medium text-slate-700"
              placeholder="0.00"
              value={rates.saturday}
              onChange={(e) => handleRateChange('saturday', e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-medium text-slate-500">
            Sun/Hol
            <span className="block text-[8px] text-slate-400 font-normal">Base + (5% × 2.0)</span>
          </label>
          <div className="flex items-center bg-white border border-slate-200 rounded px-2 py-1 w-24 focus-within:ring-1 focus-within:ring-emerald-500">
            <span className="text-[10px] text-slate-400 mr-1">R</span>
            <input 
              type="number" 
              className="w-full text-xs outline-none text-right font-medium text-slate-700"
              placeholder="0.00"
              value={rates.sunday}
              onChange={(e) => handleRateChange('sunday', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
