import React from 'react';
import { Plus } from 'lucide-react';
import type { EquipmentPreset } from '../types';

interface AddEquipmentFormProps {
  equipmentName: string;
  dailyRate: string;
  presets: EquipmentPreset[];
  onEquipmentNameChange: (name: string) => void;
  onDailyRateChange: (rate: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onPresetSelect: (preset: EquipmentPreset) => void;
}

export const AddEquipmentForm: React.FC<AddEquipmentFormProps> = ({
  equipmentName,
  dailyRate,
  presets,
  onEquipmentNameChange,
  onDailyRateChange,
  onSubmit,
  onPresetSelect
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide py-1.5">Quick Add:</span>
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => onPresetSelect(preset)}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            {preset.name}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex flex-col md:flex-row gap-3">
        <input
          placeholder="Equipment Name (e.g., Dump Truck)"
          value={equipmentName}
          onChange={(e) => onEquipmentNameChange(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
        />
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-slate-400 font-medium">R</span>
          <input
            placeholder="Rate"
            type="number"
            value={dailyRate}
            onChange={(e) => onDailyRateChange(e.target.value)}
            className="w-full md:w-32 pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add
        </button>
      </form>
    </div>
  );
};
