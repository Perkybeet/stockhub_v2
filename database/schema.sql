-- =====================================================
-- STOCK MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Multi-tenant architecture for restaurant chains and businesses
-- PostgreSQL with RBAC and Real-time Session Management
-- =====================================================

-- Drop database if exists and create new one
DROP DATABASE IF EXISTS stock_management;
CREATE DATABASE stock_management 
    WITH 
    TEMPLATE = template0
    OWNER = root
    ENCODING = 'UTF8'
    LC_COLLATE = 'C'
    LC_CTYPE = 'C'
    TABLESPACE = pg_default;

-- Connect to the database
\c stock_management

-- =====================================================
-- EXTENSIONS AND FUNCTIONS
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Function to generate UUIDs
CREATE OR REPLACE FUNCTION generate_uuid() RETURNS UUID AS $$
BEGIN
    RETURN uuid_generate_v4();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Companies (Tenants) - Main entity for multi-tenancy
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    tax_id VARCHAR(50) UNIQUE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    logo_url VARCHAR(500),
    website VARCHAR(255),
    industry VARCHAR(100), -- 'restaurant', 'retail', 'manufacturing', etc.
    company_type VARCHAR(20) CHECK (company_type IN ('chain', 'independent', 'franchise')) DEFAULT 'independent',
    subscription_plan VARCHAR(20) CHECK (subscription_plan IN ('free', 'basic', 'premium', 'enterprise')) DEFAULT 'free',
    subscription_expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}', -- Custom settings per company
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for companies
CREATE INDEX idx_company_active ON companies(is_active);
CREATE INDEX idx_company_type ON companies(company_type);
CREATE INDEX idx_tax_id ON companies(tax_id);
CREATE INDEX idx_company_settings ON companies USING GIN(settings);

-- Users - Multi-tenant users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    avatar_url VARCHAR(500),
    language VARCHAR(10) DEFAULT 'es',
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    two_factor_secret VARCHAR(32),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, email)
);

-- Create indexes for users
CREATE INDEX idx_user_company ON users(company_id);
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_active ON users(is_active);
CREATE INDEX idx_user_password_reset ON users(password_reset_token);

-- =====================================================
-- RBAC SYSTEM
-- =====================================================

-- Permissions - Individual permissions in the system
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    resource VARCHAR(100) NOT NULL, -- 'users', 'products', 'inventory', etc.
    action VARCHAR(50) NOT NULL, -- 'create', 'read', 'update', 'delete', 'manage'
    is_system_permission BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for permissions
CREATE INDEX idx_permission_resource ON permissions(resource);
CREATE INDEX idx_permission_action ON permissions(action);
CREATE INDEX idx_permission_system ON permissions(is_system_permission);

-- Roles - Permission groups per company
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE, -- System roles cannot be deleted
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, slug)
);

-- Create indexes for roles
CREATE INDEX idx_role_company ON roles(company_id);
CREATE INDEX idx_role_active ON roles(is_active);

-- Role Permission Junction - Many to many relationship
CREATE TABLE role_permission_junction (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(role_id, permission_id)
);

-- Create indexes for role permissions
CREATE INDEX idx_role_permission_role ON role_permission_junction(role_id);
CREATE INDEX idx_role_permission_permission ON role_permission_junction(permission_id);

-- User Role Junction - Users can have multiple roles
CREATE TABLE user_role_junction (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at TIMESTAMP, -- Optional role expiration
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, role_id)
);

-- Create indexes for user roles
CREATE INDEX idx_user_role_user ON user_role_junction(user_id);
CREATE INDEX idx_user_role_role ON user_role_junction(role_id);
CREATE INDEX idx_user_role_active ON user_role_junction(is_active);

-- =====================================================
-- SESSION MANAGEMENT
-- =====================================================

-- User Sessions - Track active sessions for real-time management
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255) NOT NULL UNIQUE,
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    location JSONB DEFAULT '{}', -- Country, city from IP
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for sessions
CREATE INDEX idx_session_user ON user_sessions(user_id);
CREATE INDEX idx_session_token ON user_sessions(session_token);
CREATE INDEX idx_session_refresh ON user_sessions(refresh_token);
CREATE INDEX idx_session_active ON user_sessions(is_active);
CREATE INDEX idx_session_expires ON user_sessions(expires_at);
CREATE INDEX idx_session_last_activity ON user_sessions(last_activity);

-- Session Activities - Track session actions for security
CREATE TABLE session_activities (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'action', 'refresh'
    activity_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for session activities
CREATE INDEX idx_activity_session ON session_activities(session_id);
CREATE INDEX idx_activity_type ON session_activities(activity_type);
CREATE INDEX idx_activity_date ON session_activities(created_at);

-- =====================================================
-- WAREHOUSE & LOCATION MANAGEMENT
-- =====================================================

-- Warehouses/Locations (can be restaurants, stores, warehouses)
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('warehouse', 'restaurant', 'store', 'kitchen', 'other')) DEFAULT 'warehouse',
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, code)
);

-- Create indexes for warehouses
CREATE INDEX idx_warehouse_company ON warehouses(company_id);
CREATE INDEX idx_warehouse_active ON warehouses(is_active);
CREATE INDEX idx_warehouse_type ON warehouses(type);
CREATE INDEX idx_warehouse_manager ON warehouses(manager_id);
CREATE INDEX idx_warehouse_settings ON warehouses USING GIN(settings);

-- User Warehouse Access Junction
CREATE TABLE user_warehouse_junction (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    access_level VARCHAR(20) CHECK (access_level IN ('read', 'write', 'admin')) DEFAULT 'read',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(user_id, warehouse_id)
);

-- Create indexes for user warehouse access
CREATE INDEX idx_user_warehouse_user ON user_warehouse_junction(user_id);
CREATE INDEX idx_user_warehouse_warehouse ON user_warehouse_junction(warehouse_id);

-- =====================================================
-- PRODUCT MANAGEMENT
-- =====================================================

-- Categories - Hierarchical structure
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, slug)
);

-- Create indexes for categories
CREATE INDEX idx_category_company ON categories(company_id);
CREATE INDEX idx_category_parent ON categories(parent_id);
CREATE INDEX idx_category_active ON categories(is_active);

-- Suppliers/Vendors
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    tax_id VARCHAR(50),
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    contact_person VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    payment_terms VARCHAR(100), -- 'net30', 'net60', 'immediate', etc.
    credit_limit DECIMAL(15, 2),
    rating SMALLINT CHECK (rating >= 1 AND rating <= 5), -- 1-5 stars
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for suppliers
CREATE INDEX idx_supplier_company ON suppliers(company_id);
CREATE INDEX idx_supplier_active ON suppliers(is_active);
CREATE INDEX idx_supplier_name ON suppliers(name);

-- Units of Measurement
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(20) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('weight', 'volume', 'length', 'unit', 'other')) DEFAULT 'unit',
    is_base_unit BOOLEAN DEFAULT FALSE,
    conversion_factor DECIMAL(15, 6), -- Conversion to base unit
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, abbreviation)
);

-- Create indexes for units
CREATE INDEX idx_unit_company ON units(company_id);
CREATE INDEX idx_unit_type ON units(type);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sku VARCHAR(100) NOT NULL,
    barcode VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
    unit_price DECIMAL(15, 2),
    cost_price DECIMAL(15, 2),
    tax_rate DECIMAL(5, 2) DEFAULT 0.00,
    min_stock_level DECIMAL(15, 3), -- Minimum stock alert
    max_stock_level DECIMAL(15, 3), -- Maximum stock capacity
    reorder_point DECIMAL(15, 3), -- When to reorder
    reorder_quantity DECIMAL(15, 3), -- Suggested reorder quantity
    product_type VARCHAR(20) CHECK (product_type IN ('simple', 'composite', 'service')) DEFAULT 'simple',
    is_perishable BOOLEAN DEFAULT FALSE,
    shelf_life_days INTEGER, -- Days until expiration
    storage_conditions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}', -- Additional custom fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, sku),
    UNIQUE(company_id, barcode)
);

-- Create indexes for products
CREATE INDEX idx_product_company ON products(company_id);
CREATE INDEX idx_product_category ON products(category_id);
CREATE INDEX idx_product_active ON products(is_active);
CREATE INDEX idx_product_name ON products(name);
CREATE INDEX idx_product_metadata ON products USING GIN(metadata);
CREATE INDEX idx_product_search ON products USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Product Supplier Junction (Products can have multiple suppliers)
CREATE TABLE product_supplier_junction (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    supplier_sku VARCHAR(100),
    supplier_price DECIMAL(15, 2),
    minimum_order_quantity DECIMAL(15, 3),
    lead_time_days INTEGER, -- Days for delivery
    is_preferred BOOLEAN DEFAULT FALSE,
    last_purchase_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, supplier_id)
);

-- Create indexes for product supplier junction
CREATE INDEX idx_product_supplier_product ON product_supplier_junction(product_id);
CREATE INDEX idx_product_supplier_supplier ON product_supplier_junction(supplier_id);

-- Composite Products (Recipes/Kits) - Products made from other products
CREATE TABLE product_composition_junction (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    parent_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE, -- The composite product
    child_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE, -- The component
    quantity DECIMAL(15, 3) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parent_product_id, child_product_id)
);

-- Create indexes for product composition
CREATE INDEX idx_composition_parent ON product_composition_junction(parent_product_id);
CREATE INDEX idx_composition_child ON product_composition_junction(child_product_id);

-- =====================================================
-- INVENTORY MANAGEMENT
-- =====================================================

-- Inventory - Current stock levels per warehouse
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    quantity DECIMAL(15, 3) DEFAULT 0.000,
    reserved_quantity DECIMAL(15, 3) DEFAULT 0.000, -- Reserved for orders
    available_quantity DECIMAL(15, 3) GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    last_counted_at TIMESTAMP,
    last_movement_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, warehouse_id)
);

-- Create indexes for inventory
CREATE INDEX idx_inventory_company ON inventory(company_id);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX idx_inventory_quantity ON inventory(quantity);
CREATE INDEX idx_inventory_available ON inventory(available_quantity);

-- Inventory Batches/Lots (for traceability and expiration tracking)
CREATE TABLE inventory_batches (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    batch_number VARCHAR(100) NOT NULL,
    quantity DECIMAL(15, 3) NOT NULL,
    remaining_quantity DECIMAL(15, 3) NOT NULL,
    cost_per_unit DECIMAL(15, 4),
    manufacturing_date DATE,
    expiration_date DATE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    received_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, batch_number)
);

-- Create indexes for inventory batches
CREATE INDEX idx_batch_company ON inventory_batches(company_id);
CREATE INDEX idx_batch_product ON inventory_batches(product_id);
CREATE INDEX idx_batch_warehouse ON inventory_batches(warehouse_id);
CREATE INDEX idx_batch_expiration ON inventory_batches(expiration_date);
CREATE INDEX idx_batch_active ON inventory_batches(is_active);

-- Stock Movements - All inventory transactions
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES inventory_batches(id) ON DELETE SET NULL,
    movement_type VARCHAR(30) CHECK (movement_type IN (
        'purchase', 'sale', 'transfer_in', 'transfer_out', 
        'adjustment_increase', 'adjustment_decrease', 'return', 
        'damage', 'expired', 'production', 'consumption'
    )) NOT NULL,
    quantity DECIMAL(15, 3) NOT NULL,
    unit_cost DECIMAL(15, 4),
    total_cost DECIMAL(15, 2),
    reference_type VARCHAR(50), -- 'purchase_order', 'sales_order', 'transfer', etc.
    reference_id UUID, -- ID of related document
    notes TEXT,
    performed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for stock movements
CREATE INDEX idx_movement_company ON stock_movements(company_id);
CREATE INDEX idx_movement_product ON stock_movements(product_id);
CREATE INDEX idx_movement_warehouse ON stock_movements(warehouse_id);
CREATE INDEX idx_movement_type ON stock_movements(movement_type);
CREATE INDEX idx_movement_date ON stock_movements(performed_at);
CREATE INDEX idx_movement_reference ON stock_movements(reference_type, reference_id);

-- Stock Transfers between warehouses
CREATE TABLE stock_transfers (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    transfer_number VARCHAR(50) NOT NULL,
    from_warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    to_warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    status VARCHAR(20) CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')) DEFAULT 'pending',
    requested_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    approved_by UUID REFERENCES users(id) ON DELETE RESTRICT,
    shipped_by UUID REFERENCES users(id) ON DELETE RESTRICT,
    received_by UUID REFERENCES users(id) ON DELETE RESTRICT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    shipped_at TIMESTAMP,
    received_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, transfer_number)
);

-- Create indexes for stock transfers
CREATE INDEX idx_transfer_company ON stock_transfers(company_id);
CREATE INDEX idx_transfer_from ON stock_transfers(from_warehouse_id);
CREATE INDEX idx_transfer_to ON stock_transfers(to_warehouse_id);
CREATE INDEX idx_transfer_status ON stock_transfers(status);

-- Stock Transfer Items
CREATE TABLE stock_transfer_items (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    transfer_id UUID NOT NULL REFERENCES stock_transfers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    batch_id UUID REFERENCES inventory_batches(id) ON DELETE SET NULL,
    quantity_requested DECIMAL(15, 3) NOT NULL,
    quantity_shipped DECIMAL(15, 3),
    quantity_received DECIMAL(15, 3),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for stock transfer items
CREATE INDEX idx_transfer_item_transfer ON stock_transfer_items(transfer_id);
CREATE INDEX idx_transfer_item_product ON stock_transfer_items(product_id);

-- =====================================================
-- PURCHASE & SUPPLIER MANAGEMENT
-- =====================================================

-- Purchase Orders
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    order_number VARCHAR(50) NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    status VARCHAR(20) CHECK (status IN ('draft', 'pending', 'approved', 'ordered', 'received', 'cancelled')) DEFAULT 'draft',
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    subtotal DECIMAL(15, 2) DEFAULT 0.00,
    tax_amount DECIMAL(15, 2) DEFAULT 0.00,
    shipping_cost DECIMAL(15, 2) DEFAULT 0.00,
    discount_amount DECIMAL(15, 2) DEFAULT 0.00,
    total_amount DECIMAL(15, 2) DEFAULT 0.00,
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'partial', 'paid')) DEFAULT 'pending',
    payment_method VARCHAR(50),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    approved_by UUID REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, order_number)
);

-- Create indexes for purchase orders
CREATE INDEX idx_po_company ON purchase_orders(company_id);
CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_po_warehouse ON purchase_orders(warehouse_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_date ON purchase_orders(order_date);

-- Purchase Order Items
CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity DECIMAL(15, 3) NOT NULL,
    received_quantity DECIMAL(15, 3) DEFAULT 0.000,
    unit_price DECIMAL(15, 4) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0.00,
    discount_rate DECIMAL(5, 2) DEFAULT 0.00,
    line_total DECIMAL(15, 2) GENERATED ALWAYS AS (
        quantity * unit_price * (1 - discount_rate / 100) * (1 + tax_rate / 100)
    ) STORED,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for purchase order items
CREATE INDEX idx_po_item_order ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_po_item_product ON purchase_order_items(product_id);

-- =====================================================
-- ALERTS & NOTIFICATIONS
-- =====================================================

-- Stock Alerts (low stock, expiration, etc.)
CREATE TABLE stock_alerts (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES inventory_batches(id) ON DELETE CASCADE,
    alert_type VARCHAR(20) CHECK (alert_type IN ('low_stock', 'out_of_stock', 'expiring_soon', 'expired', 'overstock')) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'warning',
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for stock alerts
CREATE INDEX idx_alert_company ON stock_alerts(company_id);
CREATE INDEX idx_alert_product ON stock_alerts(product_id);
CREATE INDEX idx_alert_warehouse ON stock_alerts(warehouse_id);
CREATE INDEX idx_alert_type ON stock_alerts(alert_type);
CREATE INDEX idx_alert_resolved ON stock_alerts(is_resolved);

-- =====================================================
-- AUDIT & HISTORY
-- =====================================================

-- Audit Log - Track all important actions
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    entity_type VARCHAR(100) NOT NULL, -- 'product', 'inventory', 'user', etc.
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', etc.
    old_values JSONB DEFAULT '{}',
    new_values JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for audit logs
CREATE INDEX idx_audit_company ON audit_logs(company_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_date ON audit_logs(created_at);

-- =====================================================
-- SYSTEM TABLES
-- =====================================================

-- System Settings
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for system settings
CREATE INDEX idx_setting_key ON system_settings(setting_key);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all relevant tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_supplier_junction_updated_at BEFORE UPDATE ON product_supplier_junction FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_composition_junction_updated_at BEFORE UPDATE ON product_composition_junction FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_batches_updated_at BEFORE UPDATE ON inventory_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_transfers_updated_at BEFORE UPDATE ON stock_transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_transfer_items_updated_at BEFORE UPDATE ON stock_transfer_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_order_items_updated_at BEFORE UPDATE ON purchase_order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default system permissions
INSERT INTO permissions (name, slug, description, resource, action, is_system_permission) VALUES
-- User management permissions
('Create Users', 'users.create', 'Create new users', 'users', 'create', true),
('Read Users', 'users.read', 'View user information', 'users', 'read', true),
('Update Users', 'users.update', 'Edit user information', 'users', 'update', true),
('Delete Users', 'users.delete', 'Delete users', 'users', 'delete', true),
('Manage Users', 'users.manage', 'Full user management', 'users', 'manage', true),

-- Role management permissions
('Create Roles', 'roles.create', 'Create new roles', 'roles', 'create', true),
('Read Roles', 'roles.read', 'View role information', 'roles', 'read', true),
('Update Roles', 'roles.update', 'Edit role information', 'roles', 'update', true),
('Delete Roles', 'roles.delete', 'Delete roles', 'roles', 'delete', true),
('Manage Roles', 'roles.manage', 'Full role management', 'roles', 'manage', true),

-- Product management permissions
('Create Products', 'products.create', 'Create new products', 'products', 'create', true),
('Read Products', 'products.read', 'View product information', 'products', 'read', true),
('Update Products', 'products.update', 'Edit product information', 'products', 'update', true),
('Delete Products', 'products.delete', 'Delete products', 'products', 'delete', true),
('Manage Products', 'products.manage', 'Full product management', 'products', 'manage', true),

-- Inventory management permissions
('Create Inventory', 'inventory.create', 'Create inventory entries', 'inventory', 'create', true),
('Read Inventory', 'inventory.read', 'View inventory information', 'inventory', 'read', true),
('Update Inventory', 'inventory.update', 'Edit inventory levels', 'inventory', 'update', true),
('Delete Inventory', 'inventory.delete', 'Delete inventory entries', 'inventory', 'delete', true),
('Manage Inventory', 'inventory.manage', 'Full inventory management', 'inventory', 'manage', true),

-- Warehouse management permissions
('Create Warehouses', 'warehouses.create', 'Create new warehouses', 'warehouses', 'create', true),
('Read Warehouses', 'warehouses.read', 'View warehouse information', 'warehouses', 'read', true),
('Update Warehouses', 'warehouses.update', 'Edit warehouse information', 'warehouses', 'update', true),
('Delete Warehouses', 'warehouses.delete', 'Delete warehouses', 'warehouses', 'delete', true),
('Manage Warehouses', 'warehouses.manage', 'Full warehouse management', 'warehouses', 'manage', true),

-- Purchase order permissions
('Create Purchase Orders', 'purchase_orders.create', 'Create purchase orders', 'purchase_orders', 'create', true),
('Read Purchase Orders', 'purchase_orders.read', 'View purchase orders', 'purchase_orders', 'read', true),
('Update Purchase Orders', 'purchase_orders.update', 'Edit purchase orders', 'purchase_orders', 'update', true),
('Delete Purchase Orders', 'purchase_orders.delete', 'Delete purchase orders', 'purchase_orders', 'delete', true),
('Manage Purchase Orders', 'purchase_orders.manage', 'Full purchase order management', 'purchase_orders', 'manage', true),

-- Supplier management permissions
('Create Suppliers', 'suppliers.create', 'Create new suppliers', 'suppliers', 'create', true),
('Read Suppliers', 'suppliers.read', 'View supplier information', 'suppliers', 'read', true),
('Update Suppliers', 'suppliers.update', 'Edit supplier information', 'suppliers', 'update', true),
('Delete Suppliers', 'suppliers.delete', 'Delete suppliers', 'suppliers', 'delete', true),
('Manage Suppliers', 'suppliers.manage', 'Full supplier management', 'suppliers', 'manage', true),

-- Reports permissions
('Create Reports', 'reports.create', 'Create custom reports', 'reports', 'create', true),
('Read Reports', 'reports.read', 'View reports', 'reports', 'read', true),
('Update Reports', 'reports.update', 'Edit reports', 'reports', 'update', true),
('Delete Reports', 'reports.delete', 'Delete reports', 'reports', 'delete', true),
('Manage Reports', 'reports.manage', 'Full report management', 'reports', 'manage', true),

-- Settings permissions
('Read Settings', 'settings.read', 'View system settings', 'settings', 'read', true),
('Update Settings', 'settings.update', 'Edit system settings', 'settings', 'update', true),
('Manage Settings', 'settings.manage', 'Full settings management', 'settings', 'manage', true);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('app_name', 'Stock Management System', 'string', 'Application name', true),
('app_version', '1.0.0', 'string', 'Application version', true),
('default_language', 'es', 'string', 'Default system language', true),
('default_currency', 'USD', 'string', 'Default currency code', true),
('session_timeout', '3600', 'number', 'Session timeout in seconds', false),
('max_login_attempts', '5', 'number', 'Maximum failed login attempts before lock', false),
('password_min_length', '8', 'number', 'Minimum password length', false),
('low_stock_threshold', '10', 'number', 'Default low stock alert threshold', true),
('jwt_access_token_expiry', '900', 'number', 'JWT access token expiry in seconds (15 minutes)', false),
('jwt_refresh_token_expiry', '604800', 'number', 'JWT refresh token expiry in seconds (7 days)', false),
('max_concurrent_sessions', '5', 'number', 'Maximum concurrent sessions per user', false);

-- Create a demo company
INSERT INTO companies (id, name, legal_name, email, phone, industry, company_type, subscription_plan, is_active)
VALUES (
    generate_uuid(),
    'Demo Restaurant Chain',
    'Demo Restaurant Chain LLC',
    'admin@demo-restaurant.com',
    '+1234567890',
    'restaurant',
    'chain',
    'premium',
    true
);

-- Get the demo company ID for subsequent inserts
-- Note: In a real implementation, you would do this in separate transactions or use RETURNING clause

-- For demo purposes, we'll create the structure but actual demo data should be inserted via the application
-- This ensures proper UUID handling and referential integrity

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Current inventory with product details
CREATE VIEW v_inventory_overview AS
SELECT 
    i.id,
    i.company_id,
    c.name AS company_name,
    p.id AS product_id,
    p.sku,
    p.name AS product_name,
    p.barcode,
    cat.name AS category_name,
    u.abbreviation AS unit,
    w.id AS warehouse_id,
    w.name AS warehouse_name,
    w.code AS warehouse_code,
    i.quantity,
    i.reserved_quantity,
    i.available_quantity,
    p.min_stock_level,
    p.reorder_point,
    p.unit_price,
    p.cost_price,
    i.quantity * p.cost_price AS total_value,
    CASE 
        WHEN i.quantity <= 0 THEN 'out_of_stock'
        WHEN i.quantity <= p.min_stock_level THEN 'low_stock'
        WHEN i.quantity <= p.reorder_point THEN 'reorder_needed'
        ELSE 'in_stock'
    END AS stock_status,
    i.last_counted_at,
    i.last_movement_at,
    i.updated_at
FROM inventory i
JOIN companies c ON i.company_id = c.id
JOIN products p ON i.product_id = p.id
JOIN warehouses w ON i.warehouse_id = w.id
JOIN units u ON p.unit_id = u.id
LEFT JOIN categories cat ON p.category_id = cat.id
WHERE c.is_active = true AND p.is_active = true AND w.is_active = true;

-- View: Stock movements with details
CREATE VIEW v_stock_movements_detail AS
SELECT 
    sm.id,
    sm.company_id,
    c.name AS company_name,
    p.sku,
    p.name AS product_name,
    w.name AS warehouse_name,
    sm.movement_type,
    sm.quantity,
    sm.unit_cost,
    sm.total_cost,
    sm.reference_type,
    sm.reference_id,
    CONCAT(u.first_name, ' ', u.last_name) AS performed_by_name,
    sm.performed_at,
    sm.notes
FROM stock_movements sm
JOIN companies c ON sm.company_id = c.id
JOIN products p ON sm.product_id = p.id
JOIN warehouses w ON sm.warehouse_id = w.id
JOIN users u ON sm.performed_by = u.id;

-- View: Products with supplier information
CREATE VIEW v_products_with_suppliers AS
SELECT 
    p.id AS product_id,
    p.company_id,
    p.sku,
    p.name AS product_name,
    p.unit_price,
    p.cost_price,
    COUNT(DISTINCT psj.supplier_id) AS supplier_count,
    STRING_AGG(DISTINCT s.name, ', ') AS suppliers,
    MIN(psj.supplier_price) AS min_supplier_price,
    MAX(psj.supplier_price) AS max_supplier_price
FROM products p
LEFT JOIN product_supplier_junction psj ON p.id = psj.product_id
LEFT JOIN suppliers s ON psj.supplier_id = s.id
WHERE p.is_active = true
GROUP BY p.id, p.company_id, p.sku, p.name, p.unit_price, p.cost_price;

-- View: User permissions (flattened)
CREATE VIEW v_user_permissions AS
SELECT 
    u.id AS user_id,
    u.company_id,
    u.email,
    u.first_name,
    u.last_name,
    r.id AS role_id,
    r.name AS role_name,
    p.id AS permission_id,
    p.name AS permission_name,
    p.slug AS permission_slug,
    p.resource,
    p.action
FROM users u
JOIN user_role_junction urj ON u.id = urj.user_id
JOIN roles r ON urj.role_id = r.id
JOIN role_permission_junction rpj ON r.id = rpj.role_id
JOIN permissions p ON rpj.permission_id = p.id
WHERE u.is_active = true 
  AND r.is_active = true 
  AND urj.is_active = true
  AND (urj.expires_at IS NULL OR urj.expires_at > CURRENT_TIMESTAMP);

COMMIT;
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('app_name', 'Stock Management System', 'string', 'Application name', TRUE),
('app_version', '1.0.0', 'string', 'Application version', TRUE),
('default_language', 'es', 'string', 'Default system language', TRUE),
('default_currency', 'USD', 'string', 'Default currency code', TRUE),
('session_timeout', '3600', 'number', 'Session timeout in seconds', FALSE),
('max_login_attempts', '5', 'number', 'Maximum failed login attempts before lock', FALSE),
('password_min_length', '8', 'number', 'Minimum password length', FALSE),
('low_stock_threshold', '10', 'number', 'Default low stock alert threshold', TRUE);

-- Create a demo company
INSERT INTO companies (id, name, legal_name, email, phone, industry, company_type, subscription_plan, is_active)
VALUES (
    UUID(),
    'Demo Restaurant Chain',
    'Demo Restaurant Chain LLC',
    'admin@demo-restaurant.com',
    '+1234567890',
    'restaurant',
    'chain',
    'premium',
    TRUE
);

-- Get the demo company ID for subsequent inserts
SET @demo_company_id = (SELECT id FROM companies WHERE email = 'admin@demo-restaurant.com' LIMIT 1);

-- Create default units for the demo company
INSERT INTO units (company_id, name, abbreviation, type, is_base_unit, conversion_factor) VALUES
(@demo_company_id, 'Kilogram', 'kg', 'weight', TRUE, 1.000000),
(@demo_company_id, 'Gram', 'g', 'weight', FALSE, 0.001000),
(@demo_company_id, 'Pound', 'lb', 'weight', FALSE, 0.453592),
(@demo_company_id, 'Ounce', 'oz', 'weight', FALSE, 0.028350),
(@demo_company_id, 'Liter', 'L', 'volume', TRUE, 1.000000),
(@demo_company_id, 'Milliliter', 'ml', 'volume', FALSE, 0.001000),
(@demo_company_id, 'Gallon', 'gal', 'volume', FALSE, 3.785412),
(@demo_company_id, 'Unit', 'unit', 'unit', TRUE, 1.000000),
(@demo_company_id, 'Dozen', 'doz', 'unit', FALSE, 12.000000),
(@demo_company_id, 'Case', 'case', 'unit', FALSE, 24.000000);

-- Create default roles
INSERT INTO roles (company_id, name, slug, description, permissions, is_system_role) VALUES
(@demo_company_id, 'Super Admin', 'super_admin', 'Full system access', '["*"]', TRUE),
(@demo_company_id, 'Admin', 'admin', 'Administrative access', '["users.*", "products.*", "inventory.*", "reports.*"]', TRUE),
(@demo_company_id, 'Manager', 'manager', 'Warehouse/Restaurant manager', '["inventory.*", "products.read", "reports.read"]', TRUE),
(@demo_company_id, 'Employee', 'employee', 'Basic employee access', '["inventory.read", "products.read"]', TRUE);

-- Create demo admin user (password: Admin123!)
INSERT INTO users (id, company_id, email, password_hash, first_name, last_name, is_active, is_email_verified)
VALUES (
    UUID(),
    @demo_company_id,
    'admin@demo-restaurant.com',
    '$2b$10$rBV2WVmXCLFZqrZ.OLnWI.eXNqxLWvFMPXZ5McxVZGqKYF8Z/gNGW', -- Admin123!
    'System',
    'Administrator',
    TRUE,
    TRUE
);

-- Assign super admin role to demo user
SET @demo_user_id = (SELECT id FROM users WHERE email = 'admin@demo-restaurant.com' LIMIT 1);
SET @super_admin_role_id = (SELECT id FROM roles WHERE slug = 'super_admin' AND company_id = @demo_company_id LIMIT 1);

INSERT INTO user_role_junction (user_id, role_id, assigned_by)
VALUES (@demo_user_id, @super_admin_role_id, @demo_user_id);

-- Create demo warehouse
INSERT INTO warehouses (company_id, name, code, type, manager_id, city, country, is_active)
VALUES (
    @demo_company_id,
    'Main Warehouse',
    'WH-001',
    'warehouse',
    @demo_user_id,
    'New York',
    'USA',
    TRUE
);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Current inventory with product details
CREATE VIEW v_inventory_overview AS
SELECT 
    i.id,
    i.company_id,
    c.name AS company_name,
    p.id AS product_id,
    p.sku,
    p.name AS product_name,
    p.barcode,
    cat.name AS category_name,
    u.abbreviation AS unit,
    w.id AS warehouse_id,
    w.name AS warehouse_name,
    w.code AS warehouse_code,
    i.quantity,
    i.reserved_quantity,
    i.available_quantity,
    p.min_stock_level,
    p.reorder_point,
    p.unit_price,
    p.cost_price,
    i.quantity * p.cost_price AS total_value,
    CASE 
        WHEN i.quantity <= 0 THEN 'out_of_stock'
        WHEN i.quantity <= p.min_stock_level THEN 'low_stock'
        WHEN i.quantity <= p.reorder_point THEN 'reorder_needed'
        ELSE 'in_stock'
    END AS stock_status,
    i.last_counted_at,
    i.last_movement_at,
    i.updated_at
FROM inventory i
JOIN companies c ON i.company_id = c.id
JOIN products p ON i.product_id = p.id
JOIN warehouses w ON i.warehouse_id = w.id
JOIN units u ON p.unit_id = u.id
LEFT JOIN categories cat ON p.category_id = cat.id
WHERE c.is_active = TRUE AND p.is_active = TRUE AND w.is_active = TRUE;

-- View: Stock movements with details
CREATE VIEW v_stock_movements_detail AS
SELECT 
    sm.id,
    sm.company_id,
    c.name AS company_name,
    p.sku,
    p.name AS product_name,
    w.name AS warehouse_name,
    sm.movement_type,
    sm.quantity,
    sm.unit_cost,
    sm.total_cost,
    sm.reference_type,
    sm.reference_id,
    CONCAT(u.first_name, ' ', u.last_name) AS performed_by_name,
    sm.performed_at,
    sm.notes
FROM stock_movements sm
JOIN companies c ON sm.company_id = c.id
JOIN products p ON sm.product_id = p.id
JOIN warehouses w ON sm.warehouse_id = w.id
JOIN users u ON sm.performed_by = u.id;

-- View: Products with supplier information
CREATE VIEW v_products_with_suppliers AS
SELECT 
    p.id AS product_id,
    p.company_id,
    p.sku,
    p.name AS product_name,
    p.unit_price,
    p.cost_price,
    COUNT(DISTINCT psj.supplier_id) AS supplier_count,
    GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') AS suppliers,
    MIN(psj.supplier_price) AS min_supplier_price,
    MAX(psj.supplier_price) AS max_supplier_price
FROM products p
LEFT JOIN product_supplier_junction psj ON p.id = psj.product_id
LEFT JOIN suppliers s ON psj.supplier_id = s.id
WHERE p.is_active = TRUE
GROUP BY p.id, p.company_id, p.sku, p.name, p.unit_price, p.cost_price;

COMMIT;
