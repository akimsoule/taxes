import React, { useState } from "react";
import DataTable from "../components/DataTable";
import CRUDForm from "../components/CRUDForm";
import Modal from "../components/Modal";
import { useDataContext } from "../context/DataContext";
import { Plus } from "lucide-react";

const MerchantsPage: React.FC = () => {
  const { data, addItem, updateItem, deleteItem } = useDataContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<any | null>(null);

  const handleAdd = (newMerchant: any) => {
    addItem("merchants", { ...newMerchant, id: Date.now().toString() });
    setIsModalOpen(false);
  };

  const handleUpdate = (updatedMerchant: any) => {
    updateItem("merchants", updatedMerchant);
    setEditingMerchant(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteItem("merchants", id);
  };

  const openModalForAdd = () => {
    setEditingMerchant(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (merchant: any) => {
    setEditingMerchant(merchant);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Merchants
        </h1>
        <button
          onClick={openModalForAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded-full flex items-center justify-center"
          aria-label="Add Merchant"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <DataTable
        data={data.merchants}
        headers={[
          { key: "name", label: "Name" },
          {
            key: "actions",
            label: "Actions",
            render: (merchant: any) => (
              <div className="flex space-x-2">
                <button
                  onClick={() => openModalForEdit(merchant)}
                  className="text-blue-600 dark:text-blue-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(merchant.id)}
                  className="text-red-600 dark:text-red-400"
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]}
        emptyMessage="No merchants available."
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMerchant ? "Edit Merchant" : "Add Merchant"}
      >
        <CRUDForm
          initialData={
            editingMerchant || { name: "", createdAt: "", updatedAt: "" }
          }
          onSubmit={editingMerchant ? handleUpdate : handleAdd}
          fields={[{ key: "name", label: "Name", type: "text" }]}
        />
      </Modal>
    </div>
  );
};

export default MerchantsPage;
