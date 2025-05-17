import React, { useState, useEffect, useCallback } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async"; // Import de react-helmet
import DataTable from "../components/DataTable";
import CRUDForm from "../components/CRUDForm";
import Modal from "../components/Modal";
import { useDataContext } from "../context/DataContext";
import { Plus } from "lucide-react";

const BanksPage: React.FC = () => {
  const { data, fetchItem, addItem, updateItem } = useDataContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false); // État pour le chargement
  const [hasFetched, setHasFetched] = useState(false); // État pour vérifier si les données ont été chargées
  const totalItemsFetched = 1000;

  const fetchBanks = useCallback(async () => {
    setIsLoading(true); // Début du chargement
    try {
      await fetchItem("banks", 1, totalItemsFetched);
      setHasFetched(true); // Marquer les données comme chargées
    } finally {
      setIsLoading(false); // Fin du chargement
    }
  }, [fetchItem, totalItemsFetched]);

  useEffect(() => {
    if (!hasFetched) {
      fetchBanks();
    }
  }, [hasFetched, fetchBanks]);

  const handleAdd = async (newBank: any) => {
    setIsLoading(true); // Début du chargement
    try {
      await addItem("banks", { ...newBank });
      setIsModalOpen(false);
    } finally {
      setIsLoading(false); // Fin du chargement
    }
  };

  const handleUpdate = async (updatedBank: any) => {
    setIsLoading(true); // Début du chargement
    try {
      await updateItem("banks", updatedBank);
      setEditingBank(null);
      setIsModalOpen(false);
    } finally {
      setIsLoading(false); // Fin du chargement
    }
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
    <>
      <HelmetProvider>
        <Helmet>
          <title>Banks - Gestion des Banques</title>
          <meta
            name="description"
            content="Page de gestion des banques pour les utilisateurs."
          />
          <meta
            name="keywords"
            content="banques, gestion, utilisateurs, application"
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
            data={data.banks} // Passez l'objet complet contenant items et pagination
            headers={[
              { key: "name", label: "Name" },
              {
                key: "actions",
                label: "Actions",
                render: (bank: any) => (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModalForEdit(bank)}
                      className="text-blue-600 dark:text-blue-400"
                    >
                      Edit
                    </button>
                  </div>
                ),
              },
            ]}
            emptyMessage="No banks available."
          />

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
      </HelmetProvider>
    </>
  );
};

export default BanksPage;
