"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { api } from '@/lib/api';

interface TopProduct {
  id: string;
  name: string;
  sku: string;
  movements: number;
  quantity: number;
}

export function TopProductsList() {
  const [data, setData] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await api.get('/dashboard/top-products');
      setData(response.data);
    } catch (error) {
      console.error('Error loading top products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Productos Más Activos</CardTitle>
          <CardDescription className="text-slate-600">Últimos 30 días</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-slate-600">Cargando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Productos Más Activos</CardTitle>
          <CardDescription className="text-slate-600">Últimos 30 días</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-slate-600">No hay datos disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-900">Productos Más Activos</CardTitle>
        <CardDescription className="text-slate-600">Con más movimientos en los últimos 30 días</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                  <span className="text-sm font-bold text-yellow-700">#{index + 1}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <Badge variant="outline" className="text-xs text-slate-600 border-slate-300">
                      {product.sku}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-slate-600">
                      {product.movements} movimientos
                    </p>
                    <span className="text-slate-600">•</span>
                    <p className="text-xs text-slate-600">
                      {product.quantity} unidades
                    </p>
                  </div>
                </div>
              </div>
              <Package className="h-5 w-5 text-slate-500" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
