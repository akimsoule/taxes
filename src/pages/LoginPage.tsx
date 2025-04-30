import React from "react";
import { useAuth } from "@workos-inc/authkit-react";
import { LogIn, Database, Upload, BarChart } from "lucide-react";

const LoginPage: React.FC = () => {
  const { signIn } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-2xl w-full">
        {/* Section de bienvenue */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Welcome to Data Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Please log in to access your account and manage your data
            efficiently.
          </p>
        </div>

        {/* Bouton de connexion */}
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-8"
        >
          <LogIn className="h-5 w-5" />
          <span>Log In</span>
        </button>

        {/* Section "Get Started" */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg transition-colors duration-300">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Get Started with Data Manager
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">
                  Manage Your Data
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Organize and view your records, receipts, and more.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">
                  Upload CSV Files
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Quickly import your data using CSV files.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                <BarChart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">
                  Analyze Insights
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gain insights with visualized data and reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
