"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  Warehouse, 
  AlertTriangle, 
  ShoppingCart,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { api } from '@/lib/api';

interface Stats {
  totalProducts: number;
  productsChange: string;
  totalWarehouses: number;
  warehousesChange: string;
  lowStockProducts: number;
  lowStockChange: string;
  pendingOrders: number;
  ordersChange: string;
  inventoryValue: string;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-slate-50 border-slate-200">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statsConfig = [
    {
      title: "Total Productos",
      value: stats.totalProducts.toLocaleString(),
      change: stats.productsChange,
      trend: stats.productsChange.startsWith('+') ? 'up' : 'down',
      icon: Package,
      color: "blue",
      description: "En stock actualmente"
    },
    {
      title: "Almacenes",
      value: stats.totalWarehouses.toString(),
      change: stats.warehousesChange,
      trend: stats.warehousesChange.startsWith('+') ? 'up' : 'down',
      icon: Warehouse,
      color: "green",
      description: "Ubicaciones activas"
    },
    {
      title: "Stock Bajo",
      value: stats.lowStockProducts.toString(),
      change: stats.lowStockChange,
      trend: stats.lowStockChange.startsWith('+') ? 'down' : 'up',
      icon: AlertTriangle,
      color: "yellow",
      description: "Requieren atención"
    },
    {
      title: "Órdenes Pendientes",
      value: stats.pendingOrders.toString(),
      change: stats.ordersChange,
      trend: 'neutral',
      icon: ShoppingCart,
      color: "purple",
      description: "Por procesar"
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map((stat) => (
        <Card 
          key={stat.title}
          className="bg-slate-50 border-slate-200 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-200"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {stat.title}
            </CardTitle>
            <div className={`
              p-2 rounded-lg
              ${stat.color === 'blue' ? 'bg-blue-500/10 text-blue-600' : ''}
              ${stat.color === 'green' ? 'bg-green-500/10 text-green-600' : ''}
              ${stat.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-600' : ''}
              ${stat.color === 'purple' ? 'bg-purple-500/10 text-purple-600' : ''}
            `}>
              <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-slate-500">
                {stat.description}
              </p>
              <div className={`
                flex items-center gap-1 text-xs font-medium
                ${stat.trend === 'up' ? 'text-green-600' : ''}
                ${stat.trend === 'down' ? 'text-red-600' : ''}
                ${stat.trend === 'neutral' ? 'text-slate-500' : ''}
              `}>
                {stat.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                {stat.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                <span>{stat.change}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Valor del Inventario - Card más grande */}
      <Card className="bg-linear-to-br from-yellow-50 to-yellow-100 border-yellow-200 lg:col-span-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-slate-900">Valor Total del Inventario</CardTitle>
          <CardDescription className="text-slate-600">Costo total de todos los productos en stock</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-yellow-700">
            ${parseFloat(stats.inventoryValue).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
