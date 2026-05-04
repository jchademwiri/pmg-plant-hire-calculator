'use client';

import React from 'react';
import { createPortal } from 'react-dom';import type { Equipment, DayType, InvoiceGroupData } from '../types';
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

  const portalRoot = typeof document !== 'undefined' ? document.body : null;

  const saveAsPdf = async () => {
    const el = document.getElementById('phc-invoice-doc');
    if (!el) return;

    // Dynamically import to avoid SSR issues
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas-pro'),
      import('jspdf'),
    ]);

    // Capture at 2× for retina sharpness
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * pageW) / canvas.width;

    let yOffset = 0;
    let remaining = imgH;

    // Slice the image across pages
    while (remaining > 0) {
      if (yOffset > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, -yOffset, imgW, imgH);
      yOffset += pageH;
      remaining -= pageH;
    }

    const invoiceId = meta.invoiceNumber
      ? `invoice-${meta.invoiceNumber}`
      : `plant-hire-${monthLabel.replace(/\s/g, '-').toLowerCase()}`;
    pdf.save(`${invoiceId}.pdf`);
  };

  const content = (
    <>
      <style>{`
        @media print {
          /* Hide everything on the page */
          body > * { display: none !important; }
          /* Show only our print root */
          body > #phc-print-root-portal { display: block !important; }
          /* Reset the document styles for print */
          #phc-invoice-doc {
            box-shadow: none !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          /* Hide overlay chrome */
          .no-print { display: none !important; }
          /* Page settings */
          @page {
            margin: 15mm 18mm;
            size: A4;
          }
          /* Page number footer — printed on every page */
          .print-page-footer {
            display: block !important;
            position: running(footer);
          }
          @page {
            @bottom-center {
              content: "Page " counter(page) " of " counter(pages);
              font-size: 9pt;
              color: #9ca3af;
              font-family: ui-sans-serif, system-ui, sans-serif;
            }
          }
        }
        #phc-invoice-doc {
          font-family: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
        }
        /* Fallback page number for browsers that don't support running() */
        @media print {
          .print-page-number {
            display: block;
            text-align: center;
            font-size: 9pt;
            color: #9ca3af;
            margin-top: 12pt;
            font-family: ui-sans-serif, system-ui, sans-serif;
          }
        }
        .print-page-number { display: none; }
      `}</style>

      {/* Portal root — direct child of body so print CSS can target it */}
      <div id="phc-print-root-portal" className="fixed inset-0 z-50 overflow-y-auto bg-black/55">

        {/* Floating action bar — hidden on print */}
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
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            title="Open print dialog — choose your printer"
          >
            Print
          </button>
          <button
            type="button"
            onClick={saveAsPdf}
            className="px-4 py-2 text-sm font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Save as PDF
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
            <div className="px-8 pt-8 pb-5">

              {/* Top row: title left, invoice number right */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-neutral-400 mb-1">
                    Payment Certificate
                  </p>
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-900 leading-none">
                    Plant Hire
                  </h1>
                </div>
                <div className="text-right">
                  {meta.invoiceNumber ? (
                    <>
                      <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-neutral-400 mb-1">
                        Invoice No.
                      </p>
                      <p className="text-lg font-bold text-neutral-900 leading-none">
                        {meta.invoiceNumber}
                      </p>
                    </>
                  ) : null}
                  <p className="text-xs text-neutral-400 mt-1.5">{today}</p>
                </div>
              </div>

              {/* Hairline rule */}
              <div className="mt-5 border-t border-neutral-200" />

              {/* Meta row: billing period · client · PO */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400 mb-0.5">
                    Billing Period
                  </p>
                  <p className="text-xs font-semibold text-neutral-800">{monthLabel}</p>
                </div>
                {meta.clientName && (
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400 mb-0.5">
                      Client
                    </p>
                    <p className="text-xs font-semibold text-neutral-800">{meta.clientName}</p>
                  </div>
                )}
                {meta.poReference && (
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400 mb-0.5">
                      PO / Reference
                    </p>
                    <p className="text-xs font-semibold text-neutral-800">{meta.poReference}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Line items ── */}
            <div className="px-8 pb-8">

              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-y border-neutral-900">
                    <th className="py-2 pr-3 text-left text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-500 w-[38%]">
                      Day Type / Dates
                    </th>
                    <th className="py-2 pr-3 text-right text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-500">
                      Days
                    </th>
                    <th className="py-2 pr-3 text-right text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-500">
                      Rate
                    </th>
                    <th className="py-2 pr-3 text-right text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-500">
                      Disc.
                    </th>
                    <th className="py-2 text-right text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-500">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sections.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-xs text-neutral-400 italic"
                      >
                        No working days recorded for this period.
                      </td>
                    </tr>
                  ) : (
                    sections.map((section, si) => (
                      <React.Fragment key={si}>
                        {/* Equipment name row */}
                        <tr className={si > 0 ? 'border-t-2 border-neutral-200' : 'border-t border-neutral-200'}>
                          <td
                            colSpan={5}
                            className="pt-2.5 pb-1 text-xs font-bold text-neutral-900 tracking-tight uppercase"
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
                            <td className="py-1.5 pr-3 align-top">
                              <span className="block text-xs font-semibold text-neutral-700 whitespace-nowrap">
                                {line.dayType}
                              </span>
                              <span className="block text-[11px] text-neutral-400 mt-0.5 leading-snug">
                                {line.ranges}
                              </span>
                            </td>
                            <td className="py-1.5 pr-3 align-top text-right text-xs text-neutral-700">
                              {line.days}
                            </td>
                            <td className="py-1.5 pr-3 align-top text-right text-xs text-neutral-700 whitespace-nowrap">
                              {formatCurrency(line.rate)}
                            </td>
                            <td className="py-1.5 pr-3 align-top text-right text-xs text-neutral-500">
                              {line.discount > 0 ? `${line.discount}%` : '—'}
                            </td>
                            <td className="py-1.5 align-top text-right text-xs font-semibold text-neutral-900 whitespace-nowrap">
                              {formatCurrency(line.total)}
                            </td>
                          </tr>
                        ))}

                        {/* Per-machine subtotal */}
                        <tr>
                          <td
                            colSpan={4}
                            className="py-1 text-right text-[11px] text-neutral-400 italic pr-3"
                          >
                            {section.name} subtotal
                          </td>
                          <td className="py-1 text-right text-xs font-bold text-neutral-700 whitespace-nowrap">
                            {formatCurrency(section.subtotal)}
                          </td>
                        </tr>
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>

              {/* ── Totals block ── */}
              <div className="mt-5 flex justify-end">
                <div className="w-60">
                  <div className="flex justify-between py-1.5 border-b border-neutral-200">
                    <span className="text-xs text-neutral-500">Sub-total (excl. VAT)</span>
                    <span className="text-xs font-medium text-neutral-800 whitespace-nowrap">
                      {formatCurrency(grandTotalExVat)}
                    </span>
                  </div>

                  {vatEnabled && (
                    <div className="flex justify-between py-1.5 border-b border-neutral-200">
                      <span className="text-xs text-neutral-500">VAT (15%)</span>
                      <span className="text-xs font-medium text-neutral-800 whitespace-nowrap">
                        {formatCurrency(vatAmount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between pt-2 mt-0.5 border-t-2 border-neutral-900">
                    <span className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                      Total{vatEnabled ? ' incl. VAT' : ''}
                    </span>
                    <span className="text-base font-bold text-neutral-900 whitespace-nowrap">
                      {formatCurrency(vatEnabled ? totalIncVat : grandTotalExVat)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Compliance legend ── */}
              <div className="mt-6 pt-4 border-t border-neutral-200">
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-neutral-400 mb-1">
                  Discount Tiers
                </p>
                <p className="text-[10px] text-neutral-400 leading-relaxed">
                  Standard (0%): 1–4 continuous working days &nbsp;·&nbsp;
                  Silver (5%): 5–14 continuous working days &nbsp;·&nbsp;
                  Gold (10%): 15+ continuous working days
                </p>
                <p className="text-[10px] text-neutral-400 leading-relaxed mt-0.5">
                  Overtime: Saturday = Base + (5% × 1.5) &nbsp;·&nbsp;
                  Sunday / Public Holiday = Base + (5% × 2.0)
                </p>
              </div>

              {/* Page number — visible only when printing */}
              <div className="print-page-number">
                Page <span className="phc-page-num" /> of <span className="phc-page-count" />
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (!portalRoot) return null;
  return createPortal(content, portalRoot);
};
