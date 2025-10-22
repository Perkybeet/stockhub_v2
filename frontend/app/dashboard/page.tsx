"use client";

import { withAuth } from "@/lib/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Warehouse, 
  AlertTriangle, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

function Dashboard() {
  const stats = [
    {
      title: "Total Productos",
      value: "1,234",
      change: "+12.5%",
      trend: "up",
      icon: Package,
      color: "blue",
      description: "En stock actualmente"
    },
    {
      title: "Almacenes",
      value: "8",
      change: "+2",
      trend: "up",
      icon: Warehouse,
      color: "green",
      description: "Ubicaciones activas"
    },
    {
      title: "Stock Bajo",
      value: "23",
      change: "+5",
      trend: "down",
      icon: AlertTriangle,
      color: "yellow",
      description: "Requieren atención"
    },
    {
      title: "Órdenes Pendientes",
      value: "12",
      change: "-3",
      trend: "up",
      icon: ShoppingCart,
      color: "purple",
      description: "Por procesar"
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: "success",
      title: "Nuevo producto agregado",
      description: "Producto SKU-12345 añadido al inventario",
      time: "Hace 5 minutos",
      icon: CheckCircle2
    },
    {
      id: 2,
      type: "info",
      title: "Inventario actualizado",
      description: "Almacén Central - Recuento completado",
      time: "Hace 15 minutos",
      icon: Activity
    },
    {
      id: 3,
      type: "warning",
      title: "Stock bajo detectado",
      description: "Producto ABC necesita reposición",
      time: "Hace 1 hora",
      icon: AlertCircle
    },
    {
      id: 4,
      type: "error",
      title: "Orden rechazada",
      description: "PO-2024-001 no cumple con especificaciones",
      time: "Hace 2 horas",
      icon: XCircle
    }
  ];

  const alerts = [
    {
      id: 1,
      severity: "high",
      title: "Productos por vencer",
      description: "5 productos vencen en los próximos 7 días",
      count: 5
    },
    {
      id: 2,
      severity: "medium",
      title: "Reorden sugerido",
      description: "12 productos necesitan reposición urgente",
      count: 12
    },
    {
      id: 3,
      severity: "low",
      title: "Transferencias pendientes",
      description: "3 transferencias esperando confirmación",
      count: 3
    }
  ];

  const topProducts = [
    { name: "Producto A", sales: 245, trend: "up", change: "+15%" },
    { name: "Producto B", sales: 189, trend: "up", change: "+8%" },
    { name: "Producto C", sales: 156, trend: "down", change: "-3%" },
    { name: "Producto D", sales: 134, trend: "up", change: "+22%" },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      green: "bg-green-500/10 text-green-700 dark:text-green-400",
      yellow: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      purple: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconBg = (color: string) => {
    const colors = {
      blue: "bg-blue-100 dark:bg-blue-900",
      green: "bg-green-100 dark:bg-green-900",
      yellow: "bg-yellow-100 dark:bg-yellow-900",
      purple: "bg-purple-100 dark:bg-purple-900",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getActivityStyle = (type: string) => {
    const styles = {
      success: { bg: "bg-green-100 dark:bg-green-900", text: "text-green-700 dark:text-green-400", border: "border-green-200" },
      info: { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200" },
      warning: { bg: "bg-yellow-100 dark:bg-yellow-900", text: "text-yellow-700 dark:text-yellow-400", border: "border-yellow-200" },
      error: { bg: "bg-red-100 dark:bg-red-900", text: "text-red-700 dark:text-red-400", border: "border-red-200" },
    };
    return styles[type as keyof typeof styles] || styles.info;
  };

  const getAlertColor = (severity: string) => {
    const colors = {
      high: "destructive",
      medium: "default",
      low: "secondary"
    };
    return colors[severity as keyof typeof colors] || "default";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Bienvenido al sistema de gestión de inventario</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="cursor-pointer">
            <Clock className="mr-2 h-4 w-4" />
            Últimos 30 días
          </Button>
          <Button className="cursor-pointer bg-blue-600 hover:bg-blue-700">
            <TrendingUp className="mr-2 h-4 w-4" />
            Ver Reportes
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${getIconBg(stat.color)}`}>
                <stat.icon className={`h-4 w-4 ${getColorClasses(stat.color)}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>Últimos movimientos del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const style = getActivityStyle(activity.type);
                return (
                  <div
                    key={activity.id}
                    className={`flex gap-3 p-3 rounded-lg border ${style.border} bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer`}
                  >
                    <div className={`shrink-0 p-2 rounded-lg ${style.bg}`}>
                      <activity.icon className={`h-4 w-4 ${style.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{activity.description}</p>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Separator className="my-4" />
            <Button variant="ghost" className="w-full cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              Ver toda la actividad
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Alerts & Top Products */}
        <div className="space-y-6">
          {/* Alerts */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Alertas
              </CardTitle>
              <CardDescription>Acciones requeridas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                        <Badge variant={getAlertColor(alert.severity) as "destructive" | "default" | "secondary" | "outline"}>
                          {alert.count}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{alert.description}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Productos Destacados
              </CardTitle>
              <CardDescription>Mayor movimiento del mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.sales} unidades</p>
                    </div>
                    <Badge variant={product.trend === "up" ? "default" : "secondary"} className="cursor-pointer">
                      {product.trend === "up" ? (
                        <TrendingUp className="mr-1 h-3 w-3" />
                      ) : (
                        <TrendingDown className="mr-1 h-3 w-3" />
                      )}
                      {product.change}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Dashboard);