import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import CRUDForm from "../components/CRUDForm";
import Modal from "../components/Modal";
import { useDataContext } from "../context/DataContext";
import { Plus } from "lucide-react";

const MerchantsPage: React.FC = () => {
  const { data, fetchData, addItem, updateItem, deleteItem } = useDataContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<any | null>(null);
  const totalItemsFetched = 1000;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMerchants = async () => {
      setIsLoading(true);
      try {
        await fetchData("merchants", 1, totalItemsFetched);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMerchants();
  }, []);

  const handleAdd = async (newMerchant: any) => {
    setIsLoading(true);
    try {
      await addItem("merchants", { ...newMerchant, id: Date.now().toString() });
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (updatedMerchant: any) => {
    setIsLoading(true);
    try {
      await updateItem("merchants", updatedMerchant);
      setEditingMerchant(null);
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteItem("merchants", id);
    } finally {
      setIsLoading(false);
    }
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
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      )}

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
