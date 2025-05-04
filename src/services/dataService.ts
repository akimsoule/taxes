import { DataState, DataType, Image } from "../types/models";
import { initialDataState } from "../constants/initialDataState";
import { extractOCRData } from "../utils";

const apiUrl = "/api/action";
const initializeUrl = "/api/initialize";
const fileApiUrl = "/api/image";
const proxyUrl = "/api/proxy";

export let localData: DataState = { ...initialDataState };

// Fonction pour initialiser la base de données avec des données par défaut
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log("Initialisation de la base de données...");

    const response = await fetch(initializeUrl);
    if (!response.ok) {
      throw new Error(`Échec de l'initialisation: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("✅ Base de données initialisée avec succès:", result.message);
    return true;
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'initialisation de la base de données:",
      error
    );
    return false;
  }
};

// Fonction pour initialiser localData en appelant le backend avec pagination
export const initializeLocalData = async (
  page: number = 1,
  pageSize: number = 10
): Promise<void> => {
  const dataTypes: DataType[] = [
    "records",
    "receipts",
    "docs",
    "images",
    "travels",
    "activities",
    "categories",
    "merchants",
    "banks",
  ];

  try {
    await initializeDatabase();

    for (const type of dataTypes) {
      const response = await fetch(
        `${apiUrl}?type=${type}&action=get&page=${page}&pageSize=${pageSize}`
      );
      if (response.ok) {
        const fetchedData = await response.json();
        localData[type] = {
          items: fetchedData.items || [],
          pagination: fetchedData.pagination || {
            page,
            pageSize,
            totalItems: fetchedData.items?.length || 0,
            totalPages: 1,
          },
        };
      } else {
        console.warn(
          `Failed to fetch ${type} from backend. Using initial data.`
        );
      }
    }
  } catch (error) {
    console.warn(
      "Backend not available. Using initial data for all types.",
      error
    );
  }
};

// Fonction pour récupérer les données avec pagination
export const fetchData = async (
  type: DataType,
  page: number = 1,
  pageSize: number = 10
): Promise<{
  items: any[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}> => {
  try {
    const response = await fetch(
      `${apiUrl}?type=${type}&action=get&page=${page}&pageSize=${pageSize}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch ${type}`);
    }
    const result = await response.json();
    return {
      items: result.items || [],
      pagination: {
        page: result.pagination?.page || page,
        pageSize: result.pagination?.pageSize || pageSize,
        totalItems: result.pagination?.totalItems || 0,
        totalPages: result.pagination?.totalPages || 1,
      },
    };
  } catch (error) {
    console.warn(`API not available, using local data for ${type}.`, error);
    const localItems = localData[type]?.items || [];
    const totalItems = localItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedItems = localItems.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

    return {
      items: paginatedItems,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }
};

export const fetchImageData = async (
  type: DataType,
  page: number = 1,
  pageSize: number = 10
): Promise<{
  items: any[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}> => {
  try {
    const response = await fetch(
      `${fileApiUrl}?type=${type}&action=getBatch&page=${page}&pageSize=${pageSize}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch ${type}: ${response.statusText}`);
    }
    const result = await response.json();

    // Transformation du fileLink en base64 via la fonction proxy
    const itemsWithBase64 = await Promise.all(
      result.items.map(async (item: any) => {
        if (item.fileLink) {
          try {
            const proxy = `${proxyUrl}?url=${encodeURIComponent(item.fileLink)}`;
            return { ...item, fileLink: proxy };
          } catch (error) {
            console.error(
              `Failed to convert fileLink to base64 for item ${item.id}:`,
              error
            );
            return item; // Retourne l'item sans modification en cas d'erreur
          }
        }
        return item;
      })
    );

    return {
      items: itemsWithBase64,
      pagination: {
        page: result.pagination?.page || page,
        pageSize: result.pagination?.pageSize || pageSize,
        totalItems: result.pagination?.totalItems || 0,
        totalPages: result.pagination?.totalPages || 1,
      },
    };
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    const localItems = localData[type]?.items || [];
    const totalItems = localItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedItems = localItems.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

    return {
      items: paginatedItems,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }
};

// Fonction pour récupérer les fichiers avec pagination
export const fetchFileData = async (
  type: DataType,
  page: number = 1,
  pageSize: number = 10
): Promise<{
  items: any[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}> => {
  try {
    const response = await fetch(
      `${fileApiUrl}?type=${type}&action=get&page=${page}&pageSize=${pageSize}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch ${type}: ${response.statusText}`);
    }
    const result = await response.json();

    return {
      items: result.items || [],
      pagination: {
        page: result.pagination?.page || page,
        pageSize: result.pagination?.pageSize || pageSize,
        totalItems: result.pagination?.totalItems || 0,
        totalPages: result.pagination?.totalPages || 1,
      },
    };
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    const localItems = localData[type]?.items || [];
    const totalItems = localItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedItems = localItems.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

    return {
      items: paginatedItems,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }
};

// Fonction pour ajouter un lot d'éléments
export const addBatchItems = async (
  type: DataType,
  items: any[],
  uniqProps: string[]
): Promise<any[]> => {
  const newItems = items.map((item) => ({
    ...item,
  }));
  const existingItems = localData[type]?.items || [];
  const existingIds = new Set(existingItems.map((item) => item.id));
  const newItemsToAdd = newItems.filter((item) => !existingIds.has(item.id));

  const exists = newItemsToAdd.some((item) =>
    uniqProps.every((prop) =>
      existingItems.some(
        (existingItem) =>
          existingItem[prop as keyof typeof existingItem] === item[prop]
      )
    )
  );

  if (exists) {
    console.warn(
      `Items with unique properties ${JSON.stringify(
        uniqProps
      )} already exist in "${type}".`
    );
    throw new Error(`Items with unique properties already exist.`);
  }

  try {
    const response = await fetch(`${apiUrl}?type=${type}&action=addBatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItemsToAdd),
    });
    if (!response.ok) {
      throw new Error(`Failed to add items to ${type}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`API not available, adding items locally for ${type}.`, error);
    localData[type].items = [...existingItems, ...newItemsToAdd];
    return newItemsToAdd;
  }
};

// Fonction pour ajouter un élément
export const addItem = async (
  type: DataType,
  item: any,
  uniqProps: string[]
): Promise<any> => {
  const now = new Date().toISOString();
  const newItem = {
    ...item,
    createdAt: now,
    updatedAt: now,
  };

  const exists = localData[type]?.items.some((existingItem) =>
    uniqProps.every(
      (prop) => existingItem[prop as keyof typeof existingItem] === item[prop]
    )
  );

  if (exists) {
    console.warn(
      `Item with unique properties ${JSON.stringify(
        uniqProps
      )} already exists in "${type}".`
    );
    throw new Error(`Item with unique properties already exists.`);
  }

  try {
    const response = await fetch(`${apiUrl}?type=${type}&action=add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    if (!response.ok) {
      throw new Error(`Failed to add item to ${type}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`API not available, adding item locally for ${type}.`, error);
    localData[type].items.push(newItem);
    return newItem;
  }
};

// Fonction pour ajouter un fichier
export const addFile = async (file: File, userEmail: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      const base64File = reader.result as string;

      try {
        const newFile = {
          id: Date.now().toString(),
          base64: base64File,
          uploadedAt: new Date().toISOString(),
          userEmail: userEmail,
          fileName: file.name,
          fileType: file.type,
        };

        const formData = new FormData();
        formData.append("file", file);
        formData.append("metadata", JSON.stringify(newFile));

        const response = await fetch(`${fileApiUrl}?type=files&action=post`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload file: ${response.statusText}`);
        }

        const result = await response.json();
        resolve({ ...newFile, ...result });
      } catch (error) {
        console.error("Error uploading file:", error);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      reject(error);
    };

    reader.readAsDataURL(file);
  });
};

// Fonction pour mettre à jour un élément
export const updateItem = async (
  type: DataType,
  updatedItem: any,
  uniqProps: string[]
): Promise<any> => {
  const now = new Date().toISOString();

  const exists = localData[type]?.items.some(
    (existingItem) =>
      existingItem.id !== updatedItem.id &&
      uniqProps.every(
        (prop) =>
          existingItem[prop as keyof typeof existingItem] === updatedItem[prop]
      )
  );

  if (exists) {
    console.warn(
      `Item with unique properties ${JSON.stringify(
        uniqProps
      )} already exists in "${type}".`
    );
    throw new Error(`Item with unique properties already exists.`);
  }

  try {
    const response = await fetch(
      `${apiUrl}?type=${type}&action=update&id=${updatedItem.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to update item in ${type}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(
      `API not available, updating item locally for ${type}.`,
      error
    );
    localData[type].items = localData[type].items.map((item) =>
      item.id === updatedItem.id ? { ...updatedItem, updatedAt: now } : item
    );
    return updatedItem;
  }
};

// Fonction pour supprimer un élément
export const deleteItem = async (type: DataType, id: string): Promise<void> => {
  try {
    const response = await fetch(
      `${apiUrl}?type=${type}&action=delete&id=${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to delete item from ${type}`);
    }
  } catch (error) {
    console.warn(
      `API not available, deleting item locally for ${type}.`,
      error
    );
    localData[type].items = localData[type].items.filter(
      (item) => item.id !== id
    ) as (typeof localData)[typeof type]["items"];
  }
};

// Fonction pour supprimer un fichier
export const deleteFile = async (type: DataType, id: string): Promise<void> => {
  try {
    const response = await fetch(
      `${fileApiUrl}?type=${type}&action=delete&id=${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

// Fonction pour ajouter une image
export async function addImage(file: File, userEmail: string): Promise<Image> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      const base64Image = reader.result as string;

      try {
        // Ajout des champs supplémentaires
        const ocrData = await extractOCRData(base64Image); // Extraction des données OCR
        const newImage: Image = {
          id: Date.now().toString(),
          base64: base64Image,
          ocrRawData: ocrData,
          uploadedAt: new Date().toISOString(),
          userEmail: userEmail,
          fileName: file.name,
          fileType: file.type,
        };

        // Création de l'objet FormData
        const formData = new FormData();
        formData.append("file", file); // Ajout du fichier
        formData.append("metadata", JSON.stringify(newImage)); // Ajout des métadonnées sous forme de JSON

        // Envoi de la requête
        const response = await fetch(`${fileApiUrl}?type=images&action=post`, {
          method: "POST",
          body: formData, // Envoi des données sous forme de multipart/form-data
        });

        if (!response.ok) {
          throw new Error(`Failed to upload image: ${response.statusText}`);
        }

        const result = await response.json();

        // Mise à jour de l'objet Image avec les données retournées par le serveur
        const uploadedImage: Image = {
          ...newImage,
          ...result, // Fusion des données retournées par le serveur
        };

        resolve(uploadedImage); // Résolution de la promesse avec l'objet Image
      } catch (error) {
        console.error("Error uploading image:", error);
        reject(error); // Rejet de la promesse en cas d'erreur
      }
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      reject(error); // Rejet de la promesse si la lecture du fichier échoue
    };

    reader.readAsDataURL(file); // Lecture du fichier en base64
  });
}
export function deleteImage(type: DataType, id: string) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const response = await fetch(
        `${fileApiUrl}?type=${type}&action=delete&id=${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to delete image: ${response.statusText}`);
      }
      resolve();
    } catch (error) {
      console.error("Error deleting image:", error);
      reject(error);
    }
  });
}

