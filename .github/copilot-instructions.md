# Sistema de Gestión de Inventario Multi-Empresa

## Descripción
Sistema integral de gestión de inventario para cadenas de restaurantes, empresas independientes y franquicias. Arquitectura multi-tenant con aislamiento completo de datos entre empresas. /frontend y /backend (2 apps separadas).

## Stack Tecnológico

### Backend
- **Framework**: NestJS 11+ con TypeScript
- **Base de Datos**: PostgreSQL 18 (puerto 5433)
- **ORM**: Prisma 6 (nunca usar raw SQL a menos que sea necesario)
- **Caché**: Redis (sesiones y performance)
- **Autenticación**: JWT + Refresh Tokens
- **Validación**: Class-validator y DTO patterns

### Frontend
- **Framework**: NextJS 16 (App Router)
- **UI**: TailwindCSS 4 + ShadCN UI
- **Tipado**: TypeScript 5
- **Estado**: Context API + Custom Hooks
- **HTTP Client**: Axios
- **Formularios**: React Hook Form + Zod
- **Iconos**: Lucide React

## Arquitectura de Base de Datos

### Entidades Principales
```
Multi-Tenant:
- companies → users → user_sessions → session_activities

RBAC:
- permissions (43 permisos) → roles → role_permission_junction
- users → user_role_junction → roles

Productos:
- categories → products → product_components
- suppliers → product_suppliers → products

Inventario:
- warehouses → inventory_items
- inventory_movements
- inventory_transfers → inventory_transfer_items

Compras:
- purchase_orders → purchase_order_items
- purchase_receipts → purchase_receipt_items

Reportes:
- reports
- report_templates
```

### Convenciones
- **IDs**: UUIDs como claves primarias
- **Timestamps**: `created_at`, `updated_at` automáticos
- **Soft Delete**: Campo `deleted_at` para eliminación lógica
- **Multi-tenant**: Todas las entidades incluyen `company_id` (excepto `companies` y `permissions`)

## Sistema de Permisos RBAC

### Recursos y Acciones (43 permisos totales)
- **companies**: view, create, update, delete
- **users**: view, create, update, delete, manage_roles
- **products**: view, create, update, delete
- **categories**: view, create, update, delete
- **suppliers**: view, create, update, delete
- **inventory**: view, create, update, delete, transfer
- **warehouses**: view, create, update, delete
- **purchases**: view, create, update, delete, approve, receive
- **reports**: view, create, export
- **settings**: view, update

### Roles Predefinidos
1. **Super Admin**: Acceso completo
2. **Company Admin**: Gestión completa de su empresa
3. **Manager**: Operaciones y reportes avanzados
4. **Supervisor**: Operaciones básicas
5. **Employee**: Consultas y operaciones limitadas
6. **Viewer**: Solo lectura

## Patrones y Convenciones de Código

### Backend (NestJS)
- **Módulos**: Estructura modular por dominio (auth, products, inventory, etc.)
- **DTOs**: Validación con `class-validator` y `class-transformer`
- **Guards**: `JwtAuthGuard` para rutas protegidas, guards personalizados para permisos
- **Decorators**: `@CurrentUser()` para obtener usuario autenticado, `@Public()` para rutas públicas
- **Servicios**: Lógica de negocio con inyección de dependencias
- **Controllers**: Solo manejo de requests/responses
- **Prisma**: Queries type-safe, transacciones para operaciones complejas
- **Naming**: 
  - Archivos: kebab-case (e.g., `auth.service.ts`)
  - Clases: PascalCase (e.g., `AuthService`)
  - Métodos: camelCase (e.g., `validateUser()`)

### Frontend (NextJS)
- **App Router**: Uso de `layout.tsx` y `page.tsx`
- **Componentes**: 
  - UI base en `components/ui/` (ShadCN)
  - Componentes de negocio en `components/`
  - Server Components por defecto, Client Components con `'use client'`
- **Formularios**: React Hook Form + Zod para validación
- **API Calls**: Axios con interceptors para tokens
- **Context**: AuthContext para estado global de autenticación
- **Naming**:
  - Archivos: kebab-case para páginas, PascalCase para componentes
  - Componentes: PascalCase (e.g., `ProductForm`)
  - Hooks: camelCase con prefijo `use` (e.g., `useAuth`)

### Variables de Entorno

#### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5433/db_name"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="secret_key"
JWT_REFRESH_SECRET="refresh_secret_key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Estructura de Directorios Clave

### Backend
```
src/
├── modules/          # Módulos de negocio
│   ├── auth/         # Autenticación y autorización
│   ├── users/        # Gestión de usuarios
│   ├── products/     # Catálogo de productos
│   └── inventory/    # Gestión de inventario
├── common/           # Utilidades compartidas
│   ├── decorators/   # Decoradores personalizados
│   ├── guards/       # Guards de autenticación/autorización
│   └── filters/      # Exception filters
├── config/           # Configuración de módulos
└── shared/           # Servicios compartidos (Prisma, etc.)
```

### Frontend
```
app/
├── auth/             # Páginas de autenticación
├── dashboard/        # Dashboard protegido
components/
├── ui/               # Componentes base (ShadCN)
└── [feature]/        # Componentes por funcionalidad
lib/
├── api/              # Cliente API
├── contexts/         # Contextos de React
└── utils/            # Funciones auxiliares
```

## Reglas de Desarrollo

### Multi-Tenancy
- **SIEMPRE** incluir filtro `company_id` en queries de base de datos
- Obtener `company_id` del usuario autenticado (JWT)
- Validar que el usuario solo acceda a datos de su empresa
- Las tablas `companies` y `permissions` NO tienen `company_id`

### Seguridad
- Todos los endpoints protegidos con `JwtAuthGuard` excepto login/register
- Validar permisos con guards personalizados cuando sea necesario
- Sanitizar inputs y validar con DTOs
- No exponer información sensible en errores

### Performance
- Usar Redis para caché de sesiones
- Índices en columnas frecuentemente consultadas (`company_id`, `created_at`)
- Paginación en listados grandes
- Lazy loading en componentes frontend

### Testing
- Tests unitarios para servicios complejos
- Tests e2e para flujos críticos
- Mocks para dependencias externas

### Comandos de usuario (prefix: ?)
?commit: Generate a concise and descriptive git commit message based on the changes made in the recent edits.
?commitpush: Create a concise and descriptive git commit and push the changes to the remote repository.