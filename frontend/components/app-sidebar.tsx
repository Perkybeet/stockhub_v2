"use client"

import * as React from "react"
import {
  BarChart3,
  Building2,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Warehouse,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    firstName?: string
    lastName?: string
    email?: string
    avatarUrl?: string
  } | null
  company?: {
    name?: string
    subscriptionPlan?: string
  } | null
  onLogout?: () => void
}

export function AppSidebar({ user, company, onLogout, ...props }: AppSidebarProps) {
  const navItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Productos",
      url: "/dashboard/products",
      icon: Package,
    },
    {
      title: "Inventario",
      url: "/dashboard/inventory",
      icon: Warehouse,
    },
    {
      title: "Órdenes de Compra",
      url: "/dashboard/purchases",
      icon: ShoppingCart,
    },
    {
      title: "Proveedores",
      url: "/dashboard/suppliers",
      icon: Building2,
    },
    {
      title: "Usuarios",
      url: "/dashboard/users",
      icon: Users,
    },
    {
      title: "Reportes",
      url: "/dashboard/reports",
      icon: BarChart3,
    },
    {
      title: "Configuración",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ]

  const companyTeam = {
    name: company?.name || "Mi Empresa",
    logo: Building2,
    plan: company?.subscriptionPlan || "Free",
  }

  const userData = {
    name: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Usuario" : "Usuario",
    email: user?.email || "",
    avatar: user?.avatarUrl || "",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={[companyTeam]} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} onLogout={onLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
