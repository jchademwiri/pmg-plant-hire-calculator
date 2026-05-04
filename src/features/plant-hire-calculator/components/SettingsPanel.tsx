import React, { useState } from 'react';
import { X, Building2, Users, Wrench } from 'lucide-react';
import type { CompanyProfile, Client, CatalogueItem } from '../types';
import { CompanyTab } from './settings/CompanyTab';
import { ClientsTab } from './settings/ClientsTab';
import { CatalogueTab } from './settings/CatalogueTab';

type Tab = 'company' | 'clients' | 'catalogue';

interface SettingsPanelProps {
  // Company
  profile: CompanyProfile;
  onProfileChange: (p: CompanyProfile) => void;
  // Clients
  clients: Client[];
  onAddClient: (c: Omit<Client, 'id'>) => void;
  onUpdateClient: (id: string, updates: Partial<Omit<Client, 'id'>>) => void;
  onRemoveClient: (id: string) => void;
  // Catalogue
  catalogue: CatalogueItem[];
  onAddCatalogueItem: (name: string, rate: number) => void;
  onUpdateCatalogueItem: (id: string, updates: Partial<Pick<CatalogueItem, 'name' | 'rate'>>) => void;
  onRemoveCatalogueItem: (id: string) => void;
  // Panel
  onClose: () => void;
  initialTab?: Tab;
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'company', label: 'Company', icon: <Building2 className="w-3.5 h-3.5" /> },
  { id: 'clients', label: 'Clients', icon: <Users className="w-3.5 h-3.5" /> },
  { id: 'catalogue', label: 'Equipment', icon: <Wrench className="w-3.5 h-3.5" /> },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  profile,
  onProfileChange,
  clients,
  onAddClient,
  onUpdateClient,
  onRemoveClient,
  catalogue,
  onAddCatalogueItem,
  onUpdateCatalogueItem,
  onRemoveCatalogueItem,
  onClose,
  initialTab = 'company',
}) => {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close settings"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'clients' && clients.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-500 rounded-full">
                  {clients.length}
                </span>
              )}
              {tab.id === 'catalogue' && catalogue.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-500 rounded-full">
                  {catalogue.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {activeTab === 'company' && (
            <CompanyTab profile={profile} onChange={onProfileChange} />
          )}
          {activeTab === 'clients' && (
            <ClientsTab
              clients={clients}
              onAdd={onAddClient}
              onUpdate={onUpdateClient}
              onRemove={onRemoveClient}
            />
          )}
          {activeTab === 'catalogue' && (
            <CatalogueTab
              catalogue={catalogue}
              onAdd={onAddCatalogueItem}
              onUpdate={onUpdateCatalogueItem}
              onRemove={onRemoveCatalogueItem}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
          <p className="text-[10px] text-slate-400 text-center">
            All changes save automatically to your browser
          </p>
        </div>
      </div>
    </div>
  );
};
