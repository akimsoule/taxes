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
  date: string;
  amount: number;
  currency: string;
  deductible: boolean;
  deductibleAmount?: number;
  categoryId: string;
  activityId?: string;
  receiptId?: string;
  cashBack?: number;
  bankId: string;
}

export interface ReceiptImage {
  id: string;
  receiptId?: string; // Référence au reçu associé
  imageUrl: string;
  ocrRawData?: string; // Données OCR extraites de l'image
  uploadedAt: string; // Date d'upload de l'image
}

export interface Receipt {
  id: string;
  date: string;
  merchant: string;
  total: number;
  currency: string;
  taxAmount?: number;
  paymentMethod?: string;
  userId: string;
  recordId?: string;
  images?: ReceiptImage[]; // Liste des images associées au reçu
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

export type DataType =
  | "records"
  | "receipts"
  | "receiptImages"
  | "travels"
  | "activities"
  | "categories"
  | "merchants"
  | "banks";

export interface DataState {
  records: Record[];
  receipts: Receipt[];
  travels: Travel[];
  activities: Activity[];
  receiptImages: ReceiptImage[]; // Ajout pour les images des reçus
  categories: Category[];
  merchants: Merchant[];
  banks: Bank[];
}
