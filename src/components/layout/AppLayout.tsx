
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/api/context";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const AppLayout = () => {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  // If auth is loading, show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-finance-primary"></div>
      </div>
    );
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen w-full bg-gray-50">
      <Sidebar />
      
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-200",
        isMobile ? "w-full" : "w-[calc(100%-16rem)]"
      )}>
        <div className="container py-6 mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
