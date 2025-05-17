import React from "react";
import { BarChart, Database, FileCheck } from "lucide-react";
import { Helmet, HelmetProvider } from "react-helmet-async"; // Import de react-helmet
import { useDataContext } from "../context/DataContext";
import { DataType } from "../types/models";

const DashboardPage: React.FC = () => {
  const { data } = useDataContext();

  // Count total items across all data types
  const totalItems = Object.values(data).reduce(
    (acc, curr) => acc + curr.items.length,
    0
  );

  // Count how many data types have data
  const populatedDataTypes = Object.entries(data).filter(
    ([_, value]) => value.items.length > 0
  ).length;

  // Data type configuration
  const dataTypes: { type: DataType; title: string }[] = [
    { type: "records", title: "Records Data" },
    { type: "travels", title: "Travels Data" },
    { type: "activities", title: "Activities Data" },
    { type: "categories", title: "Categories Data" },
    { type: "banks", title: "Banks Data" },
    { type: "merchants", title: "Merchants Data" },
    { type: "resources", title: "Resources Data" },
  ];

  return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>Dashboard - Vue d'ensemble</title>
          <meta
            name="description"
            content="Tableau de bord offrant une vue d'ensemble des données et statistiques clés."
          />
          <meta
            name="keywords"
            content="dashboard, statistiques, données, vue d'ensemble, application"
          />
        </Helmet>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                <Database className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Total Items
                </h3>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {totalItems}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
                <FileCheck className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Data Types
                </h3>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {populatedDataTypes} / {Object.keys(data).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                <BarChart className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Most Items
                </h3>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {
                    Object.entries(data).reduce(
                      (max, [type, value]) =>
                        value.items.length > max.count
                          ? { type, count: value.items.length }
                          : max,
                      { type: "none", count: 0 }
                    ).type
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Stats Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Statistiques avancées
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-indigo-50 dark:bg-indigo-900 p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-300 mb-2">
                Moyenne par type
              </h3>
              <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">
                {(totalItems / dataTypes.length).toFixed(2)}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-2">
                Revenu total
              </h3>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {data.records.items
                  .reduce((sum, record) => sum + (record.amount || 0), 0)
                  .toFixed(2)}{" "}
                €
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">
                Dépenses totales
              </h3>
              <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                {data.records.items
                  .reduce((sum, record) => sum + (record.amount || 0), 0)
                  .toFixed(2)}{" "}
                €
              </p>
            </div>

            <div className="bg-pink-50 dark:bg-pink-900 p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold text-pink-800 dark:text-pink-300 mb-2">
                Type le moins rempli
              </h3>
              <p className="text-3xl font-bold text-pink-900 dark:text-pink-100">
                {
                  Object.entries(data).reduce(
                    (min, [type, value]) =>
                      value.items.length < min.count
                        ? { type, count: value.items.length }
                        : min,
                    { type: "none", count: Infinity }
                  ).type
                }
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold text-orange-800 dark:text-orange-300 mb-2">
                Dernière mise à jour
              </h3>
              <p className="text-xl text-orange-900 dark:text-orange-100">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Data Overview Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Data Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get a quick overview of your data with key metrics and insights.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-2">
                Total Records
              </h3>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {data.records.items.length}
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300 mb-2">
                Travel Logs
              </h3>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {data.travels.items.length}
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-300 mb-2">
                Activities Logged
              </h3>
              <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                {data.activities.items.length}
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">
                Categories
              </h3>
              <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                {data.categories.items.length}
              </p>
            </div>

            <div className="bg-teal-50 dark:bg-teal-900 p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold text-teal-800 dark:text-teal-300 mb-2">
                Bank Accounts
              </h3>
              <p className="text-3xl font-bold text-teal-900 dark:text-teal-100">
                {data.banks.items.length}
              </p>
            </div>

            <div className="bg-pink-50 dark:bg-pink-900 p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold text-pink-800 dark:text-pink-300 mb-2">
                Merchants
              </h3>
              <p className="text-3xl font-bold text-pink-900 dark:text-pink-100">
                {data.merchants.items.length}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-300 mb-2">
                Resources
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {data.resources.items.length}
              </p>
            </div>
          </div>

          {/* Guide Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Guide
            </h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 dark:border-blue-300 pl-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  1. Upload your data
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload files for each data type using the upload cards above.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 dark:border-blue-300 pl-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  2. Navigate to data pages
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Use the sidebar to navigate between different data views.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 dark:border-blue-300 pl-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  3. View and paginate data
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Each data page shows your uploaded data in a paginated table
                  format.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HelmetProvider>
  );
};

export default DashboardPage;
