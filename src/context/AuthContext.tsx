import React, { createContext, useContext } from "react";
import { useUser, User } from "@clerk/clerk-react";

interface AuthContextType {
  user: User | null;
  isSignedIn: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isSignedIn: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, user } = useUser();

  return (
    <AuthContext.Provider value={{ isSignedIn, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
