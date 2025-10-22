# 🌱 Database Seeding Guide

Este archivo contiene instrucciones para poblar la base de datos con datos iniciales.

## 📋 Prerrequisitos

1. PostgreSQL instalado y corriendo en el puerto 5433
2. Base de datos `stock_management_db` creada
3. Usuario con permisos adecuados

## 🔧 Configuración de la Base de Datos

### Opción 1: Usar el schema SQL completo

```bash
# Desde el directorio raíz del proyecto
psql -U postgres -h localhost -p 5433 -f database/schema.sql
```

Este script creará:
- La base de datos `stock_management`
- Todas las tablas necesarias
- Extensiones de PostgreSQL
- Triggers y funciones
- Vistas para consultas comunes
- Datos iniciales (permisos, configuración del sistema)

### Opción 2: Usar Prisma (Recomendado para desarrollo)

```bash
# Navegar al directorio backend
cd backend

# 1. Generar el cliente de Prisma
npm run prisma:generate

# 2. Sincronizar el esquema (esto eliminará todos los datos existentes)
npm run prisma:push

# 3. Ejecutar el seed
npm run prisma:seed
```

## 🗝️ Variables de Entorno

Asegúrate de que tu archivo `.env` tenga la configuración correcta:

```env
# Opción 1: Usuario postgres (recomendado para desarrollo local)
DATABASE_URL="postgresql://postgres:tu_password@localhost:5433/stock_management_db?schema=public"

# Opción 2: Usuario personalizado
DATABASE_URL="postgresql://stock_admin:tu_password@localhost:5433/stock_management_db?schema=public"
```

## 📦 Datos Iniciales Incluidos

El seed incluye:

### 1. **Permisos del Sistema** (43 permisos)
- Gestión de usuarios
- Gestión de roles
- Gestión de productos
- Gestión de inventario
- Gestión de almacenes
- Órdenes de compra
- Proveedores
- Reportes
- Configuración

### 2. **Empresa Demo**
- Nombre: Demo Restaurant Chain
- Email: admin@demo-restaurant.com
- Tipo: Cadena de restaurantes
- Plan: Premium

### 3. **Unidades de Medida** (10 unidades)
- Peso: kg, g, lb, oz
- Volumen: L, ml, gal
- Unidad: unit, doz, case

### 4. **Roles** (4 roles predefinidos)
- **Super Admin**: Acceso completo
- **Admin**: Acceso administrativo
- **Manager**: Gestión de almacenes
- **Employee**: Acceso básico de lectura

### 5. **Usuario Administrador**
- Email: `admin@demo-restaurant.com`
- Password: `Admin123!`
- Rol: Super Admin

### 6. **Almacén Principal**
- Código: WH-001
- Nombre: Main Warehouse
- Ubicación: New York, NY

### 7. **Categorías de Productos** (6 categorías)
- Vegetables
- Fruits
- Meats
- Dairy
- Beverages
- Dry Goods

### 8. **Proveedores** (3 proveedores demo)
- Fresh Produce Co.
- Premium Meats Ltd.
- Dairy Distributors Inc.

### 9. **Productos Demo** (4 productos)
- Tomatoes (VEG-001)
- Lettuce (VEG-002)
- Chicken Breast (MEAT-001)
- Milk (DAIRY-001)

### 10. **Inventario Inicial**
- Stock aleatorio para cada producto (50-150 unidades)

## 🚀 Scripts Disponibles

```bash
# Generar cliente de Prisma
npm run prisma:generate

# Sincronizar esquema con la base de datos
npm run prisma:push

# Ejecutar seed
npm run prisma:seed

# Resetear base de datos y ejecutar seed
npm run db:reset

# Abrir Prisma Studio (interfaz visual)
npm run prisma:studio
```

## ⚠️ Solución de Problemas

### Error: "Authentication failed"
- Verifica las credenciales en tu archivo `.env`
- Asegúrate de que el usuario tenga permisos en la base de datos
- Confirma que PostgreSQL esté corriendo en el puerto correcto

### Error: "Database does not exist"
- Crea la base de datos manualmente:
```sql
CREATE DATABASE stock_management_db;
```

### Error: "Cannot alter column type used in view"
- Elimina las vistas existentes antes de ejecutar `prisma push`
- Usa `npm run db:reset` para un reset completo

### Error: "Unique constraint violation"
- La base de datos ya tiene datos
- Ejecuta `npm run db:reset` para comenzar desde cero

## 📝 Credenciales de Acceso

Después de ejecutar el seed, puedes iniciar sesión con:

```
Email: admin@demo-restaurant.com
Password: Admin123!
```

## 🔄 Resetear la Base de Datos

Si necesitas empezar desde cero:

```bash
# Opción 1: Usando Prisma (elimina todos los datos)
npm run db:reset

# Opción 2: Manualmente
psql -U postgres -h localhost -p 5433 -c "DROP DATABASE stock_management_db;"
psql -U postgres -h localhost -p 5433 -c "CREATE DATABASE stock_management_db;"
npm run prisma:push
npm run prisma:seed
```

## 📚 Siguiente Paso

Después de ejecutar el seed, puedes:

1. Iniciar el servidor backend: `npm run start:dev`
2. Verificar los datos en Prisma Studio: `npm run prisma:studio`
3. Probar los endpoints de la API en: `http://localhost:3001/api/docs`
4. Iniciar el frontend y hacer login con las credenciales demo

---

**Nota**: Este seed es solo para desarrollo y testing. En producción, debes crear tus propios datos y cambiar todas las credenciales de ejemplo.
