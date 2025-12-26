// Shared types for the mobile app
export interface MedicalItem {
  id: number;
  category: string;
  name: string;
  price: number;
}

export interface BillItem {
  id: string;
  medicalItem: MedicalItem;
  quantity: number;
  category: string;
  sessionId: string;
  type: 'outpatient' | 'inpatient';
  dosageInfo?: DosageInfo;
  xrayInfo?: XrayInfo;
}

export interface DosageInfo {
  dose: number;
  medType: string;
  frequency: string;
  days: number;
  totalQuantity: number;
  calculatedPrice: number;
}

export interface XrayInfo {
  view: string;
  films: number;
  isOffCharge: boolean;
  isPortable: boolean;
}

export type BillType = 'outpatient' | 'inpatient';

export interface CategoryTotal {
  category: string;
  total: number;
  itemCount: number;
}