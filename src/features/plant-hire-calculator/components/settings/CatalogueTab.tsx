import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import type { CatalogueItem } from '../../types';

interface CatalogueTabProps {
  catalogue: CatalogueItem[];
  onAdd: (name: string, rate: number) => void;
  onUpdate: (id: string, updates: Partial<Pick<CatalogueItem, 'name' | 'rate'>>) => void;
  onRemove: (id: string) => void;
}

export const CatalogueTab: React.FC<CatalogueTabProps> = ({
  catalogue,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  const [newName, setNewName] = useState('');
  const [newRate, setNewRate] = useState('');

  const handleAdd = () => {
    const rate = parseFloat(newRate);
    if (!newName.trim() || isNaN(rate) || rate <= 0) return;
    onAdd(newName.trim(), rate);
    setNewName('');
    setNewRate('');
  };

  const sorted = [...catalogue].sort((a, b) => b.usageCount - a.usageCount);

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">
        Your equipment library. Top 8 by usage appear as quick-add buttons.
      </p>

      {/* List */}
      <div className="space-y-1.5">
        {catalogue.length === 0 && (
          <p className="text-xs text-slate-400 italic py-2">No equipment saved yet.</p>
        )}
        {sorted.map((item, idx) => (
          <div
            key={item.id}
            className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
          >
            {/* Usage rank badge for top 8 */}
            {idx < 8 && item.usageCount > 0 && (
              <span className="shrink-0 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                <TrendingUp className="w-3 h-3" />
                {idx + 1}
              </span>
            )}

            <input
              type="text"
              value={item.name}
              onChange={(e) => onUpdate(item.id, { name: e.target.value })}
              aria-label="Equipment name"
              title="Equipment name"
              className="flex-1 min-w-0 text-sm font-medium text-slate-800 bg-transparent border-none outline-none focus:bg-white focus:border focus:border-slate-200 focus:rounded px-1 py-0.5 transition-all"
            />

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-slate-400">R</span>
              <input
                type="number"
                value={item.rate}
                onChange={(e) => {
                  const r = parseFloat(e.target.value);
                  if (!isNaN(r) && r > 0) onUpdate(item.id, { rate: r });
                }}
                aria-label="Daily rate"
                title="Daily rate"
                className="w-24 text-sm text-right text-slate-700 bg-transparent border-none outline-none focus:bg-white focus:border focus:border-slate-200 focus:rounded px-1 py-0.5 transition-all"
              />
            </div>

            {item.usageCount > 0 && (
              <span className="text-[10px] text-slate-400 shrink-0">
                ×{item.usageCount}
              </span>
            )}

            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="shrink-0 p-1 text-slate-400 hover:text-red-500 transition-colors"
              title="Remove"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Equipment name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
        />
        <div className="relative">
          <span className="absolute left-2.5 top-2 text-slate-400 text-sm">R</span>
          <input
            type="number"
            placeholder="Rate"
            value={newRate}
            onChange={(e) => setNewRate(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="w-28 pl-7 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newName.trim() || !newRate}
          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg transition-colors"
          title="Add to catalogue"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
