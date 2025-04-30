import React, { useState } from "react";
import DataTable from "../components/DataTable";
import CRUDForm from "../components/CRUDForm";
import Modal from "../components/Modal";
import { useDataContext } from "../context/DataContext";
import { Plus } from "lucide-react";

const ReceiptsPage: React.FC = () => {
  const { data, addItem, updateItem, deleteItem } = useDataContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<any | null>(null);

  const handleAdd = (newReceipt: any) => {
    addItem("receipts", {
      ...newReceipt,
      id: Date.now().toString(),
    });
    setIsModalOpen(false);
  };

  const handleUpdate = (updatedReceipt: any) => {
    updateItem("receipts", updatedReceipt);
    setEditingReceipt(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteItem("receipts", id);
  };

  const openModalForAdd = () => {
    setEditingReceipt(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (receipt: any) => {
    setEditingReceipt(receipt);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Receipts
        </h1>
        <button
          onClick={openModalForAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded-full flex items-center justify-center"
          aria-label="Add Receipt"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        data={data.receipts}
        headers={[
          { key: "date", label: "Date" },
          { key: "merchant", label: "Merchant" },
          { key: "total", label: "Total" },
          { key: "currency", label: "Currency" },
          { key: "taxAmount", label: "Tax Amount" },
          { key: "paymentMethod", label: "Payment Method" },
          {
            key: "actions",
            label: "Actions",
            render: (receipt: any) => (
              <div className="flex space-x-2">
                <button
                  onClick={() => openModalForEdit(receipt)}
                  className="text-blue-600 dark:text-blue-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(receipt.id)}
                  className="text-red-600 dark:text-red-400"
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]}
        emptyMessage="No receipts available. Please add receipts."
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReceipt ? "Edit Receipt" : "Add Receipt"}
      >
        <CRUDForm
          initialData={
            editingReceipt || {
              date: "",
              merchant: "",
              total: "",
              currency: "CAD",
              taxAmount: "",
              paymentMethod: "",
            }
          }
          onSubmit={editingReceipt ? handleUpdate : handleAdd}
          fields={[
            { key: "date", label: "Date", type: "date" },
            { key: "merchant", label: "Merchant", type: "text" },
            { key: "total", label: "Total", type: "number" },
            { key: "currency", label: "Currency", type: "text" },
            { key: "taxAmount", label: "Tax Amount", type: "number" },
            { key: "paymentMethod", label: "Payment Method", type: "text" },
          ]}
        />
      </Modal>
    </div>
  );
};

export default ReceiptsPage;