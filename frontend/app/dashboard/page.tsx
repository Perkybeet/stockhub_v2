"use client";

import { withAuth } from "@/lib/contexts/AuthContext";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { InventoryByCategoryChart } from "@/components/dashboard/InventoryByCategoryChart";
import { MonthlyMovementsChart } from "@/components/dashboard/MonthlyMovementsChart";
import { WarehouseStockChart } from "@/components/dashboard/WarehouseStockChart";
import { TopProductsList } from "@/components/dashboard/TopProductsList";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StockAlerts } from "@/components/dashboard/StockAlerts";

function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Resumen general de tu inventario</p>
        </div>
      </div>
      <DashboardStats />
      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlyMovementsChart />
        <InventoryByCategoryChart />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WarehouseStockChart />
        </div>
        <TopProductsList />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity />
        <StockAlerts />
      </div>
    </div>
  );
}

export default withAuth(Dashboard);
