import React, { createContext, useContext, useState, ReactNode } from "react";
import { DataState, DataType } from "../types/models";

interface DataContextProps {
  data: DataState;
  setDataByType: (type: DataType, newData: any[]) => void;
  addItem: (type: DataType, item: any, uniqueProps?: string[]) => void;
  updateItem: (type: DataType, updatedItem: any) => void;
  deleteItem: (type: DataType, id: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const initialDataState: DataState = {
  records: [],
  receipts: [],
  receiptImages: [
    {
      id: "img1",
      receiptId: "r1",
      imageUrl: "https://example.com/receipt1.jpg",
      ocrRawData: "Total: $100.5",
      uploadedAt: "2025-04-28T10:00:00Z",
    },
    {
      id: "img2",
      receiptId: "r2",
      imageUrl: "https://example.com/receipt2.jpg",
      uploadedAt: "2025-04-28T10:05:00Z",
    },
  ],
  travels: [],
  activities: [],
  categories: [],
  merchants: [],
  banks: [
    {
      id: "TANGERINE",
      name: "Tangerine",
    },
    {
      id: "DESJARDINS",
      name: "Desjardins",
    },
    {
      id: "RBC",
      name: "RBC",
    },
],
};

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<DataState>(initialDataState);
  const [isLoading, setIsLoading] = useState(false);

  const setDataByType = (type: DataType, newData: any[]) => {
    setData((prevState) => ({
      ...prevState,
      [type]: newData,
    }));
  };

  // CRUD Operations
  const addItem = (
    type: DataType,
    item: any,
    uniqueProps: string[] = ["id"]
  ) => {
    const now = new Date().toISOString();

    setData((prevState) => {
      const exists = prevState[type].some((existingItem) =>
        uniqueProps.every(
          (prop) =>
            existingItem[prop as keyof typeof existingItem] ===
            item[prop as keyof typeof item]
        )
      );

      if (exists) {
        console.warn(
          `Item with unique properties ${JSON.stringify(
            uniqueProps
          )} already exists in "${type}".`
        );
        return prevState;
      }

      return {
        ...prevState,
        [type]: [
          ...prevState[type],
          { ...item, createdAt: now, updatedAt: now },
        ],
      };
    });
  };

  const updateItem = (type: DataType, updatedItem: any) => {
    const now = new Date().toISOString();
    setData((prevState) => ({
      ...prevState,
      [type]: prevState[type].map((item) =>
        item.id === updatedItem.id ? { ...updatedItem, updatedAt: now } : item
      ),
    }));
  };

  const deleteItem = (type: DataType, id: string) => {
    setData((prevState) => ({
      ...prevState,
      [type]: prevState[type].filter((item) => item.id !== id),
    }));
  };

  return (
    <DataContext.Provider
      value={{
        data,
        setDataByType,
        addItem,
        updateItem,
        deleteItem,
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
