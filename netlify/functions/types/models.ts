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
  userEmail: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Merchant {
  id: string;
  name: string;
}

export interface Bank {
  id: string;
  name: string;
}

export interface Record {
  id: string;
  description: string;
  date: Date;
  amount: number;
  currency: string;
  deductible: boolean;
  deductibleAmount?: number;
  categoryName: string;
  activityName?: string;
  cashBack?: number;
  bankName: string;
  userEmail: string;
}

export interface Image {
  id: string;
  base64: string;
  fileName: string;
  fileType: string;
  ocrRawData: string;
  uploadedAt: string;
  userEmail: string;
}

export interface Receipt {
  id: string;
  date: string;
  total: number;
  currency: string;
  taxAmount?: number;
  paymentMethod?: string;
  userEmail: string;
  merchantName: string;
  recordId?: string;
  imageId?: string;
}

export interface Travel {
  id: string;
  date: string;
  distanceKm: number;
  origin: string;
  destination: string;
  notes?: string;
  userEmail: string;
  activityName: string;
}

export interface Page {
  id: string;
  ocrRawData?: string;
  uploadedAt: string;
  docId: string;
  imageId?: string;
}

export interface Doc {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  userEmail: string;
  pages: Page[];
}

export type DataType =
  | "users"
  | "records"
  | "receipts"
  | "docs"
  | "images"
  | "travels"
  | "activities"
  | "categories"
  | "merchants"
  | "banks";

export interface DataState {
  users: User[];
  records: Record[];
  receipts: Receipt[];
  docs: Doc[];
  travels: Travel[];
  activities: Activity[];
  images: Image[];
  categories: Category[];
  merchants: Merchant[];
  banks: Bank[];
}
