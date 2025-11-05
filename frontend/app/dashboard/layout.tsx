"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Bell, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, company, logout } = useAuth();
  const pathname = usePathname();
  const [notifications] = useState([
    { id: 1, title: "Stock bajo detectado", time: "Hace 5 min", type: "warning" },
    { id: 2, title: "Nueva orden recibida", time: "Hace 10 min", type: "info" },
    { id: 3, title: "Producto próximo a vencer", time: "Hace 1 hora", type: "alert" },
  ]);

  const handleLogout = async () => {
    try {
      console.log('🚪 Iniciando cierre de sesión...');
      await logout();
      console.log('✅ Sesión cerrada exitosamente');
      window.location.href = '/auth/login';
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
      window.location.href = '/auth/login';
    }
  };

  // Get breadcrumb from pathname
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Dashboard', href: '/dashboard' }];
    
    if (paths.length > 1) {
      const sections: Record<string, string> = {
        products: 'Productos',
        inventory: 'Inventario',
        purchases: 'Órdenes de Compra',
        suppliers: 'Proveedores',
        users: 'Usuarios',
        reports: 'Reportes',
        settings: 'Configuración',
      };
      
      const section = paths[1];
      if (sections[section]) {
        breadcrumbs.push({ label: sections[section], href: `/${paths[0]}/${paths[1]}` });
      }
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar user={user} company={company} onLogout={handleLogout} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center gap-2">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Right Side Actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar productos, órdenes..."
                className="w-64 rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition-all cursor-text"
              />
            </div>

            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-slate-100 cursor-pointer"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notificaciones</span>
                  <Badge variant="secondary">{notifications.length}</Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="flex flex-col items-start py-3 cursor-pointer">
                      <div className="flex items-start gap-2 w-full">
                        <AlertCircle className={`h-4 w-4 mt-0.5 ${
                          notification.type === 'warning' ? 'text-yellow-500' :
                          notification.type === 'alert' ? 'text-red-500' : 'text-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{notification.time}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-yellow-700 font-medium cursor-pointer">
                  Ver todas las notificaciones
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="mt-6">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}