import { AuthKitProvider, useAuth } from "@workos-inc/authkit-react";
import LoginPage from "../pages/LoginPage";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthKitProvider clientId={import.meta.env.VITE_WORKOS_CLIENT_ID!}>
      {children}
    </AuthKitProvider>
  );
}

export function AuthContent({ children }: { children: React.ReactNode }) {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading application...
          </p>
        </div>
      </div>
    );
  }
 
  if (!user) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
