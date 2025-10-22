"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle,
  AlertCircle,
  XOctagon,
  Info,
  CheckCircle2
} from 'lucide-react';
import { api } from '@/lib/api';

interface Alert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: Date;
}

const severityConfig = {
  critical: {
    icon: XOctagon,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    badge: 'bg-red-500/20 text-red-400 border-red-500/30',
    label: 'Crítico'
  },
  high: {
    icon: AlertTriangle,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    label: 'Alto'
  },
  medium: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    label: 'Medio'
  },
  low: {
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    label: 'Bajo'
  }
};

export function StockAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await api.get('/dashboard/alerts');
      setAlerts(response.data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Alertas de Stock</CardTitle>
          <CardDescription className="text-slate-600">Requieren atención</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-slate-600">Cargando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Alertas de Stock</CardTitle>
          <CardDescription className="text-slate-600">Requieren atención</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
            <p className="text-slate-900 font-medium">Todo está en orden</p>
            <p className="text-sm text-slate-600 mt-1">No hay alertas de stock pendientes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-900">Alertas de Stock</CardTitle>
            <CardDescription className="text-slate-600">
              {alerts.length} alerta{alerts.length !== 1 ? 's' : ''} activa{alerts.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
            {alerts.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <div className={`p-2 rounded-lg ${config.bg} mt-0.5`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{alert.title}</p>
                      <Badge variant="outline" className={`text-xs ${config.badge}`}>
                        {config.label}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(alert.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{alert.message}</p>
                </div>
              </div>
            );
          })}
        </div>
        {alerts.length > 0 && (
          <Button 
            variant="outline" 
            className="w-full mt-4 border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Ver Todas las Alertas
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
