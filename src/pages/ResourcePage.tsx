import React, { useState, useEffect, useCallback } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async"; // Import depuis react-helmet-async
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import { useDataContext } from "../context/DataContext";
import { Plus } from "lucide-react";
import { useAuth } from "@workos-inc/authkit-react";
import toast from "react-hot-toast";
import { ResourcePayload, ResourceType } from "../types/models";
import ThumbnailWithLoader from "../components/ThumbnailWithLoader";
import { useService } from "../services/ServiceContext";

const ResourcePage: React.FC = () => {
  const { user } = useAuth();
  const { extractOCRData } = useService();
  const { data, fetchResource, addResource, deleteResource, updateResource } =
    useDataContext();
  const [selectedResource, setSelectedResource] =
    useState<ResourcePayload | null>(null);
  const [selectedOCR, setSelectedOCR] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<ResourceType | "ALL">("ALL");
  const [newResourceType, setNewResourceType] = useState<ResourceType>(
    ResourceType.OTHER
  );
  const [hasFetched, setHasFetched] = useState(false); // État pour vérifier si les données ont été chargées

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchResource("resources", 1, 1000);
    } finally {
      setIsLoading(false);
    }
  }, [fetchResource]);

  useEffect(() => {
    if (!hasFetched) {
      fetchResources();
      setHasFetched(true); // Marquer les données comme chargées
    }
  }, [hasFetched, fetchResources]);

  const handleAdd = async (file: File) => {
    setIsLoading(true);
    try {
      if (user) {
        await addResource(file, user.email, newResourceType);
        toast.success("Ressource ajoutée avec succès !");
        await fetchResources();
      }
    } catch (error) {
      toast.error("Erreur lors de l'ajout de la ressource");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteResource("resources", id);
      toast.success("Ressource supprimée avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la suppression de la ressource");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptureResource = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert(
          "Le fichier est trop volumineux. La taille maximale est de 10 Mo."
        );
        return;
      }
      await handleAdd(file);
    }
  };

  const handleRefreshOCR = async (resourceId: string, fileLink: string) => {
    setIsLoading(true);
    try {
      // Fetch le fichier et convertit en base64
      const response = await fetch(fileLink);
      const blob = await response.blob();

      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
      });

      // Appel de l'API OCR avec la chaîne base64
      const ocrData = await extractOCRData(base64String);

      // Mise à jour de la ressource
      const updatedResource = { id: resourceId, ocrRawData: ocrData };
      await updateResource("resources", updatedResource, ["id"]);

      toast.success("OCR actualisé avec succès !");
      await fetchResources();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'actualisation de l'OCR");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResources =
    selectedType === "ALL"
      ? { items: data.resources.items, pagination: data.resources.pagination }
      : {
          items: data.resources.items.filter(
            (resource) => resource.type === selectedType
          ),
          pagination: data.resources.pagination,
        };

  return (
    <HelmetProvider>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 relative">
        <Helmet>
          <title>Resources - Gestion des Ressources</title>
          <meta
            name="description"
            content="Page de gestion des ressources pour les utilisateurs, incluant l'ajout, la suppression et la visualisation des fichiers."
          />
          <meta
            name="keywords"
            content="ressources, gestion, fichiers, utilisateurs, application"
          />
        </Helmet>

        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="flex flex-col items-center">
              <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
              <p className="text-white mt-4">Chargement...</p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Resources
          </h1>
          <div className="hidden md:flex space-x-2">
            {/* Ajouter le mode dark */}
            <select
              value={newResourceType}
              onChange={(e) =>
                setNewResourceType(e.target.value as ResourceType)
              }
              className="border rounded p-2 mx-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow transition-colors duration-300"
            >
              {Object.values(ResourceType).map((type) => (
                <option
                  key={type}
                  value={type}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {type}
                </option>
              ))}
            </select>
            <label className="bg-green-600 hover:bg-green-700 text-white font-medium p-2 rounded-full flex items-center justify-center cursor-pointer">
              <input
                type="file"
                accept="*/*"
                className="hidden"
                onChange={handleCaptureResource}
              />
              <Plus className="h-5 w-5" />
            </label>
          </div>
        </div>

        <div className="mb-4">
          <select
            value={selectedType}
            onChange={(e) =>
              setSelectedType(e.target.value as ResourceType | "ALL")
            }
            className="border rounded p-2"
          >
            <option value="ALL">Tous les types</option>
            {Object.values(ResourceType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <DataTable
          data={filteredResources}
          headers={[
            {
              key: "thumbnail",
              label: "Miniature",
              render: (resource: any) =>
                resource.fileType?.startsWith("image/") ? (
                  <ThumbnailWithLoader
                    fileLink={resource.fileLink}
                    fileName={resource.fileName}
                    onClick={() => setSelectedResource(resource)}
                  />
                ) : (
                  <span className="text-gray-500">N/A</span>
                ),
            },
            { key: "type", label: "Type" },
            { key: "uploadedAt", label: "Date d'ajout" },
            {
              key: "ocrRawData",
              label: "Données OCR",
              render: (resource: any) => (
                <div>
                  <p>{resource.ocrRawData?.substring(0, 20) || "N/A"}...</p>
                  {resource.ocrRawData && resource.ocrRawData.length > 50 && (
                    <button
                      onClick={() => setSelectedOCR(resource.ocrRawData)}
                      className="text-blue-600 hover:underline"
                    >
                      Voir plus
                    </button>
                  )}
                </div>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (resource: any) => (
                <div className="flex flex-col space-x-2">
                  <button
                    onClick={() => setSelectedResource(resource)}
                    className="text-blue-600 dark:text-blue-400"
                  >
                    Voir
                  </button>
                  <button
                    onClick={() => handleDelete(resource.id)}
                    className="text-red-600 dark:text-red-400"
                  >
                    Supprimer
                  </button>
                  <button
                    onClick={() =>
                      handleRefreshOCR(resource.id, resource.fileLink)
                    }
                    className="text-green-600 dark:text-green-400"
                  >
                    Actualiser OCR
                  </button>
                </div>
              ),
            },
          ]}
          emptyMessage="Aucune ressource disponible. Veuillez en ajouter."
        />

        {selectedResource && (
          <Modal
            isOpen={!!selectedResource}
            onClose={() => setSelectedResource(null)}
            title="Aperçu de la ressource"
            className="max-w-6xl w-full"
          >
            <div className="flex items-center justify-center w-full h-[90vh] bg-gray-100">
              {selectedResource &&
              selectedResource.fileType &&
              (selectedResource.fileType.endsWith("jpg") ||
                selectedResource.fileType.endsWith("png") ||
                selectedResource.fileType.endsWith("jpeg")) ? (
                <img
                  src={selectedResource.fileLink}
                  alt="Aperçu de la ressource"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <iframe
                  src={selectedResource.fileLink}
                  className="w-full h-full border rounded"
                  title="Aperçu de la ressource"
                ></iframe>
              )}
            </div>
          </Modal>
        )}

        {/* Modal pour les données OCR */}
        {selectedOCR && (
          <Modal
            isOpen={!!selectedOCR}
            onClose={() => setSelectedOCR(null)}
            title="Données OCR complètes"
            className="max-w-2xl"
          >
            <div className="p-4">
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {selectedOCR}
              </p>
            </div>
          </Modal>
        )}

        {/* Bouton flottant centré pour mobile */}
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 md:hidden flex items-center space-y-2">
          {/* Sélecteur de type */}
          <select
            value={newResourceType}
            onChange={(e) => setNewResourceType(e.target.value as ResourceType)}
            className="border rounded p-2 mx-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow transition-colors duration-300"
          >
            {Object.values(ResourceType).map((type) => (
              <option
                key={type}
                value={type}
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {type}
              </option>
            ))}
          </select>

          {/* Bouton flottant */}
          <label className="bg-green-600 hover:bg-green-700 text-white font-medium p-4 my-4 rounded-full flex items-center justify-center shadow-lg cursor-pointer">
            <input
              type="file"
              accept="*/*"
              className="hidden"
              onChange={handleCaptureResource}
            />
            <Plus className="h-5 w-5" />
          </label>
        </div>
      </div>
    </HelmetProvider>
  );
};

export default ResourcePage;
