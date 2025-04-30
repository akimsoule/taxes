import React, { useState } from "react";
import DataTable from "../components/DataTable";
import CRUDForm from "../components/CRUDForm";
import Modal from "../components/Modal";
import { useDataContext } from "../context/DataContext";
import { Plus } from "lucide-react";

const ReceiptImagesPage: React.FC = () => {
  const { data, addItem, updateItem, deleteItem } = useDataContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<any | null>(null);

  const handleAdd = (newImage: any) => {
    addItem("receiptImages", {
      ...newImage,
      id: Date.now().toString(),
    });
    setIsModalOpen(false);
  };

  const handleUpdate = (updatedImage: any) => {
    updateItem("receiptImages", updatedImage);
    setEditingImage(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteItem("receiptImages", id);
  };

  const openModalForAdd = () => {
    setEditingImage(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (image: any) => {
    setEditingImage(image);
    setIsModalOpen(true);
  };

  const handleCaptureImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newImage = {
        receiptId: "",
        imageUrl: URL.createObjectURL(file), // Utilisation d'une URL temporaire
        ocrRawData: "",
        uploadedAt: new Date().toISOString(),
      };
      handleAdd(newImage);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Receipt Images
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={openModalForAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded-full flex items-center justify-center"
            aria-label="Add Receipt Image"
          >
            <Plus className="h-5 w-5" />
          </button>
          <label className="bg-green-600 hover:bg-green-700 text-white font-medium p-2 rounded-full flex items-center justify-center cursor-pointer">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleCaptureImage}
            />
            Capture
          </label>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={data.receiptImages}
        headers={[
          { key: "receiptId", label: "Receipt ID" },
          { key: "imageUrl", label: "Image URL" },
          { key: "ocrRawData", label: "OCR Data" },
          { key: "uploadedAt", label: "Uploaded At" },
          {
            key: "actions",
            label: "Actions",
            render: (image: any) => (
              <div className="flex space-x-2">
                <button
                  onClick={() => openModalForEdit(image)}
                  className="text-blue-600 dark:text-blue-400"
                >
                  Edit
                </button>
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingImage ? "Edit Receipt Image" : "Add Receipt Image"}
      >
        <CRUDForm
          initialData={
            editingImage || {
              receiptId: "",
              imageUrl: "",
              ocrRawData: "",
              uploadedAt: new Date().toISOString(),
            }
          }
          onSubmit={editingImage ? handleUpdate : handleAdd}
          fields={[
            { key: "receiptId", label: "Receipt ID", type: "text" },
            { key: "imageUrl", label: "Image URL", type: "text" },
            { key: "ocrRawData", label: "OCR Data", type: "textarea" },
            { key: "uploadedAt", label: "Uploaded At", type: "datetime-local" },
          ]}
        />
      </Modal>
    </div>
  );
};

export default ReceiptImagesPage;
