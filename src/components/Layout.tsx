import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Receipt, 
  Car, 
  Activity, 
  Tag, 
  Building, 
  Upload,
  Layers
} from 'lucide-react';
import { useDataContext } from '../context/DataContext';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, count }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-grow">{label}</div>
      {count !== undefined && (
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          isActive ? 'bg-blue-200 dark:bg-blue-800' : 'bg-gray-200 dark:bg-gray-700'
        }`}>
          {count}
        </div>
      )}
    </Link>
  );
};

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { data, isLoading } = useDataContext();
  const location = useLocation();
  
  // Get current page title
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white dark:bg-gray-800 md:min-h-screen p-4 md:py-8 border-b md:border-r border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center md:justify-start mb-8">
          <Layers className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white ml-2">DataManager</h1>
        </div>
        
        <nav className="space-y-1">
          <NavItem to="/" icon={<Upload className="h-5 w-5" />} label="Dashboard" />
          <NavItem 
            to="/records" 
            icon={<FileText className="h-5 w-5" />} 
            label="Records" 
            count={data.records.length} 
          />
          <NavItem 
            to="/receipts" 
            icon={<Receipt className="h-5 w-5" />} 
            label="Receipts" 
            count={data.receipts.length} 
          />
          <NavItem 
            to="/travels" 
            icon={<Car className="h-5 w-5" />} 
            label="Travels" 
            count={data.travels.length} 
          />
          <NavItem 
            to="/activities" 
            icon={<Activity className="h-5 w-5" />} 
            label="Activities" 
            count={data.activities.length} 
          />
          <NavItem 
            to="/categories" 
            icon={<Tag className="h-5 w-5" />} 
            label="Categories" 
            count={data.categories.length} 
          />
          <NavItem 
            to="/banks" 
            icon={<Building className="h-5 w-5" />} 
            label="Banks" 
            count={data.banks.length} 
          />
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-grow p-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getPageTitle()}</h1>
        </header>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-300"></div>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </div>
    </div>
  );
};

export default Layout;