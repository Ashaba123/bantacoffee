"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Coffee, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

const routes = [
  { label: "Dashboard", href: "/" },
  { label: "Production", href: "/production" },
  { label: "Inventory", href: "/inventory" },
  { label: "Stock Out", href: "/stock-out" },
  { label: "Sales", href: "/sales" },
  { label: "Expenses", href: "/expenses" },
  { label: "Reports", href: "/reports" },
  { label: "Settings", href: "/settings" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <header className="lg:hidden sticky top-0 z-40 w-full bg-white border-b border-coffee-200">
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-coffee-500 rounded-lg flex items-center justify-center">
            <Coffee className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-coffee-800">Banta Coffee</h1>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-coffee-700"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-coffee-700"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-coffee-200 shadow-lg">
          <nav className="py-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-4 py-3 text-sm font-medium transition-colors",
                  pathname === route.href
                    ? "bg-coffee-50 text-coffee-700 border-l-4 border-coffee-500"
                    : "text-coffee-600 hover:bg-coffee-50"
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

