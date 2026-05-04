import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Client } from '../../types';

interface ClientsTabProps {
  clients: Client[];
  onAdd: (client: Omit<Client, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Omit<Client, 'id'>>) => void;
  onRemove: (id: string) => void;
}

const emptyForm = (): Omit<Client, 'id'> => ({
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  poPrefix: '',
});

export const ClientsTab: React.FC<ClientsTabProps> = ({
  clients,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  const [form, setForm] = useState(emptyForm());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (!form.name.trim()) return;
    onAdd(form);
    setForm(emptyForm());
    setShowForm(false);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">
        Saved clients appear in the invoice header dropdown. All fields optional except name.
      </p>

      {/* Existing clients */}
      <div className="space-y-2">
        {clients.length === 0 && (
          <p className="text-xs text-slate-400 italic py-2">No clients saved yet.</p>
        )}
        {clients.map((client) => (
          <div key={client.id} className="border border-slate-200 rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between px-3 py-2 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => setExpandedId(expandedId === client.id ? null : client.id)}
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">{client.name}</p>
                {client.contactPerson && (
                  <p className="text-xs text-slate-400">{client.contactPerson}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(client.id); }}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  title="Remove client"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {expandedId === client.id
                  ? <ChevronUp className="w-4 h-4 text-slate-400" />
                  : <ChevronDown className="w-4 h-4 text-slate-400" />
                }
              </div>
            </div>

            {expandedId === client.id && (
              <div className="px-3 py-3 space-y-2 bg-white">
                {(
                  [
                    { field: 'name', label: 'Client Name', placeholder: 'e.g. City of Tshwane' },
                    { field: 'contactPerson', label: 'Contact Person', placeholder: 'e.g. John Smith' },
                    { field: 'email', label: 'Email', placeholder: 'e.g. john@tshwane.gov.za' },
                    { field: 'phone', label: 'Phone', placeholder: 'e.g. 012 358 8911' },
                    { field: 'address', label: 'Address', placeholder: 'Billing address' },
                    { field: 'poPrefix', label: 'PO Prefix', placeholder: 'e.g. TW- (auto-fills PO field)' },
                  ] as { field: keyof Omit<Client, 'id'>; label: string; placeholder: string }[]
                ).map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={client[field]}
                      onChange={(e) => onUpdate(client.id, { [field]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new client */}
      {showForm ? (
        <div className="border border-emerald-200 rounded-lg p-3 bg-emerald-50/40 space-y-2">
          <p className="text-xs font-semibold text-slate-600">New Client</p>
          {(
            [
              { field: 'name', label: 'Client Name *', placeholder: 'e.g. City of Tshwane' },
              { field: 'contactPerson', label: 'Contact Person', placeholder: 'e.g. John Smith' },
              { field: 'email', label: 'Email', placeholder: '' },
              { field: 'phone', label: 'Phone', placeholder: '' },
              { field: 'address', label: 'Address', placeholder: '' },
              { field: 'poPrefix', label: 'PO Prefix', placeholder: 'e.g. TW-' },
            ] as { field: keyof Omit<Client, 'id'>; label: string; placeholder: string }[]
          ).map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
                {label}
              </label>
              <input
                type="text"
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!form.name.trim()}
              className="flex-1 py-1.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg transition-colors"
            >
              Save Client
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(emptyForm()); }}
              className="px-4 py-1.5 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-emerald-700 border border-dashed border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      )}
    </div>
  );
};
