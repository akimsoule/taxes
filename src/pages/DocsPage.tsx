import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import CRUDForm from "../components/CRUDForm";
import Modal from "../components/Modal";
import { useDataContext } from "../context/DataContext";
import { Plus } from "lucide-react";
import { Doc } from "../types/models";

const DocsPage: React.FC = () => {
  const { data, fetchData, addItem, updateItem, deleteItem } = useDataContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Doc | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // État pour le chargement
  const totalItemsFetched = 1000; // Nombre d'éléments par page
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasFetched) {
      const fetchDocs = async () => {
        setIsLoading(true); // Début du chargement
        try {
          await fetchData("docs", 1, totalItemsFetched);
          setHasFetched(true);
        } finally {
          setIsLoading(false); // Fin du chargement
        }
      };

      fetchDocs();
    }
  }, [hasFetched, fetchData, totalItemsFetched]);

  const handleAdd = async (newDoc: Doc) => {
    setIsLoading(true); // Début du chargement
    try {
      await addItem("docs", {
        ...newDoc,
        createdAt: new Date().toISOString(),
      });
      setIsModalOpen(false);
    } finally {
      setIsLoading(false); // Fin du chargement
    }
  };

  const handleUpdate = async (updatedDoc: Doc) => {
    setIsLoading(true); // Début du chargement
    try {
      await updateItem("docs", updatedDoc);
      setEditingDoc(null);
      setIsModalOpen(false);
    } finally {
      setIsLoading(false); // Fin du chargement
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true); // Début du chargement
    try {
      await deleteItem("docs", id);
    } finally {
      setIsLoading(false); // Fin du chargement
    }
  };

  const openModalForAdd = () => {
    setEditingDoc(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (doc: Doc) => {
    setEditingDoc(doc);
    setIsModalOpen(true);
  };

  const openBookView = (docId: string) => {
    navigate(`/book-view/${docId}`);
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
          Documents
        </h1>
        <button
          onClick={openModalForAdd}
          className="bg-green-600 hover:bg-green-700 text-white font-medium p-2 rounded-full flex items-center justify-center"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <DataTable
        data={data.docs} // Passez l'objet complet contenant items et pagination
        headers={[
          { key: "title", label: "Title" },
          { key: "description", label: "Description" },
          { key: "createdAt", label: "Created At" },
          {
            key: "actions",
            label: "Actions",
            render: (doc: any) => (
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => openModalForEdit(doc)}
                  className="text-blue-600 dark:text-blue-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-600 dark:text-red-400"
                >
                  Delete
                </button>
                <button
                  onClick={() => openBookView(doc.id)}
                  className="text-purple-600 dark:text-purple-400"
                >
                  View as Book
                </button>
              </div>
            ),
          },
        ]}
        emptyMessage="No documents available."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDoc ? "Edit Document" : "Add Document"}
      >
        <CRUDForm
          initialData={
            editingDoc || {
              title: "",
              description: "",
              createdAt: new Date().toISOString(),
            }
          }
          onSubmit={editingDoc ? handleUpdate : handleAdd}
          fields={[
            { key: "title", label: "Title", type: "text" },
            { key: "description", label: "Description", type: "textarea" },
          ]}
        />
      </Modal>
    </div>
  );
};

export default DocsPage;
