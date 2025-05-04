import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import { useDataContext } from "../context/DataContext";
import { Plus } from "lucide-react";
import { useAuth } from "@workos-inc/authkit-react";

const FilesPage: React.FC = () => {
  const { user } = useAuth();
  const { data, fetchFileData, addFile, deleteFile } = useDataContext();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedFileData, setSelectedFileData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      try {
        await fetchFileData("files", 1, 1000);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFiles();
  }, []);

  const handleAdd = async (file: File) => {
    setIsLoading(true);
    try {
      if (user) {
        await addFile(file, user.email);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteFile("files", id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptureFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleAdd(file);
    }
  };

  const handleFileLoad = (id: string) => {
    setLoadingFiles((prev) => ({ ...prev, [id]: false }));
  };

  const handleFileError = (id: string) => {
    setLoadingFiles((prev) => ({ ...prev, [id]: false }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="flex flex-col items-center">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
            <p className="text-white mt-4">Chargement en cours...</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Fichiers
        </h1>
        <label className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-full flex items-center justify-center cursor-pointer">
          <input
            type="file"
            accept="*/*"
            className="hidden"
            onChange={handleCaptureFile}
          />
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un fichier
        </label>
      </div>

      <DataTable
        data={data.files}
        headers={[
          {
            key: "fileName",
            label: "Nom du fichier",
            render: (file: any) => (
              <span className="text-gray-800 dark:text-gray-200">
                {file.name}
              </span>
            ),
          },
          {
            key: "uploadedAt",
            label: "Date d'upload",
          },
          {
            key: "actions",
            label: "Actions",
            render: (file: any) => (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDelete(file.id)}
                  className="text-red-600 dark:text-red-400"
                >
                  Supprimer
                </button>
              </div>
            ),
          },
        ]}
        emptyMessage="Aucun fichier disponible. Veuillez en ajouter."
      />

      {selectedFile && (
        <Modal
          isOpen={!!selectedFile}
          onClose={() => setSelectedFile(null)}
          title="Aperçu du fichier"
        >
          <div className="flex justify-center">
            <p className="text-gray-800 dark:text-gray-200">
              Aperçu non disponible pour ce type de fichier.
            </p>
          </div>
        </Modal>
      )}

      {selectedFileData && (
        <Modal
          isOpen={!!selectedFileData}
          onClose={() => setSelectedFileData(null)}
          title="Données du fichier"
        >
          <div className="p-4">
            <div className="border p-4 rounded bg-gray-100 dark:bg-gray-700 overflow-y-auto max-h-64">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                {selectedFileData}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FilesPage;