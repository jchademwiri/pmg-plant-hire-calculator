import React from 'react';
import { Calculator } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-20 bg-white/50 border-2 border-dashed border-slate-300 rounded-2xl">
      <Calculator className="w-16 h-16 text-slate-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-slate-500">No equipment added yet</h3>
      <p className="text-slate-400">Add a machine above to start calculating</p>
    </div>
  );
};
