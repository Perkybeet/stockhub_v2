import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Package, ShoppingCart, TrendingUp, Users, Warehouse } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-4">
          Stock Management System
        </h1>
        <p className="text-lg leading-8 text-gray-600 max-w-2xl mx-auto mb-8">
          Sistema integral de gestión de inventario para cadenas de restaurantes, 
          empresas independientes y franquicias. Controle su stock en tiempo real.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/auth/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/register">Registrarse</Link>
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-blue-600" />
              <CardTitle>Gestión de Productos</CardTitle>
            </div>
            <CardDescription>
              Catálogo completo de productos con categorías, proveedores y trazabilidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• SKU y códigos de barras</li>
              <li>• Productos simples y compuestos</li>
              <li>• Control de fechas de vencimiento</li>
              <li>• Múltiples unidades de medida</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Warehouse className="h-6 w-6 text-green-600" />
              <CardTitle>Multi-Almacén</CardTitle>
            </div>
            <CardDescription>
              Gestione múltiples ubicaciones: almacenes, restaurantes, cocinas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Control por ubicación</li>
              <li>• Transferencias entre almacenes</li>
              <li>• Niveles de acceso por usuario</li>
              <li>• Geolocalización</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <CardTitle>Control en Tiempo Real</CardTitle>
            </div>
            <CardDescription>
              Monitoreo instantáneo de niveles de stock y movimientos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Alertas de stock bajo</li>
              <li>• Histórico de movimientos</li>
              <li>• Punto de reorden automático</li>
              <li>• Dashboards en vivo</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
              <CardTitle>Órdenes de Compra</CardTitle>
            </div>
            <CardDescription>
              Flujo completo de compras desde solicitud hasta recepción
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Workflow de aprobaciones</li>
              <li>• Múltiples proveedores</li>
              <li>• Control de precios</li>
              <li>• Recepción parcial</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-red-600" />
              <CardTitle>Multi-Empresa</CardTitle>
            </div>
            <CardDescription>
              Arquitectura multi-tenant para múltiples empresas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Datos completamente aislados</li>
              <li>• Roles y permisos por empresa</li>
              <li>• Configuraciones independientes</li>
              <li>• Escalabilidad garantizada</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
              <CardTitle>Reportes y Analytics</CardTitle>
            </div>
            <CardDescription>
              Insights detallados para la toma de decisiones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Reportes personalizables</li>
              <li>• Análisis de rotación</li>
              <li>• Costos y rentabilidad</li>
              <li>• Exportación de datos</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Security Section */}
      <div className="bg-gray-50 rounded-lg p-8 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Seguridad Empresarial
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sistema diseñado con los más altos estándares de seguridad para proteger 
            la información de su empresa.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <span className="text-blue-600 font-bold">🔐</span>
            </div>
            <h3 className="font-semibold mb-2">RBAC Avanzado</h3>
            <p className="text-sm text-gray-600">Control granular de permisos por recursos y acciones</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <span className="text-green-600 font-bold">📱</span>
            </div>
            <h3 className="font-semibold mb-2">Sesiones Múltiples</h3>
            <p className="text-sm text-gray-600">Control de sesiones en tiempo real con cierre remoto</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <span className="text-purple-600 font-bold">📊</span>
            </div>
            <h3 className="font-semibold mb-2">Auditoría Completa</h3>
            <p className="text-sm text-gray-600">Registro detallado de todas las acciones del sistema</p>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <span className="text-orange-600 font-bold">⚡</span>
            </div>
            <h3 className="font-semibold mb-2">Alto Rendimiento</h3>
            <p className="text-sm text-gray-600">Optimizado para miles de usuarios concurrentes</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          ¿Listo para optimizar su inventario?
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Únase a empresas que ya confían en nuestro sistema para gestionar 
          su inventario de manera eficiente y segura.
        </p>
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Link href="/auth/register">Comenzar Ahora - Es Gratis</Link>
        </Button>
        <p className="text-sm text-gray-500 mt-4">
          Plan gratuito disponible. Sin tarjeta de crédito requerida.
        </p>
      </div>
    </div>
  );
}
