import React, { useRef } from "react";
import toast from "react-hot-toast";
import { Record } from "../types/models";
import { useAuth } from "@workos-inc/authkit-react";
import { addEntities } from "../utils";

const HTMLTangerineUploader: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

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


  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    if (!file.name.endsWith(".html")) {
      toast.error("Veuillez uploader un fichier HTML valide.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const parsedRecords = parseHTML(content);
      if (parsedRecords.length === 0) {
        toast.error("Aucun enregistrement trouvé dans le fichier.");
        return;
      }

      await addEntities(parsedRecords);

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

    const rows = doc.querySelectorAll(".c-posted-transactions-list-items");
    const records: Record[] = [];

    for (const row of rows) {
      const dateStr =
        row.children[0].children[0].children[0].children[1]?.textContent // td // seul div // seul div // div avec la date
          ?.trim();
      const date = parseDate(dateStr!);

      const category = row.children[1].children[1].children[1]?.textContent // td // div // div
        ?.trim();

      const description = row.children[1].children[1].children[0]?.textContent // td // div // div
        ?.trim();

      const amountText = row.children[3]?.textContent // td
        ?.trim()
        .replace("$", "")
        .replace(",", ".")
        .replace(/\u00A0/g, " ")
        .replace(" ", "");

      let amount = amountText ? parseFloat(amountText) : 0;

      if (user && date && description && category && amount) {
        const categoryLower = category.toLowerCase();
        // if categoryLower includes with any keyword
        if (["revenu", "dépôt"].some((keyword) => categoryLower.includes(keyword))) {
          amount = Math.abs(amount); // if it's a deposit, make it negative
        } else {
          amount = -Math.abs(amount); // if it's a withdrawal, make it positive
        }
        const currentRecord = {
          date,
          description,
          categoryName: category,
          amount,
          currency: "CAD",
          deductible: false,
          bankName: "TANGERINE",
          userEmail: user.email, // Remplacez par l'ID de l'utilisateur actuel
        } as Record;
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
        Upload HTML File
      </button>
    </div>
  );
};

export default HTMLTangerineUploader;
