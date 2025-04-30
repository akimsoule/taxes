import Papa from 'papaparse';
import { 
  Record, 
  Receipt, 
  Travel, 
  Activity, 
  Category, 
  Bank, 
  DataType
} from '../types/models';

interface ParseOptions {
  onComplete: (results: any[]) => void;
  onError: (error: string) => void;
}

export const parseCSV = (file: File, dataType: DataType, options: ParseOptions) => {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    complete: (results) => {
      if (results.errors && results.errors.length > 0) {
        options.onError(`Error parsing CSV: ${results.errors[0].message}`);
        return;
      }
      
      try {
        const parsedData = validateAndTransformData(results.data, dataType);
        options.onComplete(parsedData);
      } catch (error) {
        options.onError(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    error: (error) => {
      options.onError(`Error parsing CSV: ${error.message}`);
    }
  });
};

const validateAndTransformData = (data: any[], dataType: DataType): any[] => {
  if (!data || data.length === 0) {
    throw new Error('No data found in CSV file');
  }
  
  // Basic validation based on data type
  switch(dataType) {
    case 'records':
      return validateRecords(data);
    case 'receipts':
      return validateReceipts(data);
    case 'travels':
      return validateTravels(data);
    case 'activities':
      return validateActivities(data);
    case 'categories':
      return validateCategories(data);
    case 'banks':
      return validateBanks(data);
    default:
      throw new Error(`Unknown data type: ${dataType}`);
  }
};

const validateRecords = (data: any[]): Record[] => {
  return data.map((item, index) => {
    if (!item.id || !item.description || !item.date || item.amount === undefined || 
        !item.currency || item.deductible === undefined || !item.categoryId || 
        !item.activityId || !item.bankId) {
      throw new Error(`Invalid record data at row ${index + 1}`);
    }
    
    return {
      id: String(item.id),
      description: String(item.description),
      date: String(item.date),
      amount: Number(item.amount),
      currency: String(item.currency),
      deductible: Boolean(item.deductible),
      deductibleAmount: item.deductibleAmount ? Number(item.deductibleAmount) : undefined,
      categoryId: String(item.categoryId),
      activityId: String(item.activityId),
      receiptId: item.receiptId ? String(item.receiptId) : undefined,
      bankId: String(item.bankId)
    };
  });
};

const validateReceipts = (data: any[]): Receipt[] => {
  return data.map((item, index) => {
    if (!item.id || !item.date || !item.merchant || item.total === undefined || 
        !item.currency || !item.userId) {
      throw new Error(`Invalid receipt data at row ${index + 1}`);
    }
    
    return {
      id: String(item.id),
      date: String(item.date),
      merchant: String(item.merchant),
      total: Number(item.total),
      currency: String(item.currency),
      imageUrl: item.imageUrl ? String(item.imageUrl) : undefined,
      ocrRawData: item.ocrRawData ? String(item.ocrRawData) : undefined,
      taxAmount: item.taxAmount ? Number(item.taxAmount) : undefined,
      paymentMethod: item.paymentMethod ? String(item.paymentMethod) : undefined,
      userId: String(item.userId),
      recordId: item.recordId ? String(item.recordId) : undefined
    };
  });
};

const validateTravels = (data: any[]): Travel[] => {
  return data.map((item, index) => {
    if (!item.id || !item.date || item.distanceKm === undefined || 
        !item.origin || !item.destination || !item.userId || !item.activityId) {
      throw new Error(`Invalid travel data at row ${index + 1}`);
    }
    
    return {
      id: String(item.id),
      date: String(item.date),
      distanceKm: Number(item.distanceKm),
      origin: String(item.origin),
      destination: String(item.destination),
      notes: item.notes ? String(item.notes) : undefined,
      userId: String(item.userId),
      activityId: String(item.activityId)
    };
  });
};

const validateActivities = (data: any[]): Activity[] => {
  return data.map((item, index) => {
    if (!item.id || !item.name || !item.startDate || !item.userId) {
      throw new Error(`Invalid activity data at row ${index + 1}`);
    }
    
    return {
      id: String(item.id),
      name: String(item.name),
      startDate: String(item.startDate),
      endDate: item.endDate ? String(item.endDate) : undefined,
      userId: String(item.userId)
    };
  });
};

const validateCategories = (data: any[]): Category[] => {
  return data.map((item, index) => {
    if (!item.id || !item.name) {
      throw new Error(`Invalid category data at row ${index + 1}`);
    }

    return {
      id: String(item.id),
      name: String(item.name),
      createdAt: item.createdAt ? String(item.createdAt) : new Date().toISOString(),
      updatedAt: item.updatedAt ? String(item.updatedAt) : new Date().toISOString(),
    };
  });
};

const validateBanks = (data: any[]): Bank[] => {
  return data.map((item, index) => {
    if (!item.id || !item.name) {
      throw new Error(`Invalid bank data at row ${index + 1}`);
    }

    return {
      id: String(item.id),
      name: String(item.name),
      createdAt: item.createdAt ? String(item.createdAt) : new Date().toISOString(),
      updatedAt: item.updatedAt ? String(item.updatedAt) : new Date().toISOString(),
    };
  });
};