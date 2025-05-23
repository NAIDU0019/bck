
import { useAuth } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";
import React from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard = ({ children, requireAuth = true }: AuthGuardProps) => {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();
  
  // Check if Clerk environment variable is set
  const clerkKeyMissing = !((window.ENV && window.ENV.CLERK_PUBLISHABLE_KEY) || 
                           import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
  
  if (clerkKeyMissing) {
    // If Clerk key is missing, we'll just render the children
    // This allows the app to function without authentication during setup
    return <>{children}</>;
  }
  
  if (!isLoaded) {
    // You can replace this with a loading component
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (requireAuth && !isSignedIn) {
    // Redirect to login page if authentication is required but user is not signed in
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (!requireAuth && isSignedIn) {
    // Redirect to home page if authentication is not required but user is signed in
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
