
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/api/context";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

const AppLayout = () => {
  const { user, loading, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen w-full bg-gray-50">
      <Sidebar />
      
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-200",
        isMobile ? "w-full" : "w-[calc(100%-16rem)]"
      )}>
        {/* User info and logout button */}
        <div className="bg-white border-b p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-finance-primary flex items-center justify-center text-white mr-3">
              <User className="h-5 w-5" />
            </div>
            <span className="font-medium">{user.name}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900 flex items-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
        
        <div className="container py-6 mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
