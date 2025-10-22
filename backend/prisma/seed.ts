import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // =====================================================
  // 1. SYSTEM PERMISSIONS
  // =====================================================
  console.log('📋 Creating system permissions...');

  const permissions = [
    // User management
    { name: 'Create Users', slug: 'users.create', description: 'Create new users', resource: 'users', action: 'create' },
    { name: 'Read Users', slug: 'users.read', description: 'View user information', resource: 'users', action: 'read' },
    { name: 'Update Users', slug: 'users.update', description: 'Edit user information', resource: 'users', action: 'update' },
    { name: 'Delete Users', slug: 'users.delete', description: 'Delete users', resource: 'users', action: 'delete' },
    { name: 'Manage Users', slug: 'users.manage', description: 'Full user management', resource: 'users', action: 'manage' },

    // Role management
    { name: 'Create Roles', slug: 'roles.create', description: 'Create new roles', resource: 'roles', action: 'create' },
    { name: 'Read Roles', slug: 'roles.read', description: 'View role information', resource: 'roles', action: 'read' },
    { name: 'Update Roles', slug: 'roles.update', description: 'Edit role information', resource: 'roles', action: 'update' },
    { name: 'Delete Roles', slug: 'roles.delete', description: 'Delete roles', resource: 'roles', action: 'delete' },
    { name: 'Manage Roles', slug: 'roles.manage', description: 'Full role management', resource: 'roles', action: 'manage' },

    // Product management
    { name: 'Create Products', slug: 'products.create', description: 'Create new products', resource: 'products', action: 'create' },
    { name: 'Read Products', slug: 'products.read', description: 'View product information', resource: 'products', action: 'read' },
    { name: 'Update Products', slug: 'products.update', description: 'Edit product information', resource: 'products', action: 'update' },
    { name: 'Delete Products', slug: 'products.delete', description: 'Delete products', resource: 'products', action: 'delete' },
    { name: 'Manage Products', slug: 'products.manage', description: 'Full product management', resource: 'products', action: 'manage' },

    // Inventory management
    { name: 'Create Inventory', slug: 'inventory.create', description: 'Create inventory entries', resource: 'inventory', action: 'create' },
    { name: 'Read Inventory', slug: 'inventory.read', description: 'View inventory information', resource: 'inventory', action: 'read' },
    { name: 'Update Inventory', slug: 'inventory.update', description: 'Edit inventory levels', resource: 'inventory', action: 'update' },
    { name: 'Delete Inventory', slug: 'inventory.delete', description: 'Delete inventory entries', resource: 'inventory', action: 'delete' },
    { name: 'Manage Inventory', slug: 'inventory.manage', description: 'Full inventory management', resource: 'inventory', action: 'manage' },

    // Warehouse management
    { name: 'Create Warehouses', slug: 'warehouses.create', description: 'Create new warehouses', resource: 'warehouses', action: 'create' },
    { name: 'Read Warehouses', slug: 'warehouses.read', description: 'View warehouse information', resource: 'warehouses', action: 'read' },
    { name: 'Update Warehouses', slug: 'warehouses.update', description: 'Edit warehouse information', resource: 'warehouses', action: 'update' },
    { name: 'Delete Warehouses', slug: 'warehouses.delete', description: 'Delete warehouses', resource: 'warehouses', action: 'delete' },
    { name: 'Manage Warehouses', slug: 'warehouses.manage', description: 'Full warehouse management', resource: 'warehouses', action: 'manage' },

    // Purchase orders
    { name: 'Create Purchase Orders', slug: 'purchase_orders.create', description: 'Create purchase orders', resource: 'purchase_orders', action: 'create' },
    { name: 'Read Purchase Orders', slug: 'purchase_orders.read', description: 'View purchase orders', resource: 'purchase_orders', action: 'read' },
    { name: 'Update Purchase Orders', slug: 'purchase_orders.update', description: 'Edit purchase orders', resource: 'purchase_orders', action: 'update' },
    { name: 'Delete Purchase Orders', slug: 'purchase_orders.delete', description: 'Delete purchase orders', resource: 'purchase_orders', action: 'delete' },
    { name: 'Manage Purchase Orders', slug: 'purchase_orders.manage', description: 'Full purchase order management', resource: 'purchase_orders', action: 'manage' },

    // Suppliers
    { name: 'Create Suppliers', slug: 'suppliers.create', description: 'Create new suppliers', resource: 'suppliers', action: 'create' },
    { name: 'Read Suppliers', slug: 'suppliers.read', description: 'View supplier information', resource: 'suppliers', action: 'read' },
    { name: 'Update Suppliers', slug: 'suppliers.update', description: 'Edit supplier information', resource: 'suppliers', action: 'update' },
    { name: 'Delete Suppliers', slug: 'suppliers.delete', description: 'Delete suppliers', resource: 'suppliers', action: 'delete' },
    { name: 'Manage Suppliers', slug: 'suppliers.manage', description: 'Full supplier management', resource: 'suppliers', action: 'manage' },

    // Reports
    { name: 'Create Reports', slug: 'reports.create', description: 'Create custom reports', resource: 'reports', action: 'create' },
    { name: 'Read Reports', slug: 'reports.read', description: 'View reports', resource: 'reports', action: 'read' },
    { name: 'Update Reports', slug: 'reports.update', description: 'Edit reports', resource: 'reports', action: 'update' },
    { name: 'Delete Reports', slug: 'reports.delete', description: 'Delete reports', resource: 'reports', action: 'delete' },
    { name: 'Manage Reports', slug: 'reports.manage', description: 'Full report management', resource: 'reports', action: 'manage' },

    // Settings
    { name: 'Read Settings', slug: 'settings.read', description: 'View system settings', resource: 'settings', action: 'read' },
    { name: 'Update Settings', slug: 'settings.update', description: 'Edit system settings', resource: 'settings', action: 'update' },
    { name: 'Manage Settings', slug: 'settings.manage', description: 'Full settings management', resource: 'settings', action: 'manage' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { slug: permission.slug },
      update: {},
      create: {
        ...permission,
        isSystemPermission: true,
      },
    });
  }

  console.log(`✅ Created ${permissions.length} permissions`);

  // =====================================================
  // 2. DEMO COMPANY
  // =====================================================
  console.log('🏢 Creating demo company...');

  const demoCompany = await prisma.company.upsert({
    where: { taxId: 'DEMO-123456789' },
    update: {},
    create: {
      name: 'Demo Restaurant Chain',
      legalName: 'Demo Restaurant Chain LLC',
      taxId: 'DEMO-123456789',
      email: 'admin@demo-restaurant.com',
      phone: '+1234567890',
      industry: 'restaurant',
      companyType: 'chain',
      subscriptionPlan: 'premium',
      isActive: true,
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
    },
  });

  console.log(`✅ Created company: ${demoCompany.name}`);

  // =====================================================
  // 3. UNITS OF MEASUREMENT
  // =====================================================
  console.log('📏 Creating units of measurement...');

  const units = [
    { name: 'Kilogram', abbreviation: 'kg', type: 'weight', isBaseUnit: true, conversionFactor: 1.0 },
    { name: 'Gram', abbreviation: 'g', type: 'weight', isBaseUnit: false, conversionFactor: 0.001 },
    { name: 'Pound', abbreviation: 'lb', type: 'weight', isBaseUnit: false, conversionFactor: 0.453592 },
    { name: 'Ounce', abbreviation: 'oz', type: 'weight', isBaseUnit: false, conversionFactor: 0.02835 },
    { name: 'Liter', abbreviation: 'L', type: 'volume', isBaseUnit: true, conversionFactor: 1.0 },
    { name: 'Milliliter', abbreviation: 'ml', type: 'volume', isBaseUnit: false, conversionFactor: 0.001 },
    { name: 'Gallon', abbreviation: 'gal', type: 'volume', isBaseUnit: false, conversionFactor: 3.785412 },
    { name: 'Unit', abbreviation: 'unit', type: 'unit', isBaseUnit: true, conversionFactor: 1.0 },
    { name: 'Dozen', abbreviation: 'doz', type: 'unit', isBaseUnit: false, conversionFactor: 12.0 },
    { name: 'Case', abbreviation: 'case', type: 'unit', isBaseUnit: false, conversionFactor: 24.0 },
  ];

  for (const unit of units) {
    await prisma.unit.upsert({
      where: {
        companyId_abbreviation: {
          companyId: demoCompany.id,
          abbreviation: unit.abbreviation,
        },
      },
      update: {},
      create: {
        companyId: demoCompany.id,
        name: unit.name,
        abbreviation: unit.abbreviation,
        type: unit.type as any,
        isBaseUnit: unit.isBaseUnit,
        conversionFactor: unit.conversionFactor,
        isActive: true,
      },
    });
  }

  console.log(`✅ Created ${units.length} units`);

  // =====================================================
  // 4. ROLES
  // =====================================================
  console.log('👥 Creating roles...');

  // Get all permissions for Super Admin
  const allPermissions = await prisma.permission.findMany();

  // Super Admin Role
  const superAdminRole = await prisma.role.upsert({
    where: {
      companyId_slug: {
        companyId: demoCompany.id,
        slug: 'super_admin',
      },
    },
    update: {},
    create: {
      companyId: demoCompany.id,
      name: 'Super Admin',
      slug: 'super_admin',
      description: 'Full system access',
      isSystemRole: true,
      isActive: true,
    },
  });

  // Assign all permissions to Super Admin
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Admin Role
  const adminPermissionSlugs = [
    'users.create', 'users.read', 'users.update', 'users.delete',
    'products.create', 'products.read', 'products.update', 'products.delete',
    'inventory.create', 'inventory.read', 'inventory.update', 'inventory.delete',
    'warehouses.read', 'warehouses.update',
    'purchase_orders.create', 'purchase_orders.read', 'purchase_orders.update',
    'suppliers.create', 'suppliers.read', 'suppliers.update',
    'reports.read', 'reports.create',
  ];

  const adminRole = await prisma.role.upsert({
    where: {
      companyId_slug: {
        companyId: demoCompany.id,
        slug: 'admin',
      },
    },
    update: {},
    create: {
      companyId: demoCompany.id,
      name: 'Admin',
      slug: 'admin',
      description: 'Administrative access',
      isSystemRole: true,
      isActive: true,
    },
  });

  for (const slug of adminPermissionSlugs) {
    const permission = await prisma.permission.findUnique({ where: { slug } });
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Manager Role
  const managerPermissionSlugs = [
    'products.read', 'products.update',
    'inventory.read', 'inventory.update',
    'warehouses.read',
    'purchase_orders.create', 'purchase_orders.read', 'purchase_orders.update',
    'suppliers.read',
    'reports.read',
  ];

  const managerRole = await prisma.role.upsert({
    where: {
      companyId_slug: {
        companyId: demoCompany.id,
        slug: 'manager',
      },
    },
    update: {},
    create: {
      companyId: demoCompany.id,
      name: 'Manager',
      slug: 'manager',
      description: 'Warehouse/Restaurant manager',
      isSystemRole: true,
      isActive: true,
    },
  });

  for (const slug of managerPermissionSlugs) {
    const permission = await prisma.permission.findUnique({ where: { slug } });
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: managerRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: managerRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Employee Role
  const employeePermissionSlugs = [
    'products.read',
    'inventory.read',
    'warehouses.read',
    'suppliers.read',
  ];

  const employeeRole = await prisma.role.upsert({
    where: {
      companyId_slug: {
        companyId: demoCompany.id,
        slug: 'employee',
      },
    },
    update: {},
    create: {
      companyId: demoCompany.id,
      name: 'Employee',
      slug: 'employee',
      description: 'Basic employee access',
      isSystemRole: true,
      isActive: true,
    },
  });

  for (const slug of employeePermissionSlugs) {
    const permission = await prisma.permission.findUnique({ where: { slug } });
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: employeeRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: employeeRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log('✅ Created 4 roles with permissions');

  // =====================================================
  // 5. DEMO ADMIN USER
  // =====================================================
  console.log('👤 Creating demo admin user...');

  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  const adminUser = await prisma.user.upsert({
    where: {
      companyId_email: {
        companyId: demoCompany.id,
        email: 'admin@demo-restaurant.com',
      },
    },
    update: {},
    create: {
      companyId: demoCompany.id,
      email: 'admin@demo-restaurant.com',
      passwordHash: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      isActive: true,
      isEmailVerified: true,
      language: 'es',
      timezone: 'America/New_York',
    },
  });

  // Assign Super Admin role to admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
      assignedById: adminUser.id,
      isActive: true,
    },
  });

  console.log(`✅ Created admin user: ${adminUser.email} (Password: Admin123!)`);

  // =====================================================
  // 6. DEMO WAREHOUSE
  // =====================================================
  console.log('🏪 Creating demo warehouse...');

  const mainWarehouse = await prisma.warehouse.upsert({
    where: {
      companyId_code: {
        companyId: demoCompany.id,
        code: 'WH-001',
      },
    },
    update: {},
    create: {
      companyId: demoCompany.id,
      name: 'Main Warehouse',
      code: 'WH-001',
      type: 'warehouse',
      managerId: adminUser.id,
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
      address: '123 Main Street',
      isActive: true,
    },
  });

  console.log(`✅ Created warehouse: ${mainWarehouse.name}`);

  // =====================================================
  // 7. DEMO CATEGORIES
  // =====================================================
  console.log('📦 Creating demo categories...');

  const categories = [
    { name: 'Vegetables', slug: 'vegetables', description: 'Fresh vegetables' },
    { name: 'Fruits', slug: 'fruits', description: 'Fresh fruits' },
    { name: 'Meats', slug: 'meats', description: 'Fresh meats and poultry' },
    { name: 'Dairy', slug: 'dairy', description: 'Dairy products' },
    { name: 'Beverages', slug: 'beverages', description: 'Drinks and beverages' },
    { name: 'Dry Goods', slug: 'dry-goods', description: 'Non-perishable items' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        companyId_slug: {
          companyId: demoCompany.id,
          slug: category.slug,
        },
      },
      update: {},
      create: {
        companyId: demoCompany.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        isActive: true,
      },
    });
  }

  console.log(`✅ Created ${categories.length} categories`);

  // =====================================================
  // 8. DEMO SUPPLIERS
  // =====================================================
  console.log('🚚 Creating demo suppliers...');

  const suppliers = [
    {
      name: 'Fresh Produce Co.',
      email: 'orders@freshproduce.com',
      phone: '+1234567891',
      paymentTerms: 'net30',
      rating: 5,
    },
    {
      name: 'Premium Meats Ltd.',
      email: 'sales@premiummeats.com',
      phone: '+1234567892',
      paymentTerms: 'net30',
      rating: 4,
    },
    {
      name: 'Dairy Distributors Inc.',
      email: 'info@dairydist.com',
      phone: '+1234567893',
      paymentTerms: 'net15',
      rating: 5,
    },
  ];

  const createdSuppliers = [];
  for (const supplier of suppliers) {
    const created = await prisma.supplier.create({
      data: {
        companyId: demoCompany.id,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        paymentTerms: supplier.paymentTerms,
        rating: supplier.rating,
        isActive: true,
      },
    });
    createdSuppliers.push(created);
  }

  console.log(`✅ Created ${suppliers.length} suppliers`);

  // =====================================================
  // 9. DEMO PRODUCTS
  // =====================================================
  console.log('🛍️ Creating demo products...');

  const unitKg = await prisma.unit.findFirst({
    where: { companyId: demoCompany.id, abbreviation: 'kg' },
  });

  const unitL = await prisma.unit.findFirst({
    where: { companyId: demoCompany.id, abbreviation: 'L' },
  });

  const unitUnit = await prisma.unit.findFirst({
    where: { companyId: demoCompany.id, abbreviation: 'unit' },
  });

  const vegetablesCategory = await prisma.category.findFirst({
    where: { companyId: demoCompany.id, slug: 'vegetables' },
  });

  const meatsCategory = await prisma.category.findFirst({
    where: { companyId: demoCompany.id, slug: 'meats' },
  });

  const dairyCategory = await prisma.category.findFirst({
    where: { companyId: demoCompany.id, slug: 'dairy' },
  });

  const products = [
    {
      sku: 'VEG-001',
      name: 'Tomatoes',
      categoryId: vegetablesCategory?.id,
      unitId: unitKg?.id,
      unitPrice: 3.50,
      costPrice: 2.00,
      minStockLevel: 10,
      reorderPoint: 15,
      isPerishable: true,
      shelfLifeDays: 7,
    },
    {
      sku: 'VEG-002',
      name: 'Lettuce',
      categoryId: vegetablesCategory?.id,
      unitId: unitKg?.id,
      unitPrice: 2.50,
      costPrice: 1.50,
      minStockLevel: 5,
      reorderPoint: 10,
      isPerishable: true,
      shelfLifeDays: 5,
    },
    {
      sku: 'MEAT-001',
      name: 'Chicken Breast',
      categoryId: meatsCategory?.id,
      unitId: unitKg?.id,
      unitPrice: 12.00,
      costPrice: 8.00,
      minStockLevel: 20,
      reorderPoint: 30,
      isPerishable: true,
      shelfLifeDays: 3,
    },
    {
      sku: 'DAIRY-001',
      name: 'Milk',
      categoryId: dairyCategory?.id,
      unitId: unitL?.id,
      unitPrice: 2.00,
      costPrice: 1.20,
      minStockLevel: 50,
      reorderPoint: 75,
      isPerishable: true,
      shelfLifeDays: 14,
    },
  ];

  for (const product of products) {
    if (product.unitId && product.categoryId) {
      await prisma.product.upsert({
        where: {
          companyId_sku: {
            companyId: demoCompany.id,
            sku: product.sku,
          },
        },
        update: {},
        create: {
          companyId: demoCompany.id,
          categoryId: product.categoryId,
          sku: product.sku,
          name: product.name,
          unitId: product.unitId,
          unitPrice: product.unitPrice,
          costPrice: product.costPrice,
          minStockLevel: product.minStockLevel,
          reorderPoint: product.reorderPoint,
          isPerishable: product.isPerishable,
          shelfLifeDays: product.shelfLifeDays,
          isActive: true,
          productType: 'simple',
        },
      });
    }
  }

  console.log(`✅ Created ${products.length} products`);

  // =====================================================
  // 10. DEMO INVENTORY
  // =====================================================
  console.log('📊 Creating demo inventory...');

  const allProducts = await prisma.product.findMany({
    where: { companyId: demoCompany.id },
  });

  for (const product of allProducts) {
    await prisma.inventory.upsert({
      where: {
        productId_warehouseId: {
          productId: product.id,
          warehouseId: mainWarehouse.id,
        },
      },
      update: {},
      create: {
        companyId: demoCompany.id,
        productId: product.id,
        warehouseId: mainWarehouse.id,
        quantity: Math.floor(Math.random() * 100) + 50, // Random quantity between 50-150
        reservedQuantity: 0,
      },
    });
  }

  console.log(`✅ Created inventory for ${allProducts.length} products`);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Demo Credentials:');
  console.log('   Email: admin@demo-restaurant.com');
  console.log('   Password: Admin123!');
  console.log('\n✨ You can now start the application and login with these credentials.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
