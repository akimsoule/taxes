import { createContext, useContext, useState, ReactNode } from "react";
import {
  DataState,
  DataType,
  RecordPayload,
  ResourcePayload,
  ResourceType,
} from "../types/models";
import { initialDataState } from "../constants/initialDataState";
import { useAuth } from "@workos-inc/authkit-react";
import cv from "@techstark/opencv-js";
import { recognize } from "tesseract.js";

const apiUrl = "/api/action";
const initializeUrl = "/api/initialize";
const resourceApiUrl = "/api/resource";
const proxyUrl = "/api/proxy";
const tokenUrl = "/api/token";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_KEY || "RECAPTCHA_SITE_KEY";

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
    addEntities(parsedRecords: RecordPayload[]): Promise<void>;
    addEntities(parsedRecords: RecordPayload[]): Promise<void>;
    addEntities(parsedRecords: RecordPayload[]): Promise<void>;
  }
}

interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ServiceContextType {
  localData: DataState;
  initializeDatabase(): Promise<boolean>;
  initializeLocalData(page?: number, pageSize?: number): Promise<void>;
  addItem(type: DataType, item: any, uniqProps: string[]): Promise<any>;
  addBatchItems(type: DataType, items: any[], uniqProps: string[]): Promise<any[]>;
  fetchItem(type: DataType, page?: number, pageSize?: number): Promise<{ items: any[]; pagination: Pagination }>;
  updateItem(type: DataType, updatedItem: any, uniqProps: string[]): Promise<any>;
  deleteItem(type: DataType, id: string): Promise<void>;
  addResource(file: File, userEmail: string, resourceType: ResourceType): Promise<any>;
  fetchResource(type: DataType, page?: number, pageSize?: number): Promise<{ items: any[]; pagination: Pagination }>;
  updateResource(type: DataType, updatedResource: any, uniqProps: string[]): Promise<any>;
  deleteResource(type: DataType, id: string): Promise<void>;
  extractOCRData(imageBase64: string): Promise<string>;
  addEntities(parsedRecords: RecordPayload[]): Promise<void>;
  formatDate(date: Date): string;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const useService = (): ServiceContextType => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useService must be used within a ServiceProvider");
  }
  return context;
};

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [localData, setLocalData] = useState<DataState>({ ...initialDataState });

  const getBearerToken = async (): Promise<string> => {
    const response = await fetch(tokenUrl);
    const data = await response.json();
    return data.token;
  };

  const getRecaptchaToken = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof window !== "undefined") {
        const script = document.createElement("script");
        script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
        script.onload = () => {
          window.grecaptcha.ready(() => {
            window.grecaptcha
              .execute(RECAPTCHA_SITE_KEY, { action: "submit" })
              .then((token) => resolve(token))
              .catch((error) => reject(error));
          });
        };
        document.body.appendChild(script);
      } else {
        reject(new Error("Window is not defined"));
      }
    });
  };

  const fetchWithSecureToken = async (url: string, options: RequestInit = {}) => {
    const recaptchaToken = await getRecaptchaToken();
    const bearerToken = await getBearerToken();
    const encryptedUser = btoa(JSON.stringify(user)); // Encode l'utilisateur en base64
    const headers = {
      ...options.headers,
      Authorization: "Bearer " + bearerToken,
      "X-Recaptcha-Token": recaptchaToken,
      "X-User-Encrypted": encryptedUser, // Ajout de l'utilisateur encrypté
    };
    return fetch(url, { ...options, headers });
  };

  const initializeDatabase = async (): Promise<boolean> => {
    try {
      const response = await fetchWithSecureToken(initializeUrl);
      if (!response.ok) throw new Error("Init failed");
      return true;
    } catch {
      return false;
    }
  };

  const initializeLocalData = async (page = 1, pageSize = 10): Promise<void> => {
    const dataTypes: DataType[] = [
      "records",
      "resources",
      "travels",
      "activities",
      "categories",
      "merchants",
      "banks",
    ];
    try {
      await initializeDatabase();
      for (const type of dataTypes) {
        const response = await fetchWithSecureToken(
          `${apiUrl}?type=${type}&action=get&page=${page}&pageSize=${pageSize}`
        );
        if (response.ok) {
          const fetchedData = await response.json();
          setLocalData((prev) => ({
            ...prev,
            [type]: {
              items: fetchedData.items || [],
              pagination: fetchedData.pagination || {
                page,
                pageSize,
                totalItems: fetchedData.items?.length || 0,
                totalPages: 1,
              },
            },
          }));
        }
      }
    } catch {
      console.warn("Backend unavailable, using initialData.");
    }
  };

  const addItem = async (type: DataType, item: any, uniqProps: string[]): Promise<any> => {
    const now = new Date().toISOString();
    const newItem = { ...item, createdAt: now, updatedAt: now };
    try {
      const uniqPropsParam = encodeURIComponent(uniqProps.join(","));
      const response = await fetchWithSecureToken(
        `${apiUrl}?type=${type}&action=add&uniqProps=${uniqPropsParam}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        }
      );
      if (!response.ok) throw new Error();
      return await response.json();
    } catch {
      setLocalData((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          items: [...(prev[type]?.items || []), newItem],
        },
      }));
      return newItem;
    }
  };

  const addBatchItems = async (type: DataType, items: any[], uniqProps: string[]): Promise<any[]> => {
    try {
      const response = await fetchWithSecureToken(`${apiUrl}?type=${type}&action=addBatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items),
      });
      if (!response.ok) throw new Error();
      return await response.json();
    } catch {
      setLocalData((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          items: [...(prev[type]?.items || []), ...items],
        },
      }));
      return items;
    }
  };

  const fetchItem = async (type: DataType, page = 1, pageSize = 10) => {
    try {
      const response = await fetchWithSecureToken(
        `${apiUrl}?type=${type}&action=get&page=${page}&pageSize=${pageSize}`
      );
      if (!response.ok) throw new Error();
      const result = await response.json();
      return {
        items: result.items || [],
        pagination: result.pagination || { page, pageSize, totalItems: 0, totalPages: 1 },
      };
    } catch {
      const items = localData[type]?.items || [];
      return {
        items,
        pagination: {
          page,
          pageSize,
          totalItems: items.length,
          totalPages: Math.ceil(items.length / pageSize),
        },
      };
    }
  };

  const updateItem = async (type: DataType, updatedItem: any, uniqProps: string[]): Promise<any> => {
    const now = new Date().toISOString();
    try {
      const response = await fetchWithSecureToken(
        `${apiUrl}?type=${type}&action=update&id=${updatedItem.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedItem),
        }
      );
      if (!response.ok) throw new Error();
      return await response.json();
    } catch {
      setLocalData((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          items: prev[type].items.map((item) =>
            item.id === updatedItem.id ? { ...updatedItem, updatedAt: now } : item
          ),
        },
      }));
      return updatedItem;
    }
  };

  const deleteItem = async (type: DataType, id: string): Promise<void> => {
    try {
      await fetchWithSecureToken(`${apiUrl}?type=${type}&action=delete&id=${id}`, {
        method: "DELETE",
      });
    } catch {
      setLocalData((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          items: prev[type].items.filter((item) => item.id !== id),
        },
      }));
    }
  };

  const addResource = async (file: File, userEmail: string, resourceType: ResourceType): Promise<any> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64File = reader.result as string;
          let ocrData = undefined;
          if (file.type.startsWith("text/") || file.type.endsWith("csv") || file.type.startsWith("image/")) {
            ocrData = await extractOCRData(base64File);
          }
          const newResource: ResourcePayload = {
            type: resourceType,
            fileName: file.name,
            fileType: file.type,
            fileLink: base64File,
            ocrRawData: ocrData,
            description: "",
            userEmail: userEmail,
            isArchived: false,
          };
          const formData = new FormData();
          formData.append("file", file);
          formData.append("metadata", JSON.stringify(newResource));
          const response = await fetchWithSecureToken(
            `${resourceApiUrl}?type=resources&action=post`,
            { method: "POST", body: formData }
          );
          if (!response.ok) throw new Error();
          const result = await response.json();
          resolve({ ...newResource, ...result });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  const fetchResource = async (type: DataType, page = 1, pageSize = 10) => {
    const response = await fetchWithSecureToken(
      `${resourceApiUrl}?type=${type}&action=getBatch&page=${page}&pageSize=${pageSize}`
    );
    const result = await response.json();
    const itemsWithBase64 = await Promise.all(
      result.items.map(async (item: any) => {
        if (item.fileLink) {
          const proxy = `${proxyUrl}?url=${encodeURIComponent(item.fileLink)}`;
          return { ...item, fileLink: proxy };
        }
        return item;
      })
    );
    return {
      items: itemsWithBase64,
      pagination: result.pagination || { page, pageSize, totalItems: 0, totalPages: 1 },
    };
  };

  const updateResource = async (type: DataType, updatedResource: any, uniqProps: string[]): Promise<any> => {
    const now = new Date().toISOString();
    try {
      const response = await fetchWithSecureToken(
        `${resourceApiUrl}?type=${type}&action=update&id=${updatedResource.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedResource),
        }
      );
      if (!response.ok) throw new Error();
      return await response.json();
    } catch {
      setLocalData((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          items: prev[type].items.map((item) =>
            item.id === updatedResource.id ? { ...updatedResource, updatedAt: now } : item
          ),
        },
      }));
      return updatedResource;
    }
  };

  const deleteResource = async (type: DataType, id: string): Promise<void> => {
    try {
      await fetchWithSecureToken(`${resourceApiUrl}?type=${type}&action=delete&id=${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting resource:", error);
      throw error;
    }
  };

  const extractOCRData = async (imageBase64: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imageBase64;
  
      img.onload = async () => {
        try {
          // Créez un canvas pour dessiner l'image
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas context not available");
  
          ctx.drawImage(img, 0, 0, img.width, img.height);
  
          // Convertissez l'image en matrice OpenCV
          const src = cv.imread(canvas);
          const gray = new cv.Mat();
          cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
  
          // Appliquez un seuil pour améliorer le contraste
          const threshold = new cv.Mat();
          cv.threshold(
            gray,
            threshold,
            0,
            255,
            cv.THRESH_BINARY + cv.THRESH_OTSU
          );
  
          // Détectez les contours
          const contours = new cv.MatVector();
          const hierarchy = new cv.Mat();
          cv.findContours(
            threshold,
            contours,
            hierarchy,
            cv.RETR_EXTERNAL,
            cv.CHAIN_APPROX_SIMPLE
          );
  
          // Trouvez le plus grand contour (supposé être la région d'intérêt)
          let maxArea = 0;
          let largestContour = null;
          for (let i = 0; i < contours.size(); i++) {
            const contour = contours.get(i);
            const area = cv.contourArea(contour);
            if (area > maxArea) {
              maxArea = area;
              largestContour = contour;
            }
          }
  
          if (largestContour) {
            // Obtenez le rectangle englobant
            const rect = cv.boundingRect(largestContour);
  
            // Recadrez l'image
            const cropped = src.roi(rect);
  
            // Affichez le résultat recadré sur le canvas
            cv.imshow(canvas, cropped);
  
            // Convertir le canvas recadré en base64 pour OCR
            const processedBase64 = canvas.toDataURL("image/png");
  
            // Utiliser Tesseract.js pour extraire le texte
            const result = await recognize(processedBase64, "eng", {
              logger: (m) => console.log(m), // Optionnel : pour debug
            });
  
            // Libération mémoire OpenCV
            src.delete();
            gray.delete();
            threshold.delete();
            contours.delete();
            hierarchy.delete();
            cropped.delete();
  
            resolve(result.data.text);
          } else {
            throw new Error("Aucun contour détecté pour le recadrage.");
          }
        } catch (err) {
          reject(err);
        }
      };
  
      img.onerror = (err) => reject(err);
    });
  };
  
  const addEntities = async (parsedRecords: RecordPayload[]) => {
    // add merchants first
    const merchants = new Set<string>();
    parsedRecords.map((record) => {
      merchants.add(record.description);
    });
    await addBatchItems(
      "merchants",
      Array.from(merchants).map((merchant) => ({
        name: merchant,
      })),
      ["name"]
    );
    // add categories
    const categories = new Set<string>();
    parsedRecords.map((record) => {
      categories.add(record.categoryName);
    });
    await addBatchItems(
      "categories",
      Array.from(categories).map((category) => ({
        name: category,
      })),
      ["name"]
    );
    // add records
    await addBatchItems(
      "records",
      parsedRecords.map((record) => ({
        ...record,
      })),
      ["date", "description", "amount"]
    );
  };
  
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Mois indexé à 0
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };


  return (
    <ServiceContext.Provider
      value={{
        localData,
        initializeDatabase,
        initializeLocalData,
        addItem,
        addBatchItems,
        fetchItem,
        updateItem,
        deleteItem,
        addResource,
        fetchResource,
        updateResource,
        deleteResource,
        extractOCRData,
        addEntities,
        formatDate,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};
