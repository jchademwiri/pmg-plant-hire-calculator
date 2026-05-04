'use client';

import React, { useEffect, useState } from 'react';
import {
  EquipmentCard,
  AddEquipmentForm,
  RatesConfig,
  InvoiceHeader,
  GrandTotalFooter,
  EmptyState,
  CalculationRules,
  PrintView,
} from './components';
import type { InvoiceMeta } from './components';
import { useEquipmentManager, useGrandTotal } from './hooks';
import { EQUIPMENT_PRESETS } from './utils/constants';
import type { EquipmentPreset } from './types';

const META_KEY = 'phc-invoice-meta-v1';

const defaultMeta = (): InvoiceMeta => ({
  clientName: '',
  invoiceNumber: '',
  poReference: '',
});

const PlantHireCalculator: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [hasLoadedMonthFromStorage, setHasLoadedMonthFromStorage] = useState(false);
  const [vatEnabled, setVatEnabled] = useState(false);
  const [hasLoadedVatFromStorage, setHasLoadedVatFromStorage] = useState(false);
  const [invoiceMeta, setInvoiceMeta] = useState<InvoiceMeta>(defaultMeta());
  const [hasLoadedMetaFromStorage, setHasLoadedMetaFromStorage] = useState(false);
  const [newEquipmentName, setNewEquipmentName] = useState('');
  const [newDailyRate, setNewDailyRate] = useState('');
  const [activeRateEquipmentId, setActiveRateEquipmentId] = useState('');
  const [showRatesPanel, setShowRatesPanel] = useState(false);
  const [showPrint, setShowPrint] = useState(false);

  const {
    equipment,
    addEquipment,
    removeEquipment,
    duplicateEquipment,
    clearMonthIdleDays,
    updateIdleDays,
    updateRates,
  } = useEquipmentManager();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('phc-month-v1');
      if (saved) {
        const d = new Date(saved);
        if (!isNaN(d.getTime())) {
          setCurrentMonth(d);
        }
      }
    } catch {
      // ignore
    } finally {
      setHasLoadedMonthFromStorage(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedMonthFromStorage) return;
    try {
      localStorage.setItem('phc-month-v1', currentMonth.toISOString());
    } catch {
      // ignore
    }
  }, [currentMonth, hasLoadedMonthFromStorage]);

  const grandTotal = useGrandTotal(equipment, currentMonth);
  const activeRateEquipment = equipment.find((item) => item.id === activeRateEquipmentId);

  const handleAddEquipment = (e: React.FormEvent) => {
    e?.preventDefault();
    addEquipment(newEquipmentName, newDailyRate);
    setNewEquipmentName('');
    setNewDailyRate('');
  };

  const handlePresetSelect = (preset: EquipmentPreset) => {
    setNewEquipmentName(preset.name);
    setNewDailyRate(preset.rate.toString());
  };

  const handleNewMonth = () => {
    clearMonthIdleDays(currentMonth);
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  };

  const nextMonthLabel = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    1
  ).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' });

  useEffect(() => {
    try {
      const savedVat = localStorage.getItem('phc-vat-v1');
      if (savedVat === 'true') setVatEnabled(true);
    } catch {
      // ignore
    } finally {
      setHasLoadedVatFromStorage(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedVatFromStorage) return;
    try {
      localStorage.setItem('phc-vat-v1', vatEnabled ? 'true' : 'false');
    } catch {
      // ignore
    }
  }, [vatEnabled, hasLoadedVatFromStorage]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(META_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<InvoiceMeta>;
        setInvoiceMeta({
          clientName: typeof parsed.clientName === 'string' ? parsed.clientName : '',
          invoiceNumber: typeof parsed.invoiceNumber === 'string' ? parsed.invoiceNumber : '',
          poReference: typeof parsed.poReference === 'string' ? parsed.poReference : '',
        });
      }
    } catch {
      // ignore
    } finally {
      setHasLoadedMetaFromStorage(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedMetaFromStorage) return;
    try {
      localStorage.setItem(META_KEY, JSON.stringify(invoiceMeta));
    } catch {
      // ignore
    }
  }, [invoiceMeta, hasLoadedMetaFromStorage]);

  useEffect(() => {
    if (equipment.length === 0) {
      setActiveRateEquipmentId('');
      return;
    }
    const selectedStillExists = equipment.some((item) => item.id === activeRateEquipmentId);
    if (!selectedStillExists) {
      setActiveRateEquipmentId(equipment[0].id);
    }
  }, [equipment, activeRateEquipmentId]);

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-slate-50 to-teal-50 p-3 md:p-6 font-sans text-slate-800">
      {showPrint && (
        <PrintView
          equipment={equipment}
          currentMonth={currentMonth}
          meta={invoiceMeta}
          vatEnabled={vatEnabled}
          onClose={() => setShowPrint(false)}
        />
      )}
      <div className="max-w-5xl mx-auto space-y-5 md:space-y-6">
        {showRatesPanel && activeRateEquipment && (
          <div className="fixed inset-0 z-40">
            <button
              aria-label="Close rates panel overlay"
              className="absolute inset-0 bg-black/25"
              onClick={() => setShowRatesPanel(false)}
            />
            <div className="absolute top-4 right-4 w-[360px] max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-xl shadow-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Rates Config</h3>
                <button
                  onClick={() => setShowRatesPanel(false)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Close
                </button>
              </div>
              <p className="mb-2 text-[11px] text-slate-500">
                Editing: <span className="font-semibold text-slate-700">{activeRateEquipment.name}</span>
              </p>
              <RatesConfig
                rates={activeRateEquipment.rates}
                onRatesChange={(newRates) => updateRates(activeRateEquipment.id, newRates)}
              />
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-emerald-700 to-teal-600 mb-1.5">
              Plant Hire Calculator
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Strict period discounting · South Africa
              <span className="ml-3 inline-flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Auto-saved
              </span>
            </p>
          </div>
          {activeRateEquipment && (
            <button
              onClick={() => setShowRatesPanel(true)}
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs md:text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Configure Rates
            </button>
          )}
        </div>

        <InvoiceHeader meta={invoiceMeta} onChange={setInvoiceMeta} />

        {/* Add Equipment Form */}
        <AddEquipmentForm
          equipmentName={newEquipmentName}
          dailyRate={newDailyRate}
          presets={EQUIPMENT_PRESETS}
          onEquipmentNameChange={setNewEquipmentName}
          onDailyRateChange={setNewDailyRate}
          onSubmit={handleAddEquipment}
          onPresetSelect={handlePresetSelect}
        />

        {/* Equipment List */}
        <div className="space-y-4">
          {equipment.length === 0 ? (
            <EmptyState />
          ) : (
            equipment.map((item) => (
              <EquipmentCard 
                key={item.id} 
                item={item} 
                currentMonth={currentMonth}
                isActive={item.id === activeRateEquipmentId}
                onSelect={() => setActiveRateEquipmentId(item.id)}
                onRemove={() => removeEquipment(item.id)}
                onDuplicate={() => duplicateEquipment(item.id)}
                onUpdateIdleDays={(days) => updateIdleDays(item.id, days)}
                onMonthChange={setCurrentMonth}
              />
            ))
          )}
        </div>

        {/* Grand Total Footer */}
        {equipment.length > 0 && (
          <GrandTotalFooter 
            total={grandTotal}
            equipmentCount={equipment.length}
            currentMonth={currentMonth}
            vatEnabled={vatEnabled}
            onVatToggle={() => setVatEnabled((v) => !v)}
            onNewMonth={handleNewMonth}
            nextMonthLabel={nextMonthLabel}
            onPrint={() => setShowPrint(true)}
          />
        )}

        {/* Calculation Rules */}
        <CalculationRules />

      </div>
    </div>
  );
};

export default PlantHireCalculator;
