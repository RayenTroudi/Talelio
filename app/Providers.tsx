"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider as AuthContextProvider } from "./context/AuthContext";

export const AuthProvider = ({ children}:any) => {
  return (
    <SessionProvider>
      <AuthContextProvider>
        {children}
      </AuthContextProvider>
    </SessionProvider>
  );
};