-- Drop all views that might conflict with Prisma schema
DROP VIEW IF EXISTS v_inventory_overview CASCADE;
DROP VIEW IF EXISTS v_stock_movements_detail CASCADE;
DROP VIEW IF EXISTS v_products_with_suppliers CASCADE;
DROP VIEW IF EXISTS v_user_permissions CASCADE;
