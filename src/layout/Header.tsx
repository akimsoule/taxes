import React, { useState } from "react";
import { Menu, Sun, Moon, LogOut, User as UserIcon } from "lucide-react";
import { User } from "../types/models";

type HeaderProps = {
  toggleSidebar: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  user: User | null;
  onLogout: () => void;
};

const Header: React.FC<HeaderProps> = ({
  toggleSidebar,
  darkMode,
  toggleDarkMode,
  user,
  onLogout,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed w-full md:w-[calc(100%-16rem)] bg-white dark:bg-gray-800 shadow-md z-10 transition-all duration-300">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="ml-2 text-xl font-semibold text-gray-800 dark:text-white md:hidden">
            Data Manager
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {user && (
            <div className="relative">
              {/* Bouton utilisateur */}
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center space-x-1 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  {user.name ? (
                    user.name.charAt(0).toUpperCase()
                  ) : (
                    <UserIcon className="h-5 w-5" />
                  )}
                </div>
              </button>

              {/* Menu déroulant */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20">
                  {/* Informations utilisateur */}
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700">
                    <p className="font-medium">{user.name || "User"}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                      {user.email}
                    </p>
                  </div>

                  {/* Option de déconnexion */}
                  <button
                    onClick={onLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Sign out</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
