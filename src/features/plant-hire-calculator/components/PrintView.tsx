'use client';

import React from 'react';
import type { Equipment, DayType, InvoiceGroupData } from '../types';
import {
  calculatePeriods,
  getSAHolidays,
  calculateLineTotal,
  formatCurrency,
  formatDayRanges,
} from '../utils/calculations';
import type { InvoiceMeta } from './InvoiceHeader';

const VAT_RATE = 0.15;

interface PrintViewProps {
  equipment: Equipment[];
  currentMonth: Date;
  meta: InvoiceMeta;
  vatEnabled: boolean;
  onClose: () => void;
}

type LineItem = {
  dayType: string;
  days: number;
  rate: number;
  discount: number;
  total: number;
  ranges: string;
};

const buildGroups = (
  eq: Equipment,
  currentMonth: Date
): Record<number, InvoiceGroupData> => {
  const periods = calculatePeriods(eq.idleDays, currentMonth);
  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();
  const saHolidays = getSAHolidays(year);
  const groups: Record<number, InvoiceGroupData> = {};

  for (const period of periods) {
    const tierKey = period.tier.discount;
    if (!groups[tierKey]) {
      groups[tierKey] = {
        tier: period.tier,
        types: {
          WEEKDAYS: [],
          SATURDAYS: [],
          'SUNDAYS & PUBLIC HOLIDAYS': [],
        },
      };
    }
    for (let d = period.start; d <= period.end; d++) {
      const date = new Date(year, monthIndex, d);
      const isHol = saHolidays.some(
        (h) =>
          h.getDate() === d &&
          h.getMonth() === monthIndex &&
          h.getFullYear() === year
      );
      if (isHol || date.getDay() === 0) {
        groups[tierKey].types['SUNDAYS & PUBLIC HOLIDAYS'].push(d);
      } else if (date.getDay() === 6) {
        groups[tierKey].types.SATURDAYS.push(d);
      } else {
        groups[tierKey].types.WEEKDAYS.push(d);
      }
    }
  }
  return groups;
};

export const PrintView: React.FC<PrintViewProps> = ({
  equipment,
  currentMonth,
  meta,
  vatEnabled,
  onClose,
}) => {
  const typeOrder: DayType[] = [
    'WEEKDAYS',
    'SATURDAYS',
    'SUNDAYS & PUBLIC HOLIDAYS',
  ];

  const monthLabel = currentMonth.toLocaleDateString('en-ZA', {
    month: 'long',
    year: 'numeric',
  });

  const today = new Date().toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  let grandTotalExVat = 0;

  const sections = equipment
    .map((eq) => {
      const groups = buildGroups(eq, currentMonth);
      const lines: LineItem[] = [];
      let subtotal = 0;

      for (const tierKey of Object.keys(groups).sort(
        (a, b) => Number(a) - Number(b)
      )) {
        const group = groups[Number(tierKey)];
        for (const type of typeOrder) {
          const days = group.types[type];
          if (days.length === 0) continue;

          const rate =
            type === 'WEEKDAYS'
              ? eq.rates.weekday
              : type === 'SATURDAYS'
                ? eq.rates.saturday
                : eq.rates.sunday;
          const total = calculateLineTotal(days.length, rate, group.tier.discount);
          subtotal += total;
          lines.push({
            dayType: type,
            days: days.length,
            rate,
            discount: group.tier.discount,
            total,
            ranges: formatDayRanges(days),
          });
        }
      }

      grandTotalExVat += subtotal;
      return { name: eq.name, lines, subtotal };
    })
    .filter((s) => s.lines.length > 0);

  const vatAmount = vatEnabled ? grandTotalExVat * VAT_RATE : 0;
  const totalIncVat = grandTotalExVat + vatAmount;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #phc-invoice-doc, #phc-invoice-doc * { visibility: visible; }
          #phc-invoice-doc { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            box-shadow: none;
          }
          .no-print { display: none !important; }
          @page { margin: 18mm 20mm; size: A4; }
        }
        #phc-invoice-doc {
          font-family: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
        }
      `}</style>

      {/* Backdrop */}
      <div
        id="phc-print-root"
        className="fixed inset-0 z-50 overflow-y-auto bg-black/55"
      >
        {/* Floating action bar */}
        <div className="no-print sticky top-0 z-10 flex justify-end gap-2 px-6 py-3 bg-white/90 backdrop-blur border-b border-neutral-200 shadow-sm">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 text-sm font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Print / Save PDF
          </button>
        </div>

        {/* Page wrapper */}
        <div className="flex justify-center px-4 py-10">

          {/* Invoice document */}
          <div
            id="phc-invoice-doc"
            className="bg-white w-full max-w-3xl shadow-xl"
          >
            {/* ── Document header ── */}
            <div className="px-12 pt-12 pb-8">

              {/* Top row: title left, invoice number right */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-neutral-400 mb-1">
                    Payment Certificate
                  </p>
                  <h1 className="text-3xl font-bold tracking-tight text-neutral-900 leading-none">
                    Plant Hire
                  </h1>
                </div>
                <div className="text-right">
                  {meta.invoiceNumber ? (
                    <>
                      <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-neutral-400 mb-1">
                        Invoice No.
                      </p>
                      <p className="text-xl font-bold text-neutral-900 leading-none">
                        {meta.invoiceNumber}
                      </p>
                    </>
                  ) : null}
                  <p className="text-xs text-neutral-400 mt-2">{today}</p>
                </div>
              </div>

              {/* Hairline rule */}
              <div className="mt-8 border-t border-neutral-200" />

              {/* Meta row: billing period · client · PO */}
              <div className="mt-6 grid grid-cols-3 gap-6">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400 mb-1">
                    Billing Period
                  </p>
                  <p className="text-sm font-semibold text-neutral-800">{monthLabel}</p>
                </div>
                {meta.clientName && (
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400 mb-1">
                      Client
                    </p>
                    <p className="text-sm font-semibold text-neutral-800">{meta.clientName}</p>
                  </div>
                )}
                {meta.poReference && (
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400 mb-1">
                      PO / Reference
                    </p>
                    <p className="text-sm font-semibold text-neutral-800">{meta.poReference}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Line items ── */}
            <div className="px-12 pb-12">

              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-y border-neutral-900">
                    <th className="py-2.5 pr-3 text-left text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-500 w-[38%]">
                      Day Type / Dates
                    </th>
                    <th className="py-2.5 pr-3 text-right text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-500">
                      Days
                    </th>
                    <th className="py-2.5 pr-3 text-right text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-500">
                      Rate
                    </th>
                    <th className="py-2.5 pr-3 text-right text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-500">
                      Disc.
                    </th>
                    <th className="py-2.5 text-right text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-500">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sections.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-10 text-center text-sm text-neutral-400 italic"
                      >
                        No working days recorded for this period.
                      </td>
                    </tr>
                  ) : (
                    sections.map((section, si) => (
                      <React.Fragment key={si}>
                        {/* Equipment name row */}
                        <tr className="border-t border-neutral-200">
                          <td
                            colSpan={5}
                            className="pt-4 pb-1.5 text-sm font-bold text-neutral-900 tracking-tight"
                          >
                            {section.name}
                          </td>
                        </tr>

                        {/* Line item rows */}
                        {section.lines.map((line, li) => (
                          <tr
                            key={li}
                            className="border-b border-neutral-100"
                          >
                            {/* Day Type + Dates stacked in one column */}
                            <td className="py-3 pr-3 align-top">
                              <span className="block text-xs font-semibold text-neutral-700 whitespace-nowrap">
                                {line.dayType}
                              </span>
                              <span className="block text-xs text-neutral-400 mt-0.5">
                                {line.ranges}
                              </span>
                            </td>
                            <td className="py-3 pr-3 align-top text-right text-xs text-neutral-700">
                              {line.days}
                            </td>
                            <td className="py-3 pr-3 align-top text-right text-xs text-neutral-700 whitespace-nowrap">
                              {formatCurrency(line.rate)}
                            </td>
                            <td className="py-3 pr-3 align-top text-right text-xs text-neutral-500">
                              {line.discount > 0 ? `${line.discount}%` : '—'}
                            </td>
                            <td className="py-3 align-top text-right text-sm font-semibold text-neutral-900 whitespace-nowrap">
                              {formatCurrency(line.total)}
                            </td>
                          </tr>
                        ))}

                        {/* Per-machine subtotal */}
                        <tr className="border-b border-neutral-200">
                          <td
                            colSpan={4}
                            className="py-2 text-right text-xs text-neutral-400 italic pr-3"
                          >
                            {section.name} subtotal
                          </td>
                          <td className="py-2 text-right text-sm font-semibold text-neutral-700 whitespace-nowrap">
                            {formatCurrency(section.subtotal)}
                          </td>
                        </tr>

                        {/* Spacer between machines */}
                        {si < sections.length - 1 && (
                          <tr>
                            <td colSpan={5} className="py-2" />
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>

              {/* ── Totals block ── */}
              <div className="mt-8 flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-b border-neutral-200">
                    <span className="text-xs text-neutral-500">Sub-total (excl. VAT)</span>
                    <span className="text-sm font-medium text-neutral-800">
                      {formatCurrency(grandTotalExVat)}
                    </span>
                  </div>

                  {vatEnabled && (
                    <div className="flex justify-between py-2 border-b border-neutral-200">
                      <span className="text-xs text-neutral-500">VAT (15%)</span>
                      <span className="text-sm font-medium text-neutral-800">
                        {formatCurrency(vatAmount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between pt-3 mt-1 border-t-2 border-neutral-900">
                    <span className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                      Total{vatEnabled ? ' incl. VAT' : ''}
                    </span>
                    <span className="text-xl font-bold text-neutral-900">
                      {formatCurrency(vatEnabled ? totalIncVat : grandTotalExVat)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Compliance legend ── */}
              <div className="mt-12 pt-5 border-t border-neutral-200">
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-neutral-400 mb-1.5">
                  Discount Tiers
                </p>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Standard (0%): 1–4 continuous working days &nbsp;·&nbsp;
                  Silver (5%): 5–14 continuous working days &nbsp;·&nbsp;
                  Gold (10%): 15+ continuous working days
                </p>
                <p className="text-[11px] text-neutral-400 leading-relaxed mt-1">
                  Overtime: Saturday = Base + (5% × 1.5) &nbsp;·&nbsp;
                  Sunday / Public Holiday = Base + (5% × 2.0)
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};
