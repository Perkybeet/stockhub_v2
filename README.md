# Stock Management System

Sistema integral de gestión de inventario diseñado para cadenas de restaurantes, empresas independientes y franquicias. Construido con tecnologías modernas y arquitectura multi-tenant.

## 🚀 Características Principales

### 📦 Gestión de Productos
- Catálogo completo con SKU y códigos de barras
- Productos simples y compuestos
- Control de fechas de vencimiento
- Múltiples unidades de medida
- Categorización avanzada

### 🏪 Multi-Almacén
- Gestión de múltiples ubicaciones
- Control por almacén, restaurante o cocina
- Transferencias entre ubicaciones
- Geolocalización de almacenes

### 📊 Control en Tiempo Real
- Monitoreo instantáneo de stock
- Alertas de stock bajo
- Punto de reorden automático
- Histórico de movimientos

### 🛒 Órdenes de Compra
- Workflow completo de aprobaciones
- Gestión de múltiples proveedores
- Control de precios y costos
- Recepción parcial de mercadería

### 🏢 Multi-Empresa (Multi-Tenant)
- Datos completamente aislados por empresa
- Roles y permisos granulares (RBAC)
- Configuraciones independientes
- Escalabilidad garantizada

### 🔐 Seguridad Empresarial
- Sistema RBAC con permisos en tabla separada
- Gestión de sesiones múltiples
- Cierre de sesiones en tiempo real
- Auditoría completa de acciones
- Autenticación JWT con refresh tokens

## 🛠 Stack Tecnológico

### Backend
- **NestJS 11+** - Framework Node.js escalable
- **PostgreSQL 18** - Base de datos principal
- **Prisma 6** - ORM y migraciones
- **Redis** - Caché y gestión de sesiones
- **JWT** - Autenticación y autorización

### Frontend
- **NextJS 16** - Framework React con SSR
- **TailwindCSS** - Estilos y diseño
- **ShadCN UI** - Componentes de interfaz
- **TypeScript** - Tipado estático
- **Axios** - Cliente HTTP

### Base de Datos
- **PostgreSQL 18** en puerto 5433
- **Redis** en puerto 6379 (localhost)
- Esquema completo con 26 tablas
- Sistema RBAC con 43 permisos predefinidos

## 📋 Requisitos del Sistema

- Node.js 18+ 
- PostgreSQL 18
- Redis 6+
- npm o yarn

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd stock-management-app
```

### 2. Configurar Base de Datos

#### PostgreSQL
```sql
-- Crear la base de datos
CREATE DATABASE stock_management_db 
WITH ENCODING 'UTF8' 
LC_COLLATE = 'C' 
LC_CTYPE = 'C' 
TEMPLATE template0;

-- Ejecutar el schema
\c stock_management_db
\i database/schema.sql
```

#### Variables de Entorno - Backend
```bash
# backend/.env
DATABASE_URL="postgresql://root:032112@localhost:5433/stock_management_db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
```

#### Variables de Entorno - Frontend
```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
```

### 3. Instalación del Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

### 4. Instalación del Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1
- **Documentación API**: http://localhost:3001/api/docs (Swagger)

## 📊 Estructura de la Base de Datos

### Entidades Principales

#### Empresas y Usuarios
- `companies` - Información de empresas
- `users` - Usuarios del sistema
- `user_sessions` - Gestión de sesiones
- `session_activities` - Auditoría de actividades

#### RBAC (Control de Acceso)
- `permissions` - Permisos del sistema (43 predefinidos)
- `roles` - Roles por empresa
- `role_permission_junction` - Relación roles-permisos
- `user_role_junction` - Relación usuarios-roles

#### Inventario
- `categories` - Categorías de productos
- `products` - Catálogo de productos
- `suppliers` - Proveedores
- `warehouses` - Almacenes y ubicaciones
- `inventory_items` - Stock por producto/almacén
- `inventory_movements` - Movimientos de inventario

#### Compras
- `purchase_orders` - Órdenes de compra
- `purchase_order_items` - Líneas de órdenes
- `purchase_receipts` - Recepciones
- `purchase_receipt_items` - Líneas de recepción

## 🔑 Sistema de Permisos RBAC

### Recursos y Acciones
- **Companies**: view, create, update, delete
- **Users**: view, create, update, delete, manage_roles
- **Products**: view, create, update, delete
- **Inventory**: view, create, update, delete, transfer
- **Warehouses**: view, create, update, delete
- **Purchases**: view, create, update, delete, approve, receive
- **Suppliers**: view, create, update, delete
- **Reports**: view, create, export
- **Settings**: view, update

### Roles Predeterminados
- **Super Admin**: Todos los permisos
- **Admin**: Gestión completa de la empresa
- **Manager**: Operaciones y reportes
- **Employee**: Operaciones básicas
- **Viewer**: Solo lectura

## 📱 Características de Autenticación

### Sesiones Múltiples
- Control de dispositivos activos
- Cierre remoto de sesiones
- Notificaciones en tiempo real
- Geolocalización de sesiones

### JWT Tokens
- Access token (15 minutos)
- Refresh token (7 días)
- Renovación automática
- Revocación segura

## 🚀 Escalabilidad

### Multi-Tenant
- Aislamiento completo de datos por empresa
- Configuraciones independientes
- Escalabilidad horizontal
- Facturación por empresa

### Performance
- Índices optimizados en PostgreSQL
- Caché con Redis
- Paginación en APIs
- Lazy loading en frontend

## 📈 Monitoreo y Logs

### Auditoría
- Registro de todas las acciones
- Trazabilidad completa
- Metadatos de sesión
- Exportación de logs

### Métricas
- Uso por empresa
- Rendimiento de queries
- Actividad de usuarios
- Alertas automáticas

## 🔧 Desarrollo

### Scripts Disponibles

#### Backend
```bash
npm run start:dev      # Desarrollo con hot reload
npm run start:debug    # Desarrollo con debug
npm run build          # Build de producción
npm run start:prod     # Ejecutar en producción
npm run test           # Tests unitarios
npm run test:e2e       # Tests end-to-end
```

#### Frontend
```bash
npm run dev            # Servidor de desarrollo
npm run build          # Build de producción
npm run start          # Servidor de producción
npm run lint           # Linting
npm run type-check     # Verificación de tipos
```

### Estructura del Proyecto
```
stock-management-app/
├── backend/           # API NestJS
│   ├── src/
│   │   ├── auth/      # Autenticación
│   │   ├── companies/ # Gestión de empresas
│   │   ├── users/     # Gestión de usuarios
│   │   ├── products/  # Gestión de productos
│   │   ├── inventory/ # Gestión de inventario
│   │   └── common/    # Módulos compartidos
│   └── prisma/        # Schema de base de datos
├── frontend/          # Frontend NextJS
│   ├── app/           # App Router
│   ├── components/    # Componentes reutilizables
│   ├── lib/           # Utilidades y configuración
│   └── types/         # Definiciones de tipos
└── database/          # Scripts de base de datos
    └── schema.sql     # Schema PostgreSQL
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit los cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@stockmanager.com
- Documentación: [docs.stockmanager.com](https://docs.stockmanager.com)
- Issues: [GitHub Issues](https://github.com/tu-repo/stock-management-app/issues)

---

**Stock Management System** - Optimiza tu inventario, maximiza tu eficiencia. 🚀