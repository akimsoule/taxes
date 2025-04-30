import React, { useState } from "react";
import DataTable from "../components/DataTable";
import CRUDForm from "../components/CRUDForm";
import Modal from "../components/Modal";
import { useDataContext } from "../context/DataContext";
import { Plus } from "lucide-react";

const ActivitiesPage: React.FC = () => {
  const { data, addItem, updateItem, deleteItem } = useDataContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any | null>(null);

  const handleAdd = (newActivity: any) => {
    addItem("activities", { ...newActivity, id: Date.now().toString() });
    setIsModalOpen(false);
  };

  const handleUpdate = (updatedActivity: any) => {
    updateItem("activities", updatedActivity);
    setEditingActivity(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteItem("activities", id);
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
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
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
          // { key: "id", label: "ID" },
          { key: "name", label: "Name" },
          { key: "startDate", label: "Start Date" },
          { key: "endDate", label: "End Date" },
          { key: "userId", label: "User ID" },
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

      {/* Modal */}
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
              userId: "",
              createdAt: "",
              updatedAt: "",
            }
          }
          onSubmit={editingActivity ? handleUpdate : handleAdd}
          fields={[
            { key: "name", label: "Name", type: "text" },
            { key: "startDate", label: "Start Date", type: "date" },
            { key: "endDate", label: "End Date", type: "date" },
            { key: "userId", label: "User ID", type: "text" },
          ]}
        />
      </Modal>
    </div>
  );
};

export default ActivitiesPage;