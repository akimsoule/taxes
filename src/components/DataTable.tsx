import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps {
  data: {
    items: Record<string, any>[]; // Les données paginées
    pagination: {
      totalItems: number;
      totalPages: number;
    };
  };
  headers: {
    key: string;
    label: string;
    render?: (item: Record<string, any>) => React.ReactNode;
  }[];
  emptyMessage?: string;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  headers,
  emptyMessage = "No data available.",
}) => {
  const [currentPage, setCurrentPage] = useState(1); // État pour la page actuelle
  const [searchQuery, setSearchQuery] = useState(""); // État pour la recherche

  const { items } = data;
  const pageSize = 10; // Fixer le nombre d'éléments par page à 10

  // Trier les données par date (les plus récentes en premier)
  const sortedItems = [...items].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA; // Les plus récents en premier
  });

  // Filtrer les données en fonction de la recherche
  const filteredItems = sortedItems.filter((item) =>
    headers.some((header) =>
      String(item[header.key] || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
  );

  // Pagination des données filtrées
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredItems.length / pageSize)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatCellValue = (value: any, key?: string): string => {
    if (value === undefined || value === null) return "—";
    if (key === "date" || key === "uploadedAt") {
      // Formater les dates au format YYYY-MM-DD
      const date = new Date(value);
      return !isNaN(date.getTime()) ? date.toISOString().split("T")[0] : "Invalid Date";
    }
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      {/* Champ de recherche */}
      <div className="p-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
        />
      </div>

      {paginatedItems.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {headers.map((header) => (
                    <th
                      key={header.key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedItems.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    {headers.map((header) => (
                      <td
                        key={header.key}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                      >
                        {header.render
                          ? header.render(item)
                          : formatCellValue(item[header.key], header.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {Math.ceil(filteredItems.length / pageSize) > 1 && (
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, filteredItems.length)}
                </span>{" "}
                of <span className="font-medium">{filteredItems.length}</span>{" "}
                results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1
                      ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {Math.ceil(filteredItems.length / pageSize)}
                </span>
                <button
                  onClick={nextPage}
                  disabled={
                    currentPage === Math.ceil(filteredItems.length / pageSize)
                  }
                  className={`p-2 rounded-md ${
                    currentPage === Math.ceil(filteredItems.length / pageSize)
                      ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DataTable;
