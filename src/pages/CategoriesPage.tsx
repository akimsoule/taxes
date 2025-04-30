import React, { useState } from "react";
import DataTable from "../components/DataTable";
import CRUDForm from "../components/CRUDForm";
import Modal from "../components/Modal";
import { useDataContext } from "../context/DataContext";
import { Plus } from "lucide-react";

const CategoriesPage: React.FC = () => {
  const { data, addItem, updateItem, deleteItem } = useDataContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const handleAdd = (newCategory: any) => {
    addItem("categories", { ...newCategory, id: Date.now().toString() });
    setIsModalOpen(false);
  };

  const handleUpdate = (updatedCategory: any) => {
    updateItem("categories", updatedCategory);
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteItem("categories", id);
  };

  const openModalForAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (category: any) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Categories
        </h1>
        <button
          onClick={openModalForAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded-full flex items-center justify-center"
          aria-label="Add Category"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <DataTable
        data={data.categories}
        headers={[
          { key: "id", label: "ID" },
          { key: "name", label: "Name" },
          {
            key: "actions",
            label: "Actions",
            render: (category: any) => (
              <div className="flex space-x-2">
                <button
                  onClick={() => openModalForEdit(category)}
                  className="text-blue-600 dark:text-blue-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 dark:text-red-400"
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]}
        emptyMessage="No categories available."
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Add Category"}
      >
        <CRUDForm
          initialData={
            editingCategory || { name: "", createdAt: "", updatedAt: "" }
          }
          onSubmit={editingCategory ? handleUpdate : handleAdd}
          fields={[
            { key: "name", label: "Name", type: "text" }
          ]}
        />
      </Modal>
    </div>
  );
};

export default CategoriesPage;
