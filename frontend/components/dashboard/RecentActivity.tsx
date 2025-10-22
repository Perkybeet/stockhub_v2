"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2,
  Activity,
  AlertCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api';

interface ActivityItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description: string;
  time: string;
  quantity: number;
  user: string;
}

const typeConfig = {
  success: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    badge: 'bg-green-500/20 text-green-400 border-green-500/30'
  },
  info: {
    icon: Activity,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  warning: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  },
  error: {
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    badge: 'bg-red-500/20 text-red-400 border-red-500/30'
  }
};

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const response = await api.get('/dashboard/recent-activity');
      setActivities(response.data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Actividad Reciente</CardTitle>
          <CardDescription className="text-slate-600">Últimos movimientos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-slate-600">Cargando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Actividad Reciente</CardTitle>
          <CardDescription className="text-slate-600">Últimos movimientos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <RefreshCw className="h-12 w-12 text-slate-600 mb-3" />
            <p className="text-slate-600">No hay actividad reciente</p>
            <p className="text-sm text-slate-500 mt-1">Los movimientos aparecerán aquí</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-900">Actividad Reciente</CardTitle>
        <CardDescription className="text-slate-600">Últimos movimientos de inventario</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => {
            const config = typeConfig[activity.type];
            const Icon = config.icon;

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <div className={`p-2 rounded-lg ${config.bg} mt-0.5`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="outline" className={`text-xs ${config.badge}`}>
                          {activity.quantity > 0 ? '+' : ''}{activity.quantity} unidades
                        </Badge>
                        <span className="text-xs text-slate-500">por {activity.user}</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">{activity.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
