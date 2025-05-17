// Payloads (pour les requêtes)
export interface UserPayload {
  email: string;
  name: string;
  picture?: string;
}

export interface ActivityPayload {
  name: string;
  startDate: string;
  endDate?: string;
  userEmail: string;
}

export interface CategoryPayload {
  name: string;
}

export interface MerchantPayload {
  name: string;
}

export interface BankPayload {
  name: string;
}

export interface RecordPayload {
  description: string;
  date: string;
  amount: number;
  currency: string;
  deductible: boolean;
  deductibleAmount?: number;
  categoryName: string;
  activityName?: string;
  cashBack?: number;
  bankName: string;
  userEmail: string;
  resourceId?: string;
}

export interface ReceiptPayload {
  date: string;
  total: number;
  currency: string;
  taxAmount?: number;
  paymentMethod?: string;
  userEmail: string;
  merchantName: string;
  recordId?: string;
}

export interface TravelPayload {
  date: string;
  distanceKm: number;
  origin: string;
  destination: string;
  notes?: string;
  userEmail: string;
  activityId: string;
  resourceId?: string;
}

export interface ResourcePayload {
  type: ResourceType;
  fileName?: string;
  fileType?: string;
  fileLink?: string;
  ocrRawData?: string;
  description?: string;
  userEmail: string;
  parentId?: string;
  isArchived: boolean;
}

// Responses (pour les réponses)
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  picture?: string;
  createdAt: string;
  updatedAt: string;
  activities: ActivityResponse[];
  records: RecordResponse[];
  receipts: ReceiptResponse[];
  travels: TravelResponse[];
  resources: ResourceResponse[];
}

export interface ActivityResponse {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  userEmail: string;
  user: UserResponse;
  records: RecordResponse[];
  travels: TravelResponse[];
}

export interface CategoryResponse {
  id: string;
  name: string;
  records: RecordResponse[];
}

export interface MerchantResponse {
  id: string;
  name: string;
  receipts: ReceiptResponse[];
}

export interface BankResponse {
  id: string;
  name: string;
  records: RecordResponse[];
}

export interface RecordResponse {
  id: string;
  description: string;
  date: string;
  amount: number;
  currency: string;
  deductible: boolean;
  deductibleAmount?: number;
  categoryName: string;
  category: CategoryResponse;
  activityName?: string;
  activity?: ActivityResponse;
  receipt?: ReceiptResponse;
  cashBack?: number;
  bankName: string;
  bank: BankResponse;
  userEmail: string;
  user: UserResponse;
  resourceId?: string;
  resource?: ResourceResponse;
}

export interface ReceiptResponse {
  id: string;
  date: string;
  total: number;
  currency: string;
  taxAmount?: number;
  paymentMethod?: string;
  userEmail: string;
  user: UserResponse;
  merchantName: string;
  merchant: MerchantResponse;
  recordId?: string;
  record?: RecordResponse;
}

export interface TravelResponse {
  id: string;
  date: string;
  distanceKm: number;
  origin: string;
  destination: string;
  notes?: string;
  userEmail: string;
  user: UserResponse;
  activityId: string;
  activity: ActivityResponse;
  resourceId?: string;
  resource?: ResourceResponse;
}

export interface ResourceResponse {
  id: string;
  type: ResourceType;
  fileName?: string;
  fileType?: string;
  fileLink?: string;
  ocrRawData?: string;
  uploadedAt: string;
  description?: string;
  userEmail: string;
  user: UserResponse;
  parentId?: string;
  parent?: ResourceResponse;
  children: ResourceResponse[];
  record?: RecordResponse;
  travel?: TravelResponse;
  isArchived: boolean;
}

// Enum pour les types de ressources
export enum ResourceType {
  INVOICE = "INVOICE",
  RECEIPT = "RECEIPT",
  TRAVEL = "TRAVEL",
  OTHER = "OTHER",
  BANK_STATEMENT = "BANK_STATEMENT",
  PAYSLIP = "PAYSLIP",
  CONTRACT = "CONTRACT",
  IDENTITY_DOCUMENT = "IDENTITY_DOCUMENT",
  INSURANCE_POLICY = "INSURANCE_POLICY",
  WARRANTY = "WARRANTY",
  CERTIFICATE = "CERTIFICATE",
  MEDICAL_RECORD = "MEDICAL_RECORD",
  TAX_DOCUMENT = "TAX_DOCUMENT",
  LEGAL_DOCUMENT = "LEGAL_DOCUMENT",
  PROPERTY_DOCUMENT = "PROPERTY_DOCUMENT",
  VEHICLE_DOCUMENT = "VEHICLE_DOCUMENT",
  EDUCATIONAL_DOCUMENT = "EDUCATIONAL_DOCUMENT",
}

// DataType et DataState (inchangés)
export type DataType =
  | "users"
  | "records"
  | "travels"
  | "activities"
  | "categories"
  | "merchants"
  | "banks"
  | "resources";

export interface DataState {
  users: {
    items: UserResponse[];
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  };
  records: {
    items: RecordResponse[];
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  };
  travels: {
    items: TravelResponse[];
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  };
  activities: {
    items: ActivityResponse[];
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  };
  resources: {
    items: ResourceResponse[];
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  };
  categories: {
    items: CategoryResponse[];
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  };
  merchants: {
    items: MerchantResponse[];
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  };
  banks: {
    items: BankResponse[];
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  };
}
