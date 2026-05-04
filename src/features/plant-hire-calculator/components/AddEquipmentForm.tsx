import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import type { EquipmentPreset, CatalogueItem } from '../types';

interface AddEquipmentFormProps {
  equipmentName: string;
  dailyRate: string;
  presets: EquipmentPreset[];
  onEquipmentNameChange: (name: string) => void;
  onDailyRateChange: (rate: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onPresetSelect: (preset: EquipmentPreset) => void;
  // Optional catalogue — if provided, replaces presets for quick-add
  catalogueItems?: CatalogueItem[];
  onOpenCatalogueSettings?: () => void;
}

export const AddEquipmentForm: React.FC<AddEquipmentFormProps> = ({
  equipmentName,
  dailyRate,
  presets,
  onEquipmentNameChange,
  onDailyRateChange,
  onSubmit,
  onPresetSelect,
  catalogueItems,
  onOpenCatalogueSettings,
}) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Top 8 from catalogue by usage, or fall back to hardcoded presets
  const hasCustomCatalogue = catalogueItems && catalogueItems.length > 0;
  const quickItems: EquipmentPreset[] = hasCustomCatalogue
    ? [...catalogueItems]
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 8)
        .map((i) => ({ name: i.name, rate: i.rate }))
    : presets;

  // Items beyond the top 8 shown in "More" dropdown
  const moreItems: EquipmentPreset[] = hasCustomCatalogue
    ? [...catalogueItems]
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(8)
        .map((i) => ({ name: i.name, rate: i.rate }))
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      {/* Quick-add row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide py-1.5">
          Quick Add:
        </span>

        {quickItems.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onPresetSelect(preset)}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            {preset.name}
          </button>
        ))}

        {/* More dropdown — only when catalogue has >8 items */}
        {moreItems.length > 0 && (
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              More
              <ChevronDown className="w-3 h-3" />
            </button>
            {moreOpen && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                <div className="max-h-48 overflow-y-auto">
                  {moreItems.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { onPresetSelect(item); setMoreOpen(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-400">R {item.rate.toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manage catalogue link — only when no custom catalogue yet */}
        {!hasCustomCatalogue && onOpenCatalogueSettings && (
          <button
            type="button"
            onClick={onOpenCatalogueSettings}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium ml-1 transition-colors"
          >
            + Manage catalogue
          </button>
        )}
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
