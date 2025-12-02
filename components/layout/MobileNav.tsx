"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  DollarSign,
  BarChart3,
} from "lucide-react";

const mobileRoutes = [
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
    label: "Reports",
    icon: BarChart3,
    href: "/reports",
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-coffee-200 safe-bottom">
      <div className="grid grid-cols-5 h-16">
        {mobileRoutes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
              pathname === route.href
                ? "text-coffee-500 bg-coffee-50"
                : "text-coffee-600 hover:bg-coffee-50"
            )}
          >
            <route.icon className="w-5 h-5" />
            <span className="text-[10px]">{route.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

