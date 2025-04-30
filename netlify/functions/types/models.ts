export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  userId: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bank {
  id: string;
  name: string;
}

export interface Record {
  id: string;
  description: string;
  date: string;
  amount: number;
  currency: string;
  deductible: boolean;
  deductibleAmount?: number;
  categoryId: string;
  activityId: string;
  receiptId?: string;
  bankId: string;
}

export interface Receipt {
  id: string;
  date: string;
  merchant: string;
  total: number;
  currency: string;
  imageUrl?: string;
  ocrRawData?: string;
  taxAmount?: number;
  paymentMethod?: string;
  userId: string;
  recordId?: string;
}

export interface Travel {
  id: string;
  date: string;
  distanceKm: number;
  origin: string;
  destination: string;
  notes?: string;
  userId: string;
  activityId: string;
}

export type DataType = 'records' | 'receipts' | 'travels' | 'activities' | 'categories' | 'banks';

export interface DataState {
  records: Record[];
  receipts: Receipt[];
  travels: Travel[];
  activities: Activity[];
  categories: Category[];
  banks: Bank[];
}