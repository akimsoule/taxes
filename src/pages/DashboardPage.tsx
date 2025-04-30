import React from 'react';
import CSVUploader from '../components/CSVUploader';
import { BarChart, Database, FileCheck } from 'lucide-react';
import { useDataContext } from '../context/DataContext';
import { DataType } from '../types/models';

const DashboardPage: React.FC = () => {
  const { data } = useDataContext();
  
  // Count total items across all data types
  const totalItems = Object.values(data).reduce((acc, curr) => acc + curr.length, 0);
  
  // Count how many data types have data
  const populatedDataTypes = Object.entries(data).filter(([_, items]) => items.length > 0).length;
  
  // Data type configuration
  const dataTypes: {type: DataType; title: string}[] = [
    { type: 'records', title: 'Records Data' },
    { type: 'receipts', title: 'Receipts Data' },
    { type: 'travels', title: 'Travels Data' },
    { type: 'activities', title: 'Activities Data' },
    { type: 'categories', title: 'Categories Data' },
    { type: 'banks', title: 'Banks Data' },
  ];

  return (
    <div>
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
              <Database className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Items</h3>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{totalItems}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
              <FileCheck className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Data Types</h3>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{populatedDataTypes} / 6</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
              <BarChart className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Most Items</h3>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                {Object.entries(data).reduce(
                  (max, [type, items]) => items.length > max.count ? {type, count: items.length} : max, 
                  {type: 'none', count: 0}
                ).type}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upload Data</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Upload your CSV files to populate the application with data. 
          Make sure your CSV files have the correct headers and data formats.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataTypes.map((dt) => (
            <CSVUploader key={dt.type} dataType={dt.type} title={dt.title} />
          ))}
        </div>
      </div>
      
      {/* Guide Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Guide</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 dark:border-blue-300 pl-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">1. Upload your data</h3>
            <p className="text-gray-600 dark:text-gray-400">Upload CSV files for each data type using the upload cards above.</p>
          </div>
          
          <div className="border-l-4 border-blue-500 dark:border-blue-300 pl-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">2. Navigate to data pages</h3>
            <p className="text-gray-600 dark:text-gray-400">Use the sidebar to navigate between different data views.</p>
          </div>
          
          <div className="border-l-4 border-blue-500 dark:border-blue-300 pl-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">3. View and paginate data</h3>
            <p className="text-gray-600 dark:text-gray-400">Each data page shows your uploaded data in a paginated table format.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;