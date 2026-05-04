import React from 'react';
import type { CompanyProfile } from '../../types';

interface CompanyTabProps {
  profile: CompanyProfile;
  onChange: (profile: CompanyProfile) => void;
}

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) => (
  <div>
    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
      {label}
    </label>
    {multiline ? (
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
      />
    )}
  </div>
);

export const CompanyTab: React.FC<CompanyTabProps> = ({ profile, onChange }) => {
  const update = (field: keyof CompanyProfile, value: string) =>
    onChange({ ...profile, [field]: value });

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">
        Appears in the app header and on printed invoices. All fields optional.
      </p>
      <Field
        label="Company Name"
        value={profile.name}
        onChange={(v) => update('name', v)}
        placeholder="e.g. PMG Plant Hire (Pty) Ltd"
      />
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Registration No."
          value={profile.registration}
          onChange={(v) => update('registration', v)}
          placeholder="e.g. 2019/123456/07"
        />
        <Field
          label="VAT Number"
          value={profile.vatNumber}
          onChange={(v) => update('vatNumber', v)}
          placeholder="e.g. 4123456789"
        />
      </div>
      <Field
        label="Address"
        value={profile.address}
        onChange={(v) => update('address', v)}
        placeholder="Street, City, Province, Code"
        multiline
      />
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Phone"
          value={profile.phone}
          onChange={(v) => update('phone', v)}
          placeholder="e.g. 012 345 6789"
        />
        <Field
          label="Email"
          value={profile.email}
          onChange={(v) => update('email', v)}
          placeholder="e.g. info@pmg.co.za"
        />
      </div>
    </div>
  );
};
