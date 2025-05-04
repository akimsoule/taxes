import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import { useDataContext } from "../context/DataContext";
import { Plus } from "lucide-react";
import { useAuth } from "@workos-inc/authkit-react";

const ImagesPage: React.FC = () => {
  const { user } = useAuth();
  const { data, fetchImageData, addImage, deleteImage } = useDataContext();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedOCRData, setSelectedOCRData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>(
    {}
  ); // Suivi des images en cours de chargement
  const totalItemsFetched = 1000;

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      try {
        await fetchImageData("images", 1, totalItemsFetched);
      } finally {
        setIsLoading(false);
      }
    };
    fetchImages();
  }, []);

  const handleAdd = async (file: File) => {
    setIsLoading(true);
    try {
      if (user) {
        await addImage(file, user.email);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteImage("images", id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptureImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleAdd(file);
    }
  };

  const handleImageLoad = (id: string) => {
    setLoadingImages((prev) => ({ ...prev, [id]: false }));
  };

  const handleImageError = (id: string) => {
    setLoadingImages((prev) => ({ ...prev, [id]: false }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="flex flex-col items-center">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
            <p className="text-white mt-4">Traitement en cours...</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Images
        </h1>
        <div className="flex space-x-2">
          <label className="bg-green-600 hover:bg-green-700 text-white font-medium p-2 rounded-full flex items-center justify-center cursor-pointer">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleCaptureImage}
            />
            <Plus className="h-5 w-5" />
          </label>
        </div>
      </div>

      <DataTable
        data={data.images}
        headers={[
          {
            key: "imageUrl",
            label: "Image",
            render: (image: any) => {
              const isLoadingImage = loadingImages[image.id] ?? true;
              return (
                <div className="relative w-16 h-16">
                  {isLoadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded">
                      <div className="loader border-t-2 border-blue-500 rounded-full w-6 h-6 animate-spin"></div>
                    </div>
                  )}
                  <img
                    src={image.base64 ?? image.fileLink}
                    alt="Receipt"
                    className={`w-16 h-16 object-cover rounded cursor-pointer ${
                      isLoadingImage ? "opacity-0" : "opacity-100"
                    }`}
                    onLoad={() => handleImageLoad(image.id)}
                    onError={() => handleImageError(image.id)}
                    onClick={() =>
                      setSelectedImage(image.base64 ?? image.fileLink)
                    }
                  />
                </div>
              );
            },
          },
          {
            key: "ocrRawData",
            label: "OCR Data",
            render: (image: any) => (
              <span
                className="cursor-pointer text-blue-600 hover:underline"
                onClick={() => setSelectedOCRData(image.ocrRawData)}
              >
                {image.ocrRawData?.length > 50
                  ? `${image.ocrRawData.substring(0, 50)}...`
                  : image.ocrRawData}
              </span>
            ),
          },
          { key: "uploadedAt", label: "Uploaded At" },
          {
            key: "actions",
            label: "Actions",
            render: (image: any) => (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDelete(image.id)}
                  className="text-red-600 dark:text-red-400"
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]}
        emptyMessage="No receipt images available. Please add images."
      />

      {selectedImage && (
        <Modal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          title="Receipt Image"
        >
          <div className="flex justify-center">
            <img
              src={selectedImage}
              alt="Full Receipt"
              className="max-w-full max-h-screen"
            />
          </div>
        </Modal>
      )}

      {selectedOCRData && (
        <Modal
          isOpen={!!selectedOCRData}
          onClose={() => setSelectedOCRData(null)}
          title="OCR Data"
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Données OCR</h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedOCRData || "");
                  alert("Données copiées dans le presse-papiers !");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded"
              >
                Copier
              </button>
            </div>
            <div className="border p-4 rounded bg-gray-100 dark:bg-gray-700 overflow-y-auto max-h-64">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                {selectedOCRData}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ImagesPage;
