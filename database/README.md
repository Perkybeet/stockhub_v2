# Stock Management System - Database Schema

## Overview
This is a comprehensive PostgreSQL database schema for a multi-tenant stock management system designed for restaurant chains, retail businesses, and other enterprises requiring inventory management.

## Database Information
- **Database Engine**: PostgreSQL 13+
- **Username**: root
- **Password**: 032112
- **Database**: stock_management

## Key Features

### 🔐 **RBAC (Role-Based Access Control)**
- **Permissions Table**: Individual permissions with resource-action mapping
- **Roles Table**: Grouping of permissions per company
- **Role-Permission Junction**: Many-to-many relationship
- **User-Role Junction**: Users can have multiple roles with expiration support

### 🔒 **Advanced Authentication & Session Management**
- **Multi-device Session Tracking**: Track active sessions across devices
- **Real-time Session Control**: Ability to close sessions remotely
- **Session Activities**: Detailed logging of session actions
- **JWT Support**: Designed for JWT tokens with refresh token capability
- **Redis Integration**: Ready for Redis-based session storage

### 🏢 **Multi-tenant Architecture**
- Complete tenant isolation
- Company-based data segregation
- Scalable for multiple enterprises

### 📦 **Comprehensive Inventory Management**
- Product catalog with categories
- Multi-warehouse support
- Batch/lot tracking for traceability
- Stock movements with full audit trail
- Transfer management between warehouses
- Purchase order system
- Stock alerts and notifications

### 🔍 **Advanced Features**
- Full-text search capabilities
- Audit logging for all critical actions
- Hierarchical category structure
- Composite products (recipes/kits)
- Supplier management
- Configurable system settings

## Database Structure

### Core Tables
- `companies` - Tenant/company information
- `users` - User accounts
- `permissions` - Individual system permissions
- `roles` - Permission groups
- `role_permission_junction` - Role-permission mapping
- `user_role_junction` - User-role assignments

### Session Management
- `user_sessions` - Active user sessions
- `session_activities` - Session action logs

### Inventory Management
- `products` - Product catalog
- `categories` - Product categories (hierarchical)
- `warehouses` - Storage locations
- `inventory` - Current stock levels
- `inventory_batches` - Batch/lot tracking
- `stock_movements` - All inventory transactions
- `stock_transfers` - Warehouse transfers

### Operations
- `suppliers` - Vendor management
- `purchase_orders` - Purchase orders
- `purchase_order_items` - Purchase order line items
- `stock_alerts` - Automated alerts

### System
- `audit_logs` - Comprehensive audit trail
- `system_settings` - Configurable system parameters

## Installation

### Prerequisites
- PostgreSQL 13+ installed and running
- Database user with appropriate permissions

### 1. Create Database and Execute Schema
```bash
# Run the schema script (it will create the database automatically)
psql -U root -h localhost -f schema.sql
```

### 2. Verify Installation
```sql
-- Connect to the new database
\c stock_management

-- Check tables
\dt

-- Verify demo data
SELECT * FROM companies;
SELECT * FROM permissions LIMIT 10;
```

## Default System Setup

### Pre-configured Permissions
The system comes with comprehensive RBAC permissions for:
- User management (users.*)
- Role management (roles.*)
- Product management (products.*)
- Inventory management (inventory.*)
- Warehouse management (warehouses.*)
- Purchase orders (purchase_orders.*)
- Supplier management (suppliers.*)
- Reports (reports.*)
- Settings (settings.*)

### System Settings
- Session timeout: 1 hour
- JWT access token: 15 minutes
- JWT refresh token: 7 days
- Max concurrent sessions: 5 per user
- Password minimum length: 8 characters
- Max login attempts: 5

### Demo Company
A demo company is created for testing purposes:
- Name: Demo Restaurant Chain
- Email: admin@demo-restaurant.com
- Industry: Restaurant
- Type: Chain
- Plan: Premium

## Security Features

### 🛡️ Authentication Security
- Password hashing (bcrypt ready)
- Account lockout after failed attempts
- Two-factor authentication support
- Session timeout management
- Device tracking and management

### 🔐 RBAC Security
- Granular permissions
- Resource-action based access control
- Role expiration support
- Multi-role assignment per user
- Company-level role isolation

### 📊 Audit & Compliance
- Complete audit trail
- User action logging
- Session activity tracking
- Data change history
- IP address logging

## Performance Optimizations

### Indexes
- Strategic B-tree indexes on foreign keys
- GIN indexes for JSONB columns
- Full-text search indexes
- Composite indexes for common queries

### Views
- `v_inventory_overview` - Real-time inventory status
- `v_stock_movements_detail` - Detailed movement history
- `v_products_with_suppliers` - Product-supplier relationships
- `v_user_permissions` - Flattened user permissions

### Triggers
- Automatic `updated_at` timestamp updates
- Referential integrity enforcement

## Scalability Considerations

### Multi-tenancy
- Tenant isolation at database level
- Company-based data partitioning ready
- Scalable for thousands of companies

### Performance
- Optimized queries with proper indexing
- JSONB for flexible metadata storage
- Generated columns for computed values
- Efficient foreign key relationships

## Integration Points

### 🔴 Redis Integration
Ready for Redis integration for:
- Session storage
- Cache management
- Real-time notifications
- Rate limiting

### 🟢 Application Integration
Designed for:
- NestJS backend with Prisma ORM
- NextJS frontend
- JWT authentication
- Multi-tenant architecture

## Maintenance

### Regular Tasks
```sql
-- Cleanup expired sessions
DELETE FROM user_sessions WHERE expires_at < NOW();

-- Cleanup old audit logs (keep 1 year)
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year';

-- Update statistics
ANALYZE;
```

### Monitoring Queries
```sql
-- Active sessions count
SELECT COUNT(*) FROM user_sessions WHERE is_active = true;

-- Company statistics
SELECT 
    c.name,
    COUNT(DISTINCT u.id) as users,
    COUNT(DISTINCT w.id) as warehouses,
    COUNT(DISTINCT p.id) as products
FROM companies c
LEFT JOIN users u ON c.id = u.company_id AND u.is_active = true
LEFT JOIN warehouses w ON c.id = w.company_id AND w.is_active = true  
LEFT JOIN products p ON c.id = p.company_id AND p.is_active = true
GROUP BY c.id, c.name;
```

This schema provides a solid foundation for a enterprise-grade stock management system with modern security practices and scalability features.
   - Workflow de aprobación
   - Estados: pendiente, en tránsito, completado

8. **Órdenes de Compra**
   - Gestión de proveedores
   - Items detallados
   - Estados y aprobaciones

9. **Alertas**
   - Stock bajo
   - Stock agotado
   - Productos por vencer
   - Productos vencidos

10. **Auditoría**
    - Log completo de cambios
    - Trazabilidad de acciones
    - IP y user agent

## Instalación

### 1. Ejecutar el Schema

```bash
mysql -u root -p < schema.sql
```

O desde MySQL Workbench:
1. Abrir el archivo `schema.sql`
2. Ejecutar el script completo

### 2. Verificar la Instalación

```sql
USE stock_management;
SHOW TABLES;

-- Verificar datos de demo
SELECT * FROM companies;
SELECT * FROM users;
```

## Credenciales Demo

- **Email**: admin@demo-restaurant.com
- **Password**: Admin123!
- **Company**: Demo Restaurant Chain

## Tablas Junction (Relaciones Muchos-a-Muchos)

- `user_role_junction` - Usuarios y Roles
- `user_warehouse_junction` - Usuarios y Almacenes
- `product_supplier_junction` - Productos y Proveedores
- `product_composition_junction` - Productos Compuestos

## Vistas (Views)

### v_inventory_overview
Vista completa del inventario con detalles de productos, almacenes y estado del stock.

### v_stock_movements_detail
Movimientos de stock con información detallada de productos, almacenes y usuarios.

### v_products_with_suppliers
Productos con información agregada de proveedores y precios.

## Índices

Todos los campos críticos tienen índices para optimizar:
- Búsquedas por empresa (company_id)
- Búsquedas por productos y almacenes
- Filtros por estado (is_active)
- Búsquedas full-text en productos
- Fechas y timestamps

## Escalabilidad

El diseño considera:
- Particionamiento por company_id
- Índices optimizados
- Campos JSON para flexibilidad
- Vistas materializadas (futuro)
- Archivado de datos históricos (futuro)

## Tipos de Datos

- **IDs**: UUID (CHAR(36)) para mejor distribución y seguridad
- **Cantidades**: DECIMAL(15,3) para precisión
- **Precios**: DECIMAL(15,2) o DECIMAL(15,4) para costos unitarios
- **JSON**: Para configuraciones y metadatos flexibles

## Mantenimiento

### Backup
```bash
mysqldump -u root -p stock_management > backup_$(date +%Y%m%d).sql
```

### Optimización
```sql
OPTIMIZE TABLE inventory;
ANALYZE TABLE products;
```

### Limpieza de Datos Antiguos
```sql
-- Archivar movimientos de más de 2 años
-- Implementar según necesidades específicas
```
