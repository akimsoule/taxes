import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { DataState, DataType } from "../types/models";
import * as dataService from "../services/dataService";
import { initialDataState } from "../constants/initialDataState";

interface DataContextProps {
  data: DataState;
  setDataByType: (type: DataType, newData: any[]) => void;
  addItem: (type: DataType, item: any, uniqueProps?: string[]) => Promise<void>;
  updateItem: (type: DataType, updatedItem: any) => Promise<void>;
  deleteItem: (type: DataType, id: string) => Promise<void>;
  addBatchItems: (
    type: DataType,
    items: any[],
    uniqueProps?: string[]
  ) => Promise<void>; // Ajout de la fonction pour ajouter des lots d'éléments
  fetchData: (
    type: DataType,
    page?: number,
    pageSize?: number
  ) => Promise<{ totalItems: number; data: any[] }>; // Ajout des paramètres de pagination
  fetchImageData: (
    type: DataType,
    page?: number,
    pageSize?: number
  ) => Promise<{ totalItems: number; data: any[] }>; // Ajout de la fonction pour récupérer les données d'image avec pagination
  fetchFileData: (
    type: DataType,
    page?: number,
    pageSize?: number
  ) => Promise<{ totalItems: number; data: any[] }>; // Ajout de la fonction pour récupérer les données de fichier avec pagination
  addImage: (file: File, userEmail: string) => Promise<void>;
  addFile: (file: File, userEmail: string) => Promise<void>;
  deleteImage: (type: DataType, id: string) => Promise<void>;
  deleteFile: (type: DataType, id: string) => Promise<void>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<DataState>(initialDataState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        await dataService.initializeDatabase();
      } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  const setDataByType = (type: DataType, newData: any[]) => {
    setData((prevState) => ({
      ...prevState,
      [type]: {
        ...prevState[type],
        items: newData,
      },
    }));
  };

  const fetchData = async (
    type: DataType,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ totalItems: number; data: any[] }> => {
    setIsLoading(true);
    try {
      const {
        items: data,
        pagination: { totalItems, totalPages },
      } = await dataService.fetchData(type, page, pageSize);
      setData((prevState) => ({
        ...prevState,
        [type]: {
          ...prevState[type],
          items: data,
          pagination: {
            page,
            pageSize,
            totalItems,
            totalPages,
          },
        },
      }));
      return { totalItems, data };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchImageData = async (
    type: DataType,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ totalItems: number; data: any[] }> => {
    setIsLoading(true);
    try {
      const { items: data, pagination } = await dataService.fetchImageData(
        type,
        page,
        pageSize
      );
      setData((prevState) => ({
        ...prevState,
        [type]: {
          ...prevState[type],
          items: data,
          pagination,
        },
      }));
      return { totalItems: pagination.totalItems, data };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFileData = async (
    type: DataType,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ totalItems: number; data: any[] }> => {
    setIsLoading(true);
    try {
      const { items: data, pagination } = await dataService.fetchFileData(
        type,
        page,
        pageSize
      );
      setData((prevState) => ({
        ...prevState,
        [type]: {
          ...prevState[type],
          items: data,
          pagination,
        },
      }));
      return { totalItems: pagination.totalItems, data };
    } finally {
      setIsLoading(false);
    }
  };

  const addBatchItems = async (
    type: DataType,
    items: any[],
    uniqueProps = ["id"]
  ) => {
    setIsLoading(true);
    try {
      const newItems = await dataService.addBatchItems(
        type,
        items,
        uniqueProps
      );
      setData((prevState) => ({
        ...prevState,
        [type]: {
          ...prevState[type],
          items: [...prevState[type].items, ...newItems],
        },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const addImage = async (file: File, userEmail: string) => {
    setIsLoading(true);
    try {
      const newImage = await dataService.addImage(file, userEmail);
      setData((prevState) => ({
        ...prevState,
        images: {
          ...prevState.images,
          items: [...prevState.images.items, newImage],
        },
      }));
    } catch (error) {
      console.error("Error adding image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addFile = async (file: File, userEmail: string) => {
    setIsLoading(true);
    try {
      const newFile = await dataService.addFile(file, userEmail);
      setData((prevState) => ({
        ...prevState,
        files: {
          ...prevState.files,
          items: [...prevState.files.items, newFile],
        },
      }));
    } catch (error) {
      console.error("Error adding file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteImage = async (type: DataType, id: string) => {
    setIsLoading(true);
    try {
      await dataService.deleteImage(type, id);
      setData((prevState) => ({
        ...prevState,
        [type]: {
          ...prevState[type],
          items: prevState[type].items.filter((item) => item.id !== id),
        },
      }));
    } catch (error) {
      console.error("Error deleting image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFile = async (type: DataType, id: string) => {
    setIsLoading(true);
    try {
      await dataService.deleteFile(type, id);
      setData((prevState) => ({
        ...prevState,
        [type]: {
          ...prevState[type],
          items: prevState[type].items.filter((item) => item.id !== id),
        },
      }));
    } catch (error) {
      console.error("Error deleting file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (type: DataType, item: any, uniqueProps = ["id"]) => {
    setIsLoading(true);
    try {
      const newItem = await dataService.addItem(type, item, uniqueProps);
      setData((prevState) => ({
        ...prevState,
        [type]: {
          ...prevState[type],
          items: [...prevState[type].items, newItem],
        },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (
    type: DataType,
    updatedItem: any,
    uniqProps = ["id"]
  ) => {
    setIsLoading(true);
    try {
      const updatedData = await dataService.updateItem(
        type,
        updatedItem,
        uniqProps
      );
      setData((prevState) => ({
        ...prevState,
        [type]: {
          ...prevState[type],
          items: prevState[type].items.map((item) =>
            item.id === updatedData.id ? updatedData : item
          ),
        },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (type: DataType, id: string) => {
    setIsLoading(true);
    try {
      await dataService.deleteItem(type, id);
      setData((prevState) => ({
        ...prevState,
        [type]: {
          ...prevState[type],
          items: prevState[type].items.filter((item) => item.id !== id),
        },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DataContext.Provider
      value={{
        data,
        setDataByType,
        addItem,
        updateItem,
        deleteItem,
        addBatchItems, // Ajout de la fonction pour ajouter des lots d'éléments
        fetchData,
        fetchImageData, // Mise à jour pour inclure la pagination
        fetchFileData, // Ajout de la fonction pour récupérer les données de fichier avec pagination
        addImage,
        addFile,
        deleteImage,
        deleteFile,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};
