import React, { useRef } from "react";
import toast from "react-hot-toast";
import { Record } from "../types/models";
import { useDataContext } from "../context/DataContext";

const TXTUploader: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addItem } = useDataContext();

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
      toast.error("Please upload a valid TXT file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsedRecords = parseFile(content);
      if (parsedRecords.length === 0) {
        toast.error("No records found in the file.");
        return;
      }

      for (const record of parsedRecords) {
        if (
          record.description &&
          !(
            record.description.toLocaleLowerCase().includes("paiement") ||
            record.description.toLocaleLowerCase().includes("payment")
          )
        ) {
          addItem(
            "merchants",
            {
              id: record.description,
              name: record.description,
            },
            ["name"]
          );
        }
        addItem(
          "categories",
          {
            id: record.categoryId,
            name: record.categoryId,
          },
          ["name"]
        );

        addItem(
          "records",
          {
            ...record,
            id: Date.now().toString(),
          },
          ["date", "description", "amount"]
        );
      }

      toast.success(`Successfully processed ${parsedRecords.length} records.`);
    };
    reader.onerror = () => {
      toast.error("Error reading the file.");
    };
    reader.readAsText(file);
  };

  const parseFile = (data: string): Record[] => {
    const lines = data.trim().split("\n");
    const records: Record[] = [];
    let currentRecord: Partial<Record> = {};

    // Remove the first 4 lines
    lines.splice(0, 4);

    let startIndexForSlice = 0;
    let endIndexForSlice;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (line.length === 0) continue;

      if (line.includes("$")) {
        endIndexForSlice = i;
      } else if (endIndexForSlice && !line.includes("$")) {
        const chunk = lines.slice(startIndexForSlice, endIndexForSlice + 1);
        processChunk(chunk, records, currentRecord);
        startIndexForSlice = i;
        endIndexForSlice = undefined;
      }
    }

    return records;
  };

  const processChunk = (
    chunk: string[],
    records: Record[],
    currentRecord: Partial<Record>
  ) => {
    let date;
    let avanceIndex = 0;
    const startDate = chunk[0].trim();
    const isYear = /^\d{4}$/.test(chunk[1]?.trim());
    if (isYear) {
      date = `${startDate} ${chunk[1].trim()}`;
      avanceIndex = 1;
    } else {
      date = `${startDate} ${new Date().getFullYear()}`;
    }

    const description = chunk[2 + avanceIndex]?.trim();
    const categoryId = chunk[3 + avanceIndex]?.trim();
    const amount = parseFloat(
      chunk[6 + avanceIndex]
        ?.replace("$", "")
        .replace(",", ".")
        .replace(" ", "")
        .trim()
    );
    let cashBack = 0;
    if (7 + avanceIndex in chunk) {
      cashBack = parseFloat(
        chunk[7 + avanceIndex]
          ?.replace("$", "")
          .replace(",", ".")
          .replace(" ", "")
          .trim()
      );
    }

    currentRecord = {
      date,
      description,
      categoryId,
      amount,
      cashBack,
      currency: "CAD",
      deductible: false,
      bankId: "TANGERINE",
    };
    records.push(currentRecord as Record);
  };

  return (
    <div className="flex items-end justify-end p-4">
      <input
        type="file"
        accept=".txt"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded"
      >
        Upload TXT File
      </button>
      {/* {records.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Records</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(records, null, 2)}
          </pre>
        </div>
      )} */}
    </div>
  );
};

export default TXTUploader;
