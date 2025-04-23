
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/api/context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard,
  CreditCard,
  ListChecks,
  Tags,
  BarChart3,
  FileSpreadsheet,
  Settings,
  BookCheck,
  Menu,
  LogOut,
  User,
  X,
} from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  path,
  isActive,
  onClick,
}) => {
  return (
    <Link
      to={path}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-finance-soft",
        isActive
          ? "bg-finance-primary text-white hover:bg-finance-primary"
          : "text-gray-700"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Sidebar navigation items
  const navItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: "Accounts",
      path: "/accounts",
    },
    {
      icon: <ListChecks className="h-5 w-5" />,
      label: "Transactions",
      path: "/transactions",
    },
    {
      icon: <Tags className="h-5 w-5" />,
      label: "Categories",
      path: "/categories",
    },
    {
      icon: <BookCheck className="h-5 w-5" />,
      label: "Budgets",
      path: "/budgets",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Reports",
      path: "/reports",
    },
    {
      icon: <FileSpreadsheet className="h-5 w-5" />,
      label: "Import/Export",
      path: "/import-export",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      path: "/settings",
    },
  ];

  if (isMobile) {
    return (
      <>
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-finance-primary text-white"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Mobile Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-finance-primary">FinTrack</h2>
              <button onClick={toggleSidebar} className="p-1 rounded-md text-gray-500 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto py-4 px-3 space-y-1">
              {navItems.map((item) => (
                <SidebarItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  isActive={isActive(item.path)}
                  onClick={closeSidebar}
                />
              ))}
            </div>
            
            <div className="p-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Overlay to close sidebar when clicking outside */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={toggleSidebar}
          ></div>
        )}
      </>
    );
  }

  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-finance-primary">FinTrack</h2>
      </div>
      
      <div className="flex-1 overflow-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isActive={isActive(item.path)}
          />
        ))}
      </div>
      
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
};
