"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Search,
  Settings,
  BarChart3,
} from "lucide-react";

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();

  const sections = [
    {
      title: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/admin/stats",
          icon: LayoutDashboard,
          active: pathname === "/admin/stats" || pathname === "/admin",
        },
      ],
    },
    {
      title: "Gestión de Usuarios",
      items: [
        {
          label: "Buscar Usuarios",
          href: "/admin/users/search",
          icon: Search,
          active: pathname.startsWith("/admin/users"),
        },
      ],
    },
  ];

  return (
    <aside className={cn("w-64 border-r bg-background", className)}>
      <div className="py-6 px-4 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </h3>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
                      item.active
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}
