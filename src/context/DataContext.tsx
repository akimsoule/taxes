import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { DataState, DataType, ResourceType } from "../types/models";
import { initialDataState } from "../constants/initialDataState";
import { useService } from "../services/ServiceContext";

interface DataContextProps {
  data: DataState;
  setDataByType: (type: DataType, newData: any[]) => void;
  addItem: (type: DataType, item: any, uniqueProps?: string[]) => Promise<void>;
  addBatchItems: (
    type: DataType,
    items: any[],
    uniqueProps?: string[]
  ) => Promise<void>; // Ajout de la fonction pour ajouter des lots d'éléments
  fetchItem: (
    type: DataType,
    page?: number,
    pageSize?: number
  ) => Promise<{ totalItems: number; data: any[] }>; // Ajout des paramètres de pagination
  updateItem: (type: DataType, updatedItem: any) => Promise<void>;
  deleteItem: (type: DataType, id: string) => Promise<void>;
  fetchResource: (
    type: DataType,
    page?: number,
    pageSize?: number
  ) => Promise<{ totalItems: number; data: any[] }>; // Ajout de la fonction pour récupérer les données de resource avec pagination
  addResource: (
    file: File,
    userEmail: string,
    resourceType: ResourceType
  ) => Promise<void>; // Ajout de la fonction pour ajouter une resource
  updateResource: (
    type: DataType,
    updatedResource: any,
    uniqProps?: string[]
  ) => Promise<void>; // Ajout de la fonction pour mettre à jour une resource
  deleteResource: (type: DataType, id: string) => Promise<void>; // Ajout de la fonction pour supprimer une resource
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const dataService = useService();
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

  const fetchItem = async (
    type: DataType,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ totalItems: number; data: any[] }> => {
    setIsLoading(true);
    try {
      const {
        items: data,
        pagination: { totalItems, totalPages },
      } = await dataService.fetchItem(type, page, pageSize);
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

  const addResource = async (
    file: File,
    userEmail: string,
    resourceType: ResourceType
  ) => {
    setIsLoading(true);
    try {
      const newResource = await dataService.addResource(
        file,
        userEmail,
        resourceType
      );
      setData((prevState) => ({
        ...prevState,
        resources: {
          ...prevState.resources,
          items: [...prevState.resources.items, newResource],
        },
      }));
    } catch (error) {
      console.error("Error adding resource:", error);
      throw new Error("Failed to add resource");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResource = async (
    type: DataType,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ totalItems: number; data: any[] }> => {
    setIsLoading(true);
    try {
      const { items: data, pagination } = await dataService.fetchResource(
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

  const updateResource = async (
    type: DataType,
    updatedResource: any,
    uniqProps = ["id"]
  ) => {
    setIsLoading(true);
    try {
      const updatedData = await dataService.updateResource(
        type,
        updatedResource,
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

  const deleteResource = async (type: DataType, id: string) => {
    setIsLoading(true);
    try {
      await dataService.deleteResource(type, id);
      setData((prevState) => ({
        ...prevState,
        [type]: {
          ...prevState[type],
          items: prevState[type].items.filter((item) => item.id !== id),
        },
      }));
    } catch (error) {
      console.error("Error deleting resource:", error);
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
        addBatchItems,
        fetchItem,
        updateItem,
        deleteItem,
        addResource,
        fetchResource,
        updateResource,
        deleteResource,
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
