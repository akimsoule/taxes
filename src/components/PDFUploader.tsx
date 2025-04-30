import React, { useState } from "react";
import { callUploadTangerineRecordsApi } from "../call";

const PDFUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("Veuillez sélectionner un fichier.");
      return;
    }

    setUploadStatus("Téléchargement en cours...");

    await callUploadTangerineRecordsApi(
      file,
      (records) => {
        setUploadStatus(`Succès : ${records.length} enregistrements ajoutés.`);
      },
      (error) => {
        setUploadStatus(`Erreur : ${error}`);
      }
    );
  };

  return (
    <div className="pdf-uploader">
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded"
      >
        Télécharger le fichier PDF
      </button>
      {uploadStatus && <p className="mt-2 text-sm">{uploadStatus}</p>}
    </div>
  );
};

export default PDFUploader;