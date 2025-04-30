import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps {
  data: any[];
  headers: {
    key: string;
    label: string;
    render?: (item: any) => React.ReactNode;
  }[];
  itemsPerPage?: number;
  emptyMessage?: string;
  defaultSortKey?: string; // New property for default sorting
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  headers,
  itemsPerPage = 10,
  emptyMessage = "No data available. Please upload a CSV file.",
  defaultSortKey = "date",
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortedData, setSortedData] = useState(data);

  // Sort data by default if a sort key is specified
  useEffect(() => {
    if (defaultSortKey) {
      const sorted = [...data].sort((a, b) => {
        const valueA = a[defaultSortKey];
        const valueB = b[defaultSortKey];

        // Vérifiez si les valeurs sont des dates au format YYYY-MM-DD
        const isDate = (val: any) =>
          typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val);

        if (isDate(valueA) && isDate(valueB)) {
          // Comparez les dates en les convertissant en objets Date
          return new Date(valueB).getTime() - new Date(valueA).getTime();
        }

        // Comparaison standard pour les autres types
        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
        return 0;
      });
      setSortedData(sorted);
    } else {
      setSortedData(data);
    }
  }, [data, defaultSortKey]);

  // Filter data based on search query
  const filteredData = sortedData.filter((item) =>
    headers.some((header) =>
      String(item[header.key]).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
  const currentItems = filteredData.slice(startIndex, endIndex);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatCellValue = (value: any): string => {
    if (value === undefined || value === null) return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      {/* Search Bar */}
      <div className="p-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        />
      </div>

      {filteredData.length === 0 ? (
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
                {currentItems.map((item, index) => (
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
                          : formatCellValue(item[header.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{endIndex}</span> of{" "}
                <span className="font-medium">{filteredData.length}</span>{" "}
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
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages
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
