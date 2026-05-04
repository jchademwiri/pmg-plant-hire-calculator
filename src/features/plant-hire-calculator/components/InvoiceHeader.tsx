import React, { useState, useRef, useEffect } from 'react';
import { FileText, ChevronDown } from 'lucide-react';
import type { Client } from '../types';

export interface InvoiceMeta {
  clientName: string;
  invoiceNumber: string;
  poReference: string;
}

interface InvoiceHeaderProps {
  meta: InvoiceMeta;
  onChange: (meta: InvoiceMeta) => void;
  clients?: Client[];
  onOpenClientSettings?: () => void;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  meta,
  onChange,
  clients = [],
  onOpenClientSettings,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const update = (field: keyof InvoiceMeta, value: string) => {
    onChange({ ...meta, [field]: value });
  };

  const selectClient = (client: Client) => {
    onChange({
      ...meta,
      clientName: client.name,
      poReference: client.poPrefix
        ? client.poPrefix
        : meta.poReference,
    });
    setDropdownOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="bg-white rounded-xl px-5 py-4 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice Details</span>
          <span className="text-[10px] text-slate-400">(optional)</span>
        </div>

        {/* Client dropdown — only shown if clients exist */}
        {clients.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Select Client
              <ChevronDown className="w-3 h-3" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                <div className="max-h-48 overflow-y-auto">
                  {clients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => selectClient(client)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <p className="text-sm font-semibold text-slate-800">{client.name}</p>
                      {client.contactPerson && (
                        <p className="text-xs text-slate-400">{client.contactPerson}</p>
                      )}
                    </button>
                  ))}
                </div>
                {onOpenClientSettings && (
                  <>
                    <div className="border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={() => { setDropdownOpen(false); onOpenClientSettings(); }}
                      className="w-full text-left px-4 py-2.5 text-xs text-emerald-600 font-semibold hover:bg-emerald-50 transition-colors"
                    >
                      + Manage clients
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Client / Municipality
          </label>
          <input
            type="text"
            placeholder="e.g. City of Tshwane"
            value={meta.clientName}
            onChange={(e) => update('clientName', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Invoice Number
          </label>
          <input
            type="text"
            placeholder="e.g. INV-2025-047"
            value={meta.invoiceNumber}
            onChange={(e) => update('invoiceNumber', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
            PO / Reference
          </label>
          <input
            type="text"
            placeholder="e.g. PO-0042-TW"
            value={meta.poReference}
            onChange={(e) => update('poReference', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
      </div>
    </div>
  );
};
