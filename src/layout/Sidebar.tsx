import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  FileText,
  Car,
  Activity,
  Tag,
  Building,
  UserIcon,
  Store,
  Book, // Ajout de l'icône Book
} from "lucide-react";
import { UserPayload } from "../types/models";

type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
  user: UserPayload | null;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, user }) => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors ${
      isActive
        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
    }`;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl z-30 transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Home className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Data Manager
            </h1>
          </div>
        </div>

        <div className="p-4">
          {user ? (
            <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                {user.name ? (
                  user.name.charAt(0).toUpperCase()
                ) : (
                  <UserIcon className="h-6 w-6" />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="font-medium text-gray-800 dark:text-white truncate">
                  {user.name || "User"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-center text-gray-500 dark:text-gray-400">
                Please log in
              </p>
            </div>
          )}

          <nav className="space-y-1">
            <NavLink
              to="/"
              className={navLinkClass}
              end
              onClick={toggleSidebar}
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/records"
              className={navLinkClass}
              onClick={toggleSidebar}
            >
              <FileText className="h-5 w-5" />
              <span>Records</span>
            </NavLink>
            <NavLink
              to="/travels"
              className={navLinkClass}
              onClick={toggleSidebar}
            >
              <Car className="h-5 w-5" />
              <span>Travels</span>
            </NavLink>
            <NavLink
              to="/activities"
              className={navLinkClass}
              onClick={toggleSidebar}
            >
              <Activity className="h-5 w-5" />
              <span>Activities</span>
            </NavLink>
            <NavLink
              to="/categories"
              className={navLinkClass}
              onClick={toggleSidebar}
            >
              <Tag className="h-5 w-5" />
              <span>Categories</span>
            </NavLink>
            <NavLink
              to="/merchants"
              className={navLinkClass}
              onClick={toggleSidebar}
            >
              <Store className="h-5 w-5" />
              <span>Merchants</span>
            </NavLink>
            <NavLink
              to="/banks"
              className={navLinkClass}
              onClick={toggleSidebar}
            >
              <Building className="h-5 w-5" />
              <span>Banks</span>
            </NavLink>
            <NavLink
              to="/resources"
              className={navLinkClass}
              onClick={toggleSidebar}
            >
              <Book className="h-5 w-5" /> {/* Remplacement de l'icône */}
              <span>Resources</span>
            </NavLink>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
