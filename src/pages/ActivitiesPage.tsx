import React, { useState, useEffect, useCallback } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async"; // Import de react-helmet
import DataTable from "../components/DataTable";
import CRUDForm from "../components/CRUDForm";
import Modal from "../components/Modal";
import { useDataContext } from "../context/DataContext";
import { Plus } from "lucide-react";
import { ActivityPayload } from "../types/models";
import { useAuth } from "@workos-inc/authkit-react";

const ActivitiesPage: React.FC = () => {
  const { user } = useAuth();
  const { data, fetchItem, addItem, updateItem, deleteItem } = useDataContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const totalItemsFetched = 100;

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchItem("activities", 1, totalItemsFetched);
      setHasFetched(true);
    } finally {
      setIsLoading(false);
    }
  }, [fetchItem, totalItemsFetched]);

  useEffect(() => {
    if (!hasFetched) {
      fetchActivities();
    }
  }, [hasFetched, fetchActivities]);

  const handleAdd = async (newActivity: ActivityPayload) => {
    if (user) {
      setIsLoading(true);
      try {
        newActivity.userEmail = user.email;
        await addItem("activities", { ...newActivity });
        setIsModalOpen(false);
        fetchActivities();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpdate = async (updatedActivity: any) => {
    setIsLoading(true);
    try {
      await updateItem("activities", updatedActivity);
      setEditingActivity(null);
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteItem("activities", id);
    } finally {
      setIsLoading(false);
    }
  };

  const openModalForAdd = () => {
    setEditingActivity(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (activity: any) => {
    setEditingActivity(activity);
    setIsModalOpen(true);
  };

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Activities - Gestion des Activités</title>
          <meta
            name="description"
            content="Page de gestion des activités pour les utilisateurs."
          />
          <meta
            name="keywords"
            content="activités, gestion, utilisateurs, application"
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
              Activities
            </h1>
            <button
              onClick={openModalForAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded-full flex items-center justify-center"
              aria-label="Add Activity"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <DataTable
            data={data.activities}
            headers={[
              { key: "name", label: "Name" },
              { key: "startDate", label: "Start Date" },
              { key: "endDate", label: "End Date" },
              {
                key: "actions",
                label: "Actions",
                render: (activity: any) => (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModalForEdit(activity)}
                      className="text-blue-600 dark:text-blue-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(activity.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                ),
              },
            ]}
            emptyMessage="No activities available."
          />

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingActivity ? "Edit Activity" : "Add Activity"}
          >
            <CRUDForm
              initialData={
                editingActivity || {
                  name: "",
                  startDate: "",
                  endDate: "",
                  createdAt: "",
                  updatedAt: "",
                }
              }
              onSubmit={editingActivity ? handleUpdate : handleAdd}
              fields={[
                { key: "name", label: "Name", type: "text" },
                { key: "startDate", label: "Start Date", type: "date" },
                { key: "endDate", label: "End Date", type: "date" },
              ]}
            />
          </Modal>
        </div>
      </HelmetProvider>
    </>
  );
};

export default ActivitiesPage;
