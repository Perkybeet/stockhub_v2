"use client";

import {
  DashboardStats,
  StockAlerts,
  TopProductsList,
  MonthlyMovementsChart,
  InventoryByCategoryChart,
  WarehouseStockChart,
  RecentActivity,
} from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <DashboardStats />

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stock Alerts */}
        <StockAlerts />

        {/* Top Products */}
        <TopProductsList />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Movements */}
        <MonthlyMovementsChart />

        {/* Inventory by Category */}
        <InventoryByCategoryChart />
      </div>

      {/* Additional Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Warehouse Stock */}
        <WarehouseStockChart />

        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </div>
  );
}
