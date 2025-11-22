"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home,
  ScanLine,
  Calendar,
  Dumbbell,
  TrendingUp,
  User,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const menuItems = [
  {
    title: "Overview",
    icon: Home,
    href: "/dashboard",
  },
  {
    title: "Body Scans",
    icon: ScanLine,
    href: "/dashboard/scans",
  },
  {
    title: "Training Plans",
    icon: Calendar,
    href: "/dashboard/plans",
  },
  {
    title: "Workouts",
    icon: Dumbbell,
    href: "/dashboard/workouts",
  },
  {
    title: "Progress & PRs",
    icon: TrendingUp,
    href: "/dashboard/progress",
  },
  {
    title: "Predictions",
    icon: Sparkles,
    href: "/dashboard/predictions",
  },
  {
    title: "Profile",
    icon: User,
    href: "/dashboard/profile",
  },
];

function DashboardSidebar({ token }: { token: string }) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-6 mb-4">
            <Image
              src="/logo/login-transparent-inline.png"
              alt="YourTrainer Logo"
              width={160}
              height={45}
              className="object-contain"
            />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const hrefWithToken = `${item.href}?token=${token}`;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={hrefWithToken}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const validation = useQuery(
    api.dashboardTokens.validateToken,
    token ? { token } : "skip"
  );

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Token requerido</h1>
          <p className="text-muted-foreground">
            Necesitas un token válido para acceder al dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (validation === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    );
  }

  if (!validation || !validation.isValid) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Token inválido</h1>
          <p className="text-muted-foreground">
            El token proporcionado no es válido o ha expirado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <DashboardSidebar token={token} />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="flex items-center gap-2 mb-6">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-2xl font-bold">YourTrainer Dashboard</h1>
            </div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
        </div>
      }
    >
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
