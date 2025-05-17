import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "@workos-inc/authkit-react";
import { useDataContext } from "../context/DataContext";
import { UserPayload } from "../types/models";

const Layout: React.FC = () => {
  const { user, signIn, signOut } = useAuth(); // Gestion de l'utilisateur et de la déconnexion
  const { addItem } = useDataContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState<UserPayload | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      // Vérifie d'abord le localStorage
      const savedMode = localStorage.getItem("darkMode");
      if (savedMode !== null) {
        return JSON.parse(savedMode);
      }
      // Sinon vérifie la préférence système
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Vérifie si l'utilisateur est connecté
  useEffect(() => {
    const checkLoginStatus = async () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (isLoggedIn === "true" && !user) {
        try {
          await signIn();
        } catch (error) {
          console.error("Error during sign-in:", error);
        }
      }
    };
    checkLoginStatus();
  }, [signIn, user]);

  // update user in database
  useEffect(() => {
    if (user) {
      const userData: UserPayload = {
        email: user.email,
        name: user.firstName || user.lastName || "", // Ensure name is a string
        picture: user.profilePictureUrl || "", // Ensure picture is a string
      };

      // Vérifier si l'utilisateur a déjà été ajouté dans le localStorage
      const userAdded = localStorage.getItem(`userAdded`);
      if (!userAdded) {
        // Ajouter l'utilisateur dans la base de données
        addItem("users", userData, ["email"])
          .then(() => {
            // Marquer l'utilisateur comme ajouté dans le localStorage
            localStorage.setItem(`userAdded`, "true");
          })
          .catch((error) => {
            console.error("Error adding user:", error);
          });
      }

      // Ajouter une variable dans le localStorage pour indiquer que l'utilisateur est connecté
      localStorage.setItem("isLoggedIn", "true");
      setUserData({
        email: user.email,
        name: user.firstName || user.lastName || "",
        picture: user.profilePictureUrl || "",
      });
    } else {
      // Supprimer la variable si l'utilisateur n'est pas connecté
      localStorage.removeItem("isLoggedIn");
    }
  }, [user]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", JSON.stringify(newMode));
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Écouteur pour les changements de préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches);
      localStorage.setItem("darkMode", JSON.stringify(e.matches));
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Applique le mode sombre dès le montage du composant
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userAdded");
    signOut({ returnTo: window.location.origin });
  };

  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}
    >
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        user={userData}
      />

      <div className="flex flex-col min-h-screen md:ml-64">
        <Header
          toggleSidebar={toggleSidebar}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          user={userData}
          onLogout={handleLogout} // Utilisation de `signOut` directement
        />

        <main className="flex-grow p-4 md:p-6 pt-24 md:pt-24">
          <Outlet />
        </main>

        <footer className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
          &copy; {new Date().getFullYear()} Tracker App
        </footer>
      </div>
    </div>
  );
};

export default Layout;
