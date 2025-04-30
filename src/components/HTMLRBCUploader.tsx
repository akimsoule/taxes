import React, { useRef } from "react";
import toast from "react-hot-toast";
import { Record } from "../types/models";
import { useDataContext } from "../context/DataContext";

const HTMLRBCUploader: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addItem } = useDataContext();

  const parseDate = (dateString: string): Date | null => {
    const months: { [key: string]: number } = {
      janvier: 1,
      février: 2,
      mars: 3,
      avril: 4,
      mai: 5,
      juin: 6,
      juillet: 7,
      août: 8,
      septembre: 9,
      octobre: 10,
      novembre: 11,
      décembre: 12,
    };

    let [day, monthAbbr, year] = dateString.split(" ");
    monthAbbr = monthAbbr.toLowerCase().replace(".", "").trim();
    let monthFound;
    for (const month in months) {
      if (month.startsWith(monthAbbr)) {
        monthFound = month;
        break;
      }
    }

    if (!monthFound) {
      toast.error("Mois non reconnu dans la date.");
      return null;
    }
    const month = months[monthFound] - 1; // Months are 0-indexed in JavaScript Date
    year = year.replace(",", "").trim();

    return new Date(parseInt(year, 10), month, parseInt(day, 10));
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Mois indexé à 0
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    if (!file.name.endsWith(".html")) {
      toast.error("Veuillez uploader un fichier HTML valide.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsedRecords = parseHTML(content);
      if (parsedRecords.length === 0) {
        toast.error("Aucun enregistrement trouvé dans le fichier.");
        return;
      }

      for (const record of parsedRecords) {
        addItem(
          "merchants",
          {
            id: record.description,
            name: record.description,
          },
          ["name"]
        );
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

      toast.success(
        `Fichier traité avec succès : ${parsedRecords.length} enregistrements.`
      );
    };
    reader.onerror = () => {
      toast.error("Erreur lors de la lecture du fichier.");
    };
    reader.readAsText(file);
  };

  const parseHTML = (htmlContent: string): Record[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    const rows = doc.querySelectorAll(".rbc-transaction-list-transaction-new");
    const records: Record[] = [];

    for (const row of rows) {
      const dateStr = row.querySelector("td[id^='row-']")?.textContent?.trim();
      const date = dateStr ? formatDate(parseDate(dateStr)!) : "";
      const category =
        row.querySelector("td[headers*='desc'] > div")?.textContent?.trim() ||
        "";
      const description =
        row.querySelector("td[headers*='desc']")?.textContent?.trim() || "";
      const amountText = row
        .querySelector("td[headers*='wd'], td[headers*='dep']")
        ?.textContent?.trim()
        .replace("$", "")
        .replace(",", ".")
        .replace(/\u00A0/g, " ")
        .replace(" ", "");

      const amount = amountText ? parseFloat(amountText) : 0;

      if (date && description && amount) {
        const currentRecord = {
          id: crypto.randomUUID(),
          date,
          description,
          categoryId: category,
          amount,
          currency: "CAD",
          deductible: false,
          bankId: "RBC",
        };
        records.push(currentRecord);
      }
    }

    return records;
  };

  return (
    <div className="flex items-end justify-end p-4">
      <input
        type="file"
        accept=".html"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded"
      >
        Upload RBC HTML File
      </button>
    </div>
  );
};

export default HTMLRBCUploader;
