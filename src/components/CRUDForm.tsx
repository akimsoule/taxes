import React, { useState } from "react";

interface CRUDFormProps {
  initialData: any;
  onSubmit: (data: any) => void;
  fields: { key: string; label: string; type: string; options?: { value: string; label: string }[] }[];
}

const CRUDForm: React.FC<CRUDFormProps> = ({ initialData, onSubmit, fields }) => {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {field.label}
          </label>
          {field.type === "select" ? (
            <select
              name={field.key}
              value={formData[field.key] || ""}
              onChange={handleChange}
              className="mt-1 block w-full h-12 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm transition duration-200 ease-in-out hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none"
            >
              <option value="" disabled>
                Select an option
              </option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              name={field.key}
              value={formData[field.key] || ""}
              onChange={handleChange}
              className="mt-1 block w-full h-12 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm transition duration-200 ease-in-out hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none"
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
      >
        Save
      </button>
    </form>
  );
};

export default CRUDForm;