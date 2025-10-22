-- Script para eliminar vistas y tablas del schema.sql anterior
-- Esto permite que Prisma cree su propio esquema desde cero

-- Eliminar vistas
DROP VIEW IF EXISTS v_user_permissions CASCADE;
DROP VIEW IF EXISTS v_products_with_suppliers CASCADE;
DROP VIEW IF EXISTS v_stock_movements_detail CASCADE;
DROP VIEW IF EXISTS v_inventory_overview CASCADE;

-- Eliminar todas las tablas (en orden inverso de dependencias)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS stock_alerts CASCADE;
DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS stock_transfer_items CASCADE;
DROP TABLE IF EXISTS stock_transfers CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS inventory_batches CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS product_composition_junction CASCADE;
DROP TABLE IF EXISTS product_supplier_junction CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS user_warehouse_junction CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS session_activities CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_role_junction CASCADE;
DROP TABLE IF EXISTS role_permission_junction CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

-- Eliminar tipos enum si existen
DROP TYPE IF EXISTS CompanyType CASCADE;
DROP TYPE IF EXISTS SubscriptionPlan CASCADE;
DROP TYPE IF EXISTS WarehouseType CASCADE;
DROP TYPE IF EXISTS AccessLevel CASCADE;
DROP TYPE IF EXISTS UnitType CASCADE;
DROP TYPE IF EXISTS ProductType CASCADE;
DROP TYPE IF EXISTS StockMovementType CASCADE;
DROP TYPE IF EXISTS TransferStatus CASCADE;
DROP TYPE IF EXISTS PurchaseOrderStatus CASCADE;
DROP TYPE IF EXISTS PaymentStatus CASCADE;
DROP TYPE IF EXISTS AlertType CASCADE;
DROP TYPE IF EXISTS AlertSeverity CASCADE;

-- Eliminar funciones
DROP FUNCTION IF EXISTS generate_uuid() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
