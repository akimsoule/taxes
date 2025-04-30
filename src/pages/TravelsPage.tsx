import React, { useState } from "react";
import DataTable from "../components/DataTable";
import CRUDForm from "../components/CRUDForm";
import Modal from "../components/Modal";
import { useDataContext } from "../context/DataContext";
import { Plus } from "lucide-react";

const TravelsPage: React.FC = () => {
  const { data, addItem, updateItem, deleteItem } = useDataContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTravel, setEditingTravel] = useState<any | null>(null);

  const handleAdd = (newTravel: any) => {
    addItem("travels", { ...newTravel, id: Date.now().toString() });
    setIsModalOpen(false);
  };

  const handleUpdate = (updatedTravel: any) => {
    updateItem("travels", updatedTravel);
    setEditingTravel(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteItem("travels", id);
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
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
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
          { key: "id", label: "ID" },
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

      {/* Modal */}
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
              options: data.activities.map((activity: any) => ({
                value: activity.id,
                label: activity.name,
              })),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default TravelsPage;