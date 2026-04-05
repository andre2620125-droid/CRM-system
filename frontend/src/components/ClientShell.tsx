"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      {children}
    </AuthProvider>
  );
}
