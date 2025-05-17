import React, { useState, useEffect, useCallback } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import DataTable from "../components/DataTable";
import CRUDForm from "../components/CRUDForm";
import Modal from "../components/Modal";
import { useDataContext } from "../context/DataContext";
import { Plus } from "lucide-react";

const TravelsPage: React.FC = () => {
  const { data, fetchItem, addItem, updateItem, deleteItem } = useDataContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTravel, setEditingTravel] = useState<any | null>(null);
  const totalItemsFetched = 20;
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchTravels = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchItem("travels", 1, totalItemsFetched);
      setHasFetched(true);
    } finally {
      setIsLoading(false);
    }
  }, [fetchItem, totalItemsFetched]);

  useEffect(() => {
    if (!hasFetched) {
      fetchTravels();
    }
  }, [hasFetched, fetchTravels]);

  const handleAdd = async (newTravel: any) => {
    setIsLoading(true);
    try {
      await addItem("travels", { ...newTravel });
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (updatedTravel: any) => {
    setIsLoading(true);
    try {
      await updateItem("travels", updatedTravel);
      setEditingTravel(null);
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteItem("travels", id);
    } finally {
      setIsLoading(false);
    }
  };

  const openModalForAdd = () => {
    setEditingTravel(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (travel: any) => {
    setEditingTravel(travel);
    setIsModalOpen(true);
  };

  return (
    <HelmetProvider>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <Helmet>
          <title>Travels - Gestion des Déplacements</title>
          <meta
            name="description"
            content="Page de gestion des déplacements pour les utilisateurs, incluant l'ajout, la modification et la suppression des enregistrements de voyages."
          />
          <meta
            name="keywords"
            content="déplacements, voyages, gestion, utilisateurs, application"
          />
        </Helmet>

        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Travels
          </h1>
          <button
            onClick={openModalForAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded-full flex items-center justify-center"
            aria-label="Add Travel"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <DataTable
          data={data.travels}
          headers={[
            { key: "date", label: "Date" },
            { key: "distanceKm", label: "Distance (km)" },
            { key: "origin", label: "Origin" },
            { key: "destination", label: "Destination" },
            { key: "notes", label: "Notes" },
            { key: "userId", label: "User ID" },
            { key: "activityId", label: "Activity ID" },
            {
              key: "actions",
              label: "Actions",
              render: (travel: any) => (
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModalForEdit(travel)}
                    className="text-blue-600 dark:text-blue-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(travel.id)}
                    className="text-red-600 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
          emptyMessage="No travel records available."
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingTravel ? "Edit Travel" : "Add Travel"}
        >
          <CRUDForm
            initialData={
              editingTravel || {
                date: "",
                distanceKm: "",
                origin: "",
                destination: "",
                notes: "",
                userId: "",
                activityId: "",
                createdAt: "",
                updatedAt: "",
              }
            }
            onSubmit={editingTravel ? handleUpdate : handleAdd}
            fields={[
              { key: "date", label: "Date", type: "date" },
              { key: "distanceKm", label: "Distance (km)", type: "number" },
              { key: "origin", label: "Origin", type: "text" },
              { key: "destination", label: "Destination", type: "text" },
              { key: "notes", label: "Notes", type: "text" },
              { key: "userId", label: "User ID", type: "text" },
              {
                key: "activityId",
                label: "Activity",
                type: "select",
                options: data.activities.items.map((activity: any) => ({
                  value: activity.id,
                  label: activity.name,
                })),
              },
            ]}
          />
        </Modal>
      </div>
    </HelmetProvider>
  );
};

export default TravelsPage;
