import React, { useRef, useState } from "react";
import { Upload, FileCheck2, AlertCircle } from "lucide-react";
import { parseCSV } from "../utils/csvParser";
import { useDataContext } from "../context/DataContext";
import { DataType } from "../types/models";
import toast from "react-hot-toast";

interface CSVUploaderProps {
  dataType: DataType;
  title: string;
  selectedBank?: string; // Utilisé uniquement pour les records
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ dataType, title, selectedBank }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const { setDataByType, setIsLoading } = useDataContext();

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Vérification si une banque est sélectionnée (uniquement pour les records)
    if (dataType === "records" && !selectedBank) {
      toast.error("Please select a bank before uploading.");
      return;
    }

    // Vérification du type de fichier
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a valid CSV file.");
      return;
    }

    setFileName(file.name);
    setIsLoading(true);

    // Parsing du fichier CSV
    parseCSV(file, dataType, {
      onComplete: (results) => {
        try {
          // Associer chaque enregistrement à la banque sélectionnée (uniquement pour les records)
          const processedData =
            dataType === "records"
              ? results.map((record: any) => ({
                  ...record,
                  bankId: selectedBank,
                }))
              : results;

          setDataByType(dataType, processedData);
          toast.success(`Successfully uploaded ${results.length} ${dataType}`);
        } catch (error) {
          toast.error(`Error processing data: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          setIsLoading(false);
        }
      },
      onError: (error) => {
        setIsLoading(false);
        toast.error(`Error uploading file: ${error}`);
        setFileName(null);
      },
    });
  };

  const handleClick = () => {
    if (dataType === "records" && !selectedBank) {
      toast.error("Please select a bank before uploading.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (dataType === "records" && !selectedBank) {
      toast.error("Please select a bank before uploading.");
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full mb-6">
      <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
        {title}
      </h3>
      <div
        className={`border-2 border-dashed ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
            : "border-gray-300 dark:border-gray-600"
        } rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        />

        {fileName ? (
          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
            <FileCheck2 className="h-8 w-8" />
            <span className="font-medium">{fileName}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            <div className="text-center">
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                Drag & drop your CSV file or click to browse
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Upload {dataType} data in CSV format
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-1">
          <AlertCircle className="h-3 w-3" />
          <span>
            CSV must have headers matching the required fields for {dataType}.
          </span>
        </div>
      </div>
    </div>
  );
};

export default CSVUploader;
