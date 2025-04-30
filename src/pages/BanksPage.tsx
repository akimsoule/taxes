import React, { useState } from "react";
import DataTable from "../components/DataTable";
import CRUDForm from "../components/CRUDForm";
import Modal from "../components/Modal";
import { useDataContext } from "../context/DataContext";
import { Plus } from "lucide-react";

const BanksPage: React.FC = () => {
  const { data, addItem, updateItem, deleteItem } = useDataContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<any | null>(null);

  const handleAdd = (newBank: any) => {
    addItem("banks", { ...newBank, id: Date.now().toString() });
    setIsModalOpen(false);
  };

  const handleUpdate = (updatedBank: any) => {
    updateItem("banks", updatedBank);
    setEditingBank(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteItem("banks", id);
  };

  const openModalForAdd = () => {
    setEditingBank(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (bank: any) => {
    setEditingBank(bank);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Banks
        </h1>
        <button
          onClick={openModalForAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded-full flex items-center justify-center"
          aria-label="Add Bank"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <DataTable
        data={data.banks}
        headers={[
          // { key: "id", label: "ID" },
          { key: "name", label: "Name" },
        ]}
        emptyMessage="No banks available."
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBank ? "Edit Bank" : "Add Bank"}
      >
        <CRUDForm
          initialData={
            editingBank || { name: "", createdAt: "", updatedAt: "" }
          }
          onSubmit={editingBank ? handleUpdate : handleAdd}
          fields={[{ key: "name", label: "Name", type: "text" }]}
        />
      </Modal>
    </div>
  );
};

export default BanksPage;
