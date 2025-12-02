"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  DollarSign,
  Receipt,
  BarChart3,
  Settings,
  Coffee,
  LogOut,
} from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Production",
    icon: Package,
    href: "/production",
  },
  {
    label: "Inventory",
    icon: Warehouse,
    href: "/inventory",
  },
  {
    label: "Sales",
    icon: DollarSign,
    href: "/sales",
  },
  {
    label: "Expenses",
    icon: Receipt,
    href: "/expenses",
  },
  {
    label: "Reports",
    icon: BarChart3,
    href: "/reports",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="hidden lg:flex h-screen w-64 flex-col fixed inset-y-0 z-50 bg-coffee-50 border-r border-coffee-200">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-coffee-500 rounded-lg flex items-center justify-center">
            <Coffee className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-coffee-800">Banta Coffee</h1>
            <p className="text-xs text-coffee-600">Inventory System</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors",
              pathname === route.href
                ? "bg-coffee-500 text-white"
                : "text-coffee-700 hover:bg-coffee-100"
            )}
          >
            <route.icon className="w-5 h-5" />
            {route.label}
          </Link>
        ))}
      </nav>
      <div className="p-6 border-t border-coffee-200 space-y-3">
        <Button
          onClick={logout}
          variant="outline"
          className="w-full justify-start text-coffee-700 hover:bg-coffee-100"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
        <div className="text-xs text-coffee-600 text-center">
          © 2024 Banta Coffee
        </div>
      </div>
    </div>
  );
}

