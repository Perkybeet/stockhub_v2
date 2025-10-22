# 🏢 Sistema de Gestión de Inventario Multi-Empresa

## 📋 Descripción del Proyecto

Sistema integral de gestión de inventario diseñado específicamente para **cadenas de restaurantes**, **empresas independientes** y **franquicias**. Construido con tecnologías modernas y arquitectura multi-tenant que garantiza el aislamiento completo de datos entre empresas.

### 🎯 Objetivo Principal
Proporcionar una solución completa y escalable para la gestión de inventario que permita a las empresas controlar sus productos, almacenes, compras y movimientos de stock en tiempo real, con un sistema de seguridad robusto y control de acceso granular.

## 🚀 Características Destacadas

### 📦 **Gestión Avanzada de Productos**
- **Catálogo Completo**: SKU únicos, códigos de barras, categorización jerárquica
- **Productos Compuestos**: Gestión de productos con múltiples componentes
- **Control de Vencimientos**: Alertas automáticas para productos próximos a vencer
- **Múltiples Unidades**: Soporte para diferentes unidades de medida
- **Trazabilidad Completa**: Histórico detallado de todos los movimientos

### 🏪 **Sistema Multi-Almacén**
- **Ubicaciones Diversas**: Almacenes principales, sucursales, restaurantes, cocinas
- **Transferencias Inteligentes**: Movimientos entre ubicaciones con validaciones
- **Control de Acceso**: Permisos específicos por usuario y almacén
- **Geolocalización**: Ubicación GPS de cada almacén para optimización logística
- **Niveles de Stock**: Control independiente por ubicación

### 📊 **Monitoreo en Tiempo Real**
- **Dashboard Ejecutivo**: Métricas clave y KPIs en tiempo real
- **Alertas Inteligentes**: Notificaciones automáticas de stock bajo, productos por vencer
- **Punto de Reorden**: Configuración automática de niveles mínimos
- **Histórico de Movimientos**: Registro detallado de todas las transacciones
- **Reportes Dinámicos**: Generación de reportes personalizables

### 🛒 **Gestión de Compras Completa**
- **Workflow de Aprobaciones**: Proceso estructurado con múltiples niveles
- **Múltiples Proveedores**: Gestión de cotizaciones y comparación de precios
- **Control de Costos**: Seguimiento de precios históricos y variaciones
- **Recepción Parcial**: Flexibilidad para recepciones graduales
- **Integración Contable**: Preparado para integrar con sistemas ERP

### 🏢 **Arquitectura Multi-Tenant**
- **Aislamiento Completo**: Datos totalmente separados por empresa
- **Configuraciones Independientes**: Personalización por tenant
- **Escalabilidad Horizontal**: Diseñado para miles de empresas simultáneas
- **Facturación Diferenciada**: Planes y límites por empresa
- **Backup Independiente**: Respaldos segregados por seguridad

### 🔐 **Seguridad Empresarial**
- **RBAC Granular**: Sistema de roles y permisos con 43 permisos específicos
- **Sesiones Múltiples**: Control de dispositivos activos por usuario
- **Autenticación JWT**: Tokens seguros con renovación automática
- **Auditoría Completa**: Registro de todas las acciones con metadatos
- **Cierre Remoto**: Capacidad de cerrar sesiones en tiempo real

## 🛠 Stack Tecnológico

### 🔧 **Backend - API REST**
- **Framework**: NestJS 11+ (Node.js escalable y robusto)
- **Base de Datos**: PostgreSQL 18 (motor empresarial confiable)
- **ORM**: Prisma 6 (type-safe y migraciones automáticas)
- **Caché**: Redis (sesiones y optimización de rendimiento)
- **Autenticación**: JWT con refresh tokens
- **Documentación**: Swagger/OpenAPI integrado
- **Validación**: Class-validator y DTO patterns
- **Testing**: Jest para pruebas unitarias e integración

### 🎨 **Frontend - Interfaz Moderna**
- **Framework**: NextJS 16 (React con SSR y optimizaciones)
- **Estilos**: TailwindCSS 4 (utility-first CSS framework)
- **Componentes**: ShadCN UI (componentes accesibles y reutilizables)
- **Tipado**: TypeScript 5 (desarrollo type-safe)
- **Estado**: Context API + Custom hooks
- **HTTP Client**: Axios con interceptors
- **Formularios**: React Hook Form + Zod validation
- **Iconos**: Lucide React (iconografía consistente)

### 💾 **Base de Datos y Esquema**
- **Motor**: PostgreSQL 18 corriendo en puerto 5433
- **Esquema**: 26 tablas interrelacionadas con integridad referencial
- **Índices**: Optimización para consultas complejas
- **Triggers**: Automatización de auditoría y validaciones
- **Vistas**: Agregaciones pre-calculadas para reportes
- **Particionado**: Preparado para escalar horizontalmente

## 📊 Arquitectura del Sistema

### 🗄️ **Diseño de Base de Datos**

#### **Entidades de Negocio Principales**
```sql
-- Gestión Multi-Tenant
companies (empresas)
├── users (usuarios)
├── user_sessions (sesiones activas)
├── session_activities (auditoría de actividades)

-- Sistema RBAC
permissions (43 permisos predefinidos)
├── roles (roles por empresa)
├── role_permission_junction (permisos por rol)
└── user_role_junction (roles por usuario)

-- Catálogo de Productos
categories (categorías jerárquicas)
├── products (productos principales)
├── product_components (productos compuestos)
├── suppliers (proveedores)
└── product_suppliers (relación productos-proveedores)

-- Gestión de Inventario
warehouses (almacenes y ubicaciones)
├── inventory_items (stock por producto/almacén)
├── inventory_movements (movimientos de stock)
├── inventory_transfers (transferencias entre almacenes)
└── inventory_transfer_items (líneas de transferencia)

-- Gestión de Compras
purchase_orders (órdenes de compra)
├── purchase_order_items (líneas de órdenes)
├── purchase_receipts (recepciones)
└── purchase_receipt_items (líneas de recepción)

-- Sistema de Reportes
reports (reportes generados)
└── report_templates (plantillas personalizables)
```

#### **Características del Esquema**
- **UUIDs**: Claves primarias con identificadores únicos universales
- **Timestamps**: Auditoría automática de creación y modificación
- **Soft Deletes**: Eliminación lógica para trazabilidad
- **Índices Compuestos**: Optimización para consultas multi-tenant
- **Constraints**: Validaciones a nivel de base de datos
- **Foreign Keys**: Integridad referencial estricta

### 🔒 **Sistema de Permisos RBAC**

#### **Recursos y Acciones Disponibles**
```javascript
// Gestión de Empresas
companies: ['view', 'create', 'update', 'delete']

// Gestión de Usuarios
users: ['view', 'create', 'update', 'delete', 'manage_roles']

// Catálogo de Productos
products: ['view', 'create', 'update', 'delete']
categories: ['view', 'create', 'update', 'delete']
suppliers: ['view', 'create', 'update', 'delete']

// Gestión de Inventario
inventory: ['view', 'create', 'update', 'delete', 'transfer']
warehouses: ['view', 'create', 'update', 'delete']

// Gestión de Compras
purchases: ['view', 'create', 'update', 'delete', 'approve', 'receive']

// Sistema de Reportes
reports: ['view', 'create', 'export']

// Configuración del Sistema
settings: ['view', 'update']
```

#### **Roles Predefinidos**
1. **Super Admin**: Acceso completo al sistema
2. **Company Admin**: Gestión completa de su empresa
3. **Manager**: Operaciones y reportes avanzados
4. **Supervisor**: Operaciones básicas y reportes simples
5. **Employee**: Consultas y operaciones limitadas
6. **Viewer**: Solo lectura y reportes básicos

## 🚀 Guía de Instalación Completa

### 📋 **Prerrequisitos del Sistema**
```bash
# Versiones mínimas requeridas
Node.js >= 18.0.0
PostgreSQL >= 13.0
Redis >= 6.0
npm >= 8.0.0 o yarn >= 1.22.0
```

### 1️⃣ **Configuración de la Base de Datos**

#### **Instalación de PostgreSQL**
```bash
# Windows (usando chocolatey)
choco install postgresql

# macOS (usando homebrew)
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
```

#### **Creación de la Base de Datos**
```sql
-- Conectar como superusuario
psql -U postgres

-- Crear usuario del sistema
CREATE USER stock_admin WITH PASSWORD 'tu_password_seguro';
ALTER USER stock_admin CREATEDB;

-- Crear base de datos principal
CREATE DATABASE stock_management_db 
WITH OWNER = stock_admin
     ENCODING = 'UTF8'
     LC_COLLATE = 'C'
     LC_CTYPE = 'C'
     TEMPLATE = template0;

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE stock_management_db TO stock_admin;
```

#### **Aplicar el Esquema de Base de Datos**
```bash
# Navegar al directorio del proyecto
cd stock-management-app

# Aplicar el esquema completo
psql -U stock_admin -d stock_management_db -f database/schema.sql

# Verificar la instalación
psql -U stock_admin -d stock_management_db -c "\dt"
```

### 2️⃣ **Configuración del Backend**

#### **Instalación de Dependencias**
```bash
cd backend
npm install

# O usando yarn
yarn install
```

#### **Variables de Entorno (.env)**
```bash
# Base de datos
DATABASE_URL="postgresql://stock_admin:tu_password@localhost:5433/stock_management_db"

# Redis
REDIS_URL="redis://localhost:6379"
REDIS_HOST="localhost"
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET="tu_jwt_secret_muy_seguro_256_bits"
JWT_REFRESH_SECRET="tu_refresh_secret_diferente_256_bits"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Servidor
PORT=3001
NODE_ENV=development

# Configuración de Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu_email@gmail.com"
SMTP_PASS="tu_password_de_aplicacion"

# Configuración de Archivos
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=10485760  # 10MB

# Configuración de Logs
LOG_LEVEL="debug"
LOG_FILE="logs/app.log"
```

#### **Inicialización del Backend**
```bash
# Generar cliente de Prisma
npx prisma generate

# Sincronizar esquema (solo desarrollo)
npx prisma db push

# Ejecutar seeders (datos iniciales)
npm run seed

# Iniciar en modo desarrollo
npm run start:dev

# Verificar que el servidor esté corriendo
curl http://localhost:3001/api/v1/health
```

### 3️⃣ **Configuración del Frontend**

#### **Instalación de Dependencias**
```bash
cd frontend
npm install

# O usando yarn
yarn install
```

#### **Variables de Entorno (.env.local)**
```bash
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_PWA=true

# Configuración de Desarrollo
NEXT_PUBLIC_DEBUG=true
```

#### **Inicialización del Frontend**
```bash
# Iniciar servidor de desarrollo
npm run dev

# Verificar compilación
npm run build

# Verificar linting
npm run lint
```

### 4️⃣ **Configuración de Redis**

#### **Instalación**
```bash
# Windows (usando chocolatey)
choco install redis-64

# macOS (usando homebrew)
brew install redis

# Ubuntu/Debian
sudo apt-get install redis-server
```

#### **Configuración**
```bash
# Iniciar Redis
redis-server

# Verificar conexión
redis-cli ping
```

## 🌐 URLs de Acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3000 | Interfaz principal del usuario |
| **Backend API** | http://localhost:3001/api/v1 | API REST para operaciones |
| **Documentación** | http://localhost:3001/api/docs | Swagger UI interactivo |
| **Health Check** | http://localhost:3001/api/v1/health | Verificación de estado |
| **PostgreSQL** | localhost:5433 | Base de datos principal |
| **Redis** | localhost:6379 | Cache y sesiones |

## 🔧 Scripts de Desarrollo

### **Backend**
```bash
# Desarrollo con hot reload
npm run start:dev

# Desarrollo con debugging
npm run start:debug

# Build de producción
npm run build

# Ejecutar en producción
npm run start:prod

# Tests
npm run test           # Tests unitarios
npm run test:watch     # Tests en modo watch
npm run test:cov       # Tests con coverage
npm run test:e2e       # Tests end-to-end

# Base de datos
npm run db:migrate     # Ejecutar migraciones
npm run db:seed        # Poblar con datos iniciales
npm run db:reset       # Resetear base de datos
npm run db:studio      # Abrir Prisma Studio

# Utilidades
npm run lint           # Verificar código
npm run format         # Formatear código
npm run typecheck      # Verificar tipos
```

### **Frontend**
```bash
# Desarrollo
npm run dev            # Servidor de desarrollo
npm run dev:turbo      # Con Turbopack (experimental)

# Producción
npm run build          # Build optimizado
npm run start          # Servidor de producción
npm run preview        # Preview del build

# Calidad de código
npm run lint           # ESLint
npm run lint:fix       # Corregir automáticamente
npm run type-check     # Verificación de tipos
npm run format         # Prettier

# Testing (configurar según necesidades)
npm run test           # Tests unitarios
npm run test:watch     # Tests en modo watch
npm run test:coverage  # Coverage report

# Análisis
npm run analyze        # Análisis del bundle
npm run audit          # Auditoría de dependencias
```

## 🏗️ Estructura Detallada del Proyecto (puede no estar actualizada)

```
stock-management-app/
├── 📁 backend/                     # API NestJS
│   ├── 📁 src/
│   │   ├── 📁 auth/                # Módulo de autenticación
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── dto/
│   │   ├── 📁 companies/           # Gestión de empresas
│   │   ├── 📁 users/               # Gestión de usuarios
│   │   ├── 📁 products/            # Gestión de productos
│   │   ├── 📁 inventory/           # Gestión de inventario
│   │   ├── 📁 warehouses/          # Gestión de almacenes
│   │   ├── 📁 purchases/           # Gestión de compras
│   │   ├── 📁 reports/             # Sistema de reportes
│   │   ├── 📁 common/              # Módulos compartidos
│   │   │   ├── 📁 decorators/
│   │   │   ├── 📁 filters/
│   │   │   ├── 📁 guards/
│   │   │   ├── 📁 interceptors/
│   │   │   └── 📁 pipes/
│   │   ├── 📁 config/              # Configuraciones
│   │   ├── 📁 database/            # Módulos de base de datos
│   │   └── main.ts                 # Punto de entrada
│   ├── 📁 prisma/                  # Configuración de Prisma
│   │   ├── schema.prisma
│   │   ├── 📁 migrations/
│   │   └── 📁 seeds/
│   ├── 📁 test/                    # Tests e2e
│   ├── 📁 docs/                    # Documentación adicional
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── 📁 frontend/                    # Frontend NextJS
│   ├── 📁 app/                     # App Router (NextJS 13+)
│   │   ├── 📁 auth/                # Páginas de autenticación
│   │   │   ├── 📁 login/
│   │   │   ├── 📁 register/
│   │   │   └── layout.tsx
│   │   ├── 📁 dashboard/           # Dashboard principal
│   │   │   ├── 📁 products/
│   │   │   ├── 📁 inventory/
│   │   │   ├── 📁 warehouses/
│   │   │   ├── 📁 purchases/
│   │   │   ├── 📁 reports/
│   │   │   ├── 📁 settings/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx              # Layout raíz
│   │   └── page.tsx                # Página principal
│   ├── 📁 components/              # Componentes reutilizables
│   │   ├── 📁 ui/                  # Componentes base (ShadCN)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── form.tsx
│   │   │   └── ...
│   │   ├── 📁 forms/               # Formularios específicos
│   │   ├── 📁 tables/              # Tablas de datos
│   │   ├── 📁 charts/              # Gráficos y visualizaciones
│   │   └── 📁 layout/              # Componentes de layout
│   ├── 📁 lib/                     # Utilidades y configuración
│   │   ├── 📁 api/                 # Cliente HTTP
│   │   ├── 📁 contexts/            # Contextos de React
│   │   ├── 📁 hooks/               # Custom hooks
│   │   ├── 📁 utils/               # Funciones de utilidad
│   │   └── 📁 validations/         # Esquemas de validación
│   ├── 📁 types/                   # Definiciones de tipos
│   ├── 📁 public/                  # Archivos estáticos
│   ├── .env.local.example
│   ├── components.json             # Configuración ShadCN
│   ├── tailwind.config.js
│   ├── package.json
│   └── next.config.js
│
├── 📁 database/                    # Scripts de base de datos
│   ├── schema.sql                  # Esquema completo
│   ├── 📁 seeds/                   # Datos iniciales
│   ├── 📁 migrations/              # Migraciones manuales
│   └── README.md
│
├── 📁 docs/                        # Documentación del proyecto
│   ├── 📁 api/                     # Documentación de API
│   ├── 📁 database/                # Esquemas y diagramas
│   ├── 📁 deployment/              # Guías de despliegue
│   └── 📁 user-guide/              # Manual de usuario
│
├── 📁 scripts/                     # Scripts de automatización
│   ├── setup.sh                   # Setup inicial
│   ├── deploy.sh                  # Script de despliegue
│   └── backup.sh                  # Script de backup
│
├── .gitignore
├── README.md                       # Documentación principal
└── docker-compose.yml             # Configuración Docker
```

## 🔐 Características de Seguridad Detalladas

### **Autenticación y Autorización**
- **JWT Tokens**: Tokens de acceso de corta duración (15 minutos)
- **Refresh Tokens**: Tokens de renovación seguros (7 días)
- **Session Management**: Control de múltiples dispositivos por usuario
- **Password Policies**: Validaciones robustas de contraseñas
- **Two-Factor Authentication**: Preparado para implementar 2FA

### **Control de Acceso**
- **RBAC Granular**: 43 permisos específicos organizados por recursos
- **Dynamic Permissions**: Permisos configurables por empresa
- **Route Guards**: Protección automática de rutas frontend
- **API Guards**: Validación de permisos en cada endpoint

### **Auditoría y Monitoreo**
- **Activity Logging**: Registro de todas las acciones de usuarios
- **Session Tracking**: Seguimiento de actividad por sesión
- **IP Geolocation**: Ubicación geográfica de accesos
- **Suspicious Activity**: Detección de patrones anómalos

### **Protección de Datos**
- **Data Encryption**: Encriptación de campos sensibles
- **SQL Injection Prevention**: Uso de ORM con queries parametrizadas
- **XSS Protection**: Sanitización de inputs
- **CSRF Protection**: Tokens anti-CSRF en formularios

## 📊 Métricas y Monitoreo

### **KPIs del Sistema**
- **Usuarios Activos**: Usuarios únicos por día/mes
- **Empresas Registradas**: Total de tenants activos
- **Transacciones**: Movimientos de inventario por período
- **Performance**: Tiempo de respuesta de APIs
- **Disponibilidad**: Uptime del sistema

### **Alertas Automáticas**
- **Stock Bajo**: Productos por debajo del mínimo
- **Productos Vencidos**: Alertas de caducidad
- **Transferencias Pendientes**: Movimientos sin completar
- **Errores de Sistema**: Notificaciones técnicas

## 🚀 Planes de Desarrollo Futuro

### **Funcionalidades Próximas**
1. **Aplicación Móvil**: App nativa para inventario en campo
2. **API GraphQL**: Para consultas más eficientes
3. **Integraciones**: Conectores con sistemas ERP populares
4. **IA/ML**: Predicción de demanda y optimización de stock
5. **IoT Integration**: Sensores para monitoreo automático

### **Mejoras Técnicas**
1. **Microservicios**: Migración a arquitectura distribuida
2. **Event Sourcing**: Para mejor trazabilidad
3. **WebSockets**: Actualizaciones en tiempo real
4. **Caching Avanzado**: Redis Cluster para mejor performance
5. **CI/CD**: Pipeline completo de despliegue

## 🤝 Contribución al Proyecto

### **Guías de Contribución**
1. **Fork** del repositorio
2. **Branch** nueva para cada feature (`feature/nueva-funcionalidad`)
3. **Commits** descriptivos siguiendo conventional commits
4. **Tests** para nuevas funcionalidades
5. **Pull Request** con descripción detallada

### **Estándares de Código**
- **ESLint**: Configuración estricta para TypeScript
- **Prettier**: Formateo automático de código
- **Husky**: Git hooks para validaciones pre-commit
- **Conventional Commits**: Formato estándar de commits
- **Jest**: Tests unitarios con coverage mínimo del 80%

## 📄 Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte y Contacto

### **Canales de Soporte**
- **GitHub Issues**: Para reportar bugs y solicitar features
- **Discussions**: Para preguntas generales y discusiones
- **Email**: soporte@stockmanager.com
- **Documentation**: Documentación completa en `/docs`

### **Comunidad**
- **Discord**: Canal de la comunidad para desarrolladores
- **Newsletter**: Actualizaciones mensuales del proyecto
- **Blog**: Artículos técnicos y casos de uso

---

**Stock Management System** - *Optimiza tu inventario, maximiza tu eficiencia* 🚀

### 📈 Estado del Proyecto
- ✅ **Backend**: API completa y funcional
- ✅ **Frontend**: Interfaz moderna y responsive
- ✅ **Base de Datos**: Esquema completo implementado
- ✅ **Autenticación**: Sistema seguro con JWT
- ✅ **Multi-Tenant**: Arquitectura lista para producción
- 🔄 **Testing**: En desarrollo
- 🔄 **Documentación**: Ampliándose continuamente
- 🔄 **Deployment**: Configurando CI/CD

**Última actualización**: Octubre 2025 | **Versión**: 1.0.0-beta