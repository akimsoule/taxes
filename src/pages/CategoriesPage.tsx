import React, { useState, useEffect, useCallback } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async"; // Import de react-helmet
import DataTable from "../components/DataTable";
import CRUDForm from "../components/CRUDForm";
import Modal from "../components/Modal";
import { useDataContext } from "../context/DataContext";
import { Plus } from "lucide-react";

const CategoriesPage: React.FC = () => {
  const { data, fetchItem, addItem, updateItem, deleteItem } = useDataContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false); // État pour le chargement
  const [hasFetched, setHasFetched] = useState(false); // État pour vérifier si les données ont été chargées
  const totalItemsFetched = 1000;

  const fetchCategories = useCallback(async () => {
    setIsLoading(true); // Début du chargement
    try {
      await fetchItem("categories", 1, totalItemsFetched);
      setHasFetched(true); // Marquer les données comme chargées
    } finally {
      setIsLoading(false); // Fin du chargement
    }
  }, [fetchItem, totalItemsFetched]);

  useEffect(() => {
    if (!hasFetched) {
      fetchCategories();
    }
  }, [hasFetched, fetchCategories]);

  const handleAdd = async (newCategory: any) => {
    setIsLoading(true); // Début du chargement
    try {
      await addItem("categories", { ...newCategory });
      setIsModalOpen(false);
    } finally {
      setIsLoading(false); // Fin du chargement
    }
  };

  const handleUpdate = async (updatedCategory: any) => {
    setIsLoading(true); // Début du chargement
    try {
      await updateItem("categories", updatedCategory);
      setEditingCategory(null);
      setIsModalOpen(false);
    } finally {
      setIsLoading(false); // Fin du chargement
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true); // Début du chargement
    try {
      await deleteItem("categories", id);
    } finally {
      setIsLoading(false); // Fin du chargement
    }
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
    <>
      <HelmetProvider>
        <Helmet>
          <title>Categories - Gestion des Catégories</title>
          <meta
            name="description"
            content="Page de gestion des catégories pour les utilisateurs."
          />
          <meta
            name="keywords"
            content="catégories, gestion, utilisateurs, application"
          />
        </Helmet>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          {isLoading && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
            </div>
          )}

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
            data={data.categories} // Passez l'objet complet contenant items et pagination
            headers={[
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
              fields={[{ key: "name", label: "Name", type: "text" }]}
            />
          </Modal>
        </div>
      </HelmetProvider>
    </>
  );
};

export default CategoriesPage;
