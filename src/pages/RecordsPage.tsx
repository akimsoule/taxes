import React, { useState } from "react";
import DataTable from "../components/DataTable";
import CRUDForm from "../components/CRUDForm";
import Modal from "../components/Modal";
import { useDataContext } from "../context/DataContext";
import { Plus } from "lucide-react";
import HTMLTangerineUploader from "../components/HTMLTangerineUploader";
import HTMLRBCUploader from "../components/HTMLRBCUploader";

const RecordsPage: React.FC = () => {
  const { data, addItem, updateItem, deleteItem } = useDataContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [selectedBank, setSelectedBank] = useState<string>("");

  const handleAdd = (newRecord: any) => {
    addItem("records", {
      ...newRecord,
      id: Date.now().toString(),
      bankId: selectedBank,
    });
    setIsModalOpen(false);
  };

  const handleUpdate = (updatedRecord: any) => {
    updateItem("records", updatedRecord);
    setEditingRecord(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteItem("records", id);
  };

  const openModalForAdd = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (record: any) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBank(e.target.value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Records
        </h1>
        <button
          onClick={openModalForAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded-full flex items-center justify-center"
          aria-label="Add Record"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Bank Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Select a Bank
        </label>
        <select
          value={selectedBank}
          onChange={handleBankChange}
          className="mt-1 block w-full h-12 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm transition duration-200 ease-in-out hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none"
        >
          <option value="" disabled>
            Choose a bank
          </option>
          {data.banks.map((bank: any) => (
            <option key={bank.id} value={bank.id}>
              {bank.name}
            </option>
          ))}
        </select>
      </div>

      {/* Uploader */}
      {selectedBank === "TANGERINE" && <HTMLTangerineUploader />}
      {selectedBank === "RBC" && <HTMLRBCUploader />}

      {/* Data Table */}
      <DataTable
        data={data.records}
        headers={[
          // { key: "id", label: "ID" },
          { key: "date", label: "Date" },
          { key: "description", label: "Description" },
          { key: "amount", label: "Amount" },
          { key: "currency", label: "Currency" },
          { key: "deductible", label: "Deductible" },
          { key: "deductibleAmount", label: "Deductible Amount" },
          { key: "categoryId", label: "Category ID" },
          { key: "activityId", label: "Activity ID" },
          { key: "bankId", label: "Bank ID" },
          { key: "receiptId", label: "Receipt ID" },
          {
            key: "actions",
            label: "Actions",
            render: (record: any) => (
              <div className="flex space-x-2">
                <button
                  onClick={() => openModalForEdit(record)}
                  className="text-blue-600 dark:text-blue-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="text-red-600 dark:text-red-400"
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]}
        emptyMessage="No records available. Please upload records data from the Dashboard."
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? "Edit Record" : "Add Record"}
      >
        <CRUDForm
          initialData={
            editingRecord || {
              description: "",
              date: "",
              amount: "",
              currency: "CAD",
              deductible: false,
              deductibleAmount: "",
              categoryId: "",
              activityId: "",
              bankId: selectedBank,
              receiptId: "",
              createdAt: "",
              updatedAt: "",
            }
          }
          onSubmit={editingRecord ? handleUpdate : handleAdd}
          fields={[
            { key: "description", label: "Description", type: "text" },
            { key: "date", label: "Date", type: "date" },
            { key: "amount", label: "Amount", type: "number" },
            { key: "currency", label: "Currency", type: "text" },
            { key: "deductible", label: "Deductible", type: "checkbox" },
            {
              key: "deductibleAmount",
              label: "Deductible Amount",
              type: "number",
            },
            { key: "categoryId", label: "Category ID", type: "text" },
            { key: "activityId", label: "Activity ID", type: "text" },
            {
              key: "bankId",
              label: "Bank",
              type: "select",
              options: data.banks.map((bank: any) => ({
                value: bank.id,
                label: bank.name,
              })),
            },
            { key: "receiptId", label: "Receipt ID", type: "text" },
          ]}
        />
      </Modal>
    </div>
  );
};

export default RecordsPage;
