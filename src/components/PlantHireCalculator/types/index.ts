export interface Rates {
  weekday: number;
  saturday: number;
  sunday: number;
}

export interface Equipment {
  id: string;
  name: string;
  rates: Rates;
  idleDays: Date[];
}

export interface DiscountTier {
  discount: number;
  label: string;
  color: string;
  bg: string;
  borderColor: string;
}

export interface Period {
  start: number;
  end: number;
  length: number;
  tier: DiscountTier;
}

export type DayType = 'WEEKDAYS' | 'SATURDAYS' | 'SUNDAYS & PUBLIC HOLIDAYS';

export interface InvoiceGroupData {
  tier: DiscountTier;
  types: Record<DayType, number[]>;
}

export interface EquipmentPreset {
  name: string;
  rate: number;
}
