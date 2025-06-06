import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { DataProvider } from "./context/DataContext";

// Pages
import DashboardPage from "./pages/DashboardPage";
import RecordsPage from "./pages/RecordsPage";
import TravelsPage from "./pages/TravelsPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import CategoriesPage from "./pages/CategoriesPage";
import BanksPage from "./pages/BanksPage";
import Layout from "./layout/Layout";
import { AuthContent, AuthProvider } from "./auth/AuthProvider";
import MerchantsPage from "./pages/MerchantsPage";
import ResourcePage from "./pages/ResourcePage";
import { ServiceProvider } from "./services/ServiceContext";

function App() {
  return (
    <AuthProvider>
      <AuthContent>
        <ServiceProvider>
          <DataProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="records" element={<RecordsPage />} />
                  <Route path="resources" element={<ResourcePage />} />
                  <Route path="travels" element={<TravelsPage />} />
                  <Route path="activities" element={<ActivitiesPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="merchants" element={<MerchantsPage />} />
                  <Route path="banks" element={<BanksPage />} />
                </Route>
              </Routes>
            </Router>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: "#10B981",
                    secondary: "white",
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: "#EF4444",
                    secondary: "white",
                  },
                },
              }}
            />
          </DataProvider>
        </ServiceProvider>
      </AuthContent>
    </AuthProvider>
  );
}

export default App;
