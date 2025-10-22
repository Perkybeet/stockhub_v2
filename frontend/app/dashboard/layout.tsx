"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Bell, 
  Building2, 
  ChevronDown, 
  Home, 
  LogOut, 
  Menu, 
  Package, 
  Settings, 
  ShoppingCart, 
  User, 
  Users, 
  Warehouse,
  Search,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Productos", href: "/dashboard/products", icon: Package },
  { name: "Inventario", href: "/dashboard/inventory", icon: Warehouse },
  { name: "Órdenes de Compra", href: "/dashboard/purchases", icon: ShoppingCart },
  { name: "Proveedores", href: "/dashboard/suppliers", icon: Building2 },
  { name: "Usuarios", href: "/dashboard/users", icon: Users },
  { name: "Reportes", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  pathname: string;
  company: {
    name?: string;
    subscriptionPlan?: string;
  } | null;
}

function SidebarContent({ pathname, company }: SidebarProps) {
  return (
    <div className="flex h-full flex-col bg-linear-to-b from-slate-900 to-slate-800">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-700/50">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-yellow-600 to-yellow-700 shadow-lg">
          <Package className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Stock Manager</h1>
          <p className="text-xs text-slate-400">Inventory System</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-yellow-600 text-white shadow-lg shadow-yellow-500/50"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                }`}
              >
                <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                  isActive ? "text-white" : "text-slate-400"
                }`} />
                <span>{item.name}</span>
                {isActive && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-slate-700/50" />

      {/* Company Info */}
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-lg bg-slate-700/30 p-3 border border-slate-600/50">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-yellow-600 to-yellow-700">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {company?.name || "Empresa"}
            </p>
            <Badge variant="outline" className="mt-1 text-xs border-yellow-400/50 text-yellow-300">
              {company?.subscriptionPlan || "Free"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications] = useState([
    { id: 1, title: "Stock bajo detectado", time: "Hace 5 min", type: "warning" },
    { id: 2, title: "Nueva orden recibida", time: "Hace 10 min", type: "info" },
    { id: 3, title: "Producto próximo a vencer", time: "Hace 1 hora", type: "alert" },
  ]);
  const pathname = usePathname();
  const { user, company, logout } = useAuth();

  const handleLogout = async () => {
    try {
      console.log('🚪 Iniciando cierre de sesión...');
      await logout();
      console.log('✅ Sesión cerrada exitosamente');
      
      // Force a hard reload to clear all state and redirect to login
      // Using window.location.href ensures all cookies and state are cleared
      window.location.href = '/auth/login';
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
      // Even if logout fails on server, redirect to login
      // The clearAuth() in logout() will have already cleared local state
      window.location.href = '/auth/login';
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <VisuallyHidden>
              <SheetTitle>Menú de navegación</SheetTitle>
            </VisuallyHidden>
            <SidebarContent pathname={pathname} company={company} />
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col">
          <SidebarContent pathname={pathname} company={company} />
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Navbar */}
          <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6 shadow-sm">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-slate-100 cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Search Bar */}
            <div className="flex flex-1 items-center gap-4">
              <div className="relative hidden md:block md:flex-1 md:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar productos, órdenes..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition-all cursor-text"
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
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

              <Separator orientation="vertical" className="h-6" />

              {/* User Menu Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 hover:bg-slate-100 cursor-pointer px-2"
                  >
                    <Avatar className="h-8 w-8 border-2 border-yellow-600">
                      <AvatarImage src={user?.avatarUrl} alt={user?.firstName} />
                      <AvatarFallback className="bg-linear-to-br from-yellow-600 to-yellow-700 text-white text-xs font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex md:flex-col md:items-start md:text-left">
                      <span className="text-sm font-semibold text-slate-900">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <span className="text-xs text-slate-500">{user?.email}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Mi Cuenta</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Mi Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configuración</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-slate-50">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}