import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper functions
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDecimal(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomElement<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

async function main() {
  console.log('🌱 Starting MASSIVE database seeding...');
  console.log('⚠️  This will create THOUSANDS of records for realistic testing\n');

  const startTime = Date.now();

  // =====================================================
  // 1. CLEAN OLD DATA (EXCEPT PERMISSIONS AND ROLES)
  // =====================================================
  console.log('🗑️  Cleaning old data (preserving permissions only)...');

  await prisma.sessionActivity.deleteMany({});
  await prisma.userSession.deleteMany({});
  await prisma.stockTransferItem.deleteMany({});
  await prisma.stockTransfer.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.purchaseOrderItem.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.inventoryBatch.deleteMany({});
  await prisma.productSupplier.deleteMany({});
  await prisma.productComposition.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.userWarehouse.deleteMany({});
  await prisma.warehouse.deleteMany({});
  await prisma.unit.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.company.deleteMany({});
  
  console.log('✅ Old data cleaned');

  // =====================================================
  // 2. ENSURE PERMISSIONS EXIST
  // =====================================================
  console.log('📋 Ensuring system permissions exist...');

  const permissionsList = [
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

  for (const permission of permissionsList) {
    await prisma.permission.upsert({
      where: { slug: permission.slug },
      update: {},
      create: { ...permission, isSystemPermission: true },
    });
  }

  console.log(`✅ Ensured ${permissionsList.length} permissions exist`);

  // Get all permissions for later use
  const allPermissions = await prisma.permission.findMany();

  // =====================================================
  // 3. CREATE COMPANIES (3 DIFFERENT TYPES)
  // =====================================================
  console.log('🏢 Creating companies...');

  const companies = [];

  const company1 = await prisma.company.create({
    data: {
      name: 'Gourmet Restaurant Chain',
      legalName: 'Gourmet Restaurant Chain LLC',
      taxId: 'RC-123456789',
      email: 'admin@stockhub.com',
      phone: '+1-555-0101',
      industry: 'restaurant',
      companyType: 'chain',
      subscriptionPlan: 'premium',
      isActive: true,
      address: '123 Broadway Ave',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
    },
  });
  companies.push(company1);

  const company2 = await prisma.company.create({
    data: {
      name: 'La Bella Cucina',
      legalName: 'La Bella Cucina Restaurant Inc',
      taxId: 'IR-987654321',
      email: 'admin@labellacucina.com',
      phone: '+1-555-0202',
      industry: 'restaurant',
      companyType: 'independent',
      subscriptionPlan: 'basic',
      isActive: true,
      address: '456 Italian Way',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      postalCode: '90001',
    },
  });
  companies.push(company2);

  const company3 = await prisma.company.create({
    data: {
      name: 'Quick Bites Franchise',
      legalName: 'Quick Bites Franchise Corporation',
      taxId: 'FR-456789123',
      email: 'admin@quickbites.com',
      phone: '+1-555-0303',
      industry: 'restaurant',
      companyType: 'franchise',
      subscriptionPlan: 'enterprise',
      isActive: true,
      address: '789 Fast Food Blvd',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      postalCode: '60601',
    },
  });
  companies.push(company3);

  console.log(`✅ Created ${companies.length} companies`);

  // =====================================================
  // 4. CREATE ROLES FOR EACH COMPANY
  // =====================================================
  console.log('👥 Creating roles for each company...');

  const roleDefinitions = [
    {
      slug: 'super_admin',
      name: 'Super Admin',
      description: 'Full system access',
      permissionSlugs: allPermissions.map(p => p.slug),
    },
    {
      slug: 'admin',
      name: 'Admin',
      description: 'Administrative access',
      permissionSlugs: [
        'users.create', 'users.read', 'users.update', 'users.delete',
        'products.create', 'products.read', 'products.update', 'products.delete',
        'inventory.create', 'inventory.read', 'inventory.update', 'inventory.delete',
        'warehouses.read', 'warehouses.update',
        'purchase_orders.create', 'purchase_orders.read', 'purchase_orders.update',
        'suppliers.create', 'suppliers.read', 'suppliers.update',
        'reports.read', 'reports.create',
      ],
    },
    {
      slug: 'manager',
      name: 'Manager',
      description: 'Warehouse/Restaurant manager',
      permissionSlugs: [
        'products.read', 'products.update',
        'inventory.read', 'inventory.update',
        'warehouses.read',
        'purchase_orders.create', 'purchase_orders.read', 'purchase_orders.update',
        'suppliers.read',
        'reports.read',
      ],
    },
    {
      slug: 'employee',
      name: 'Employee',
      description: 'Basic employee access',
      permissionSlugs: [
        'products.read',
        'inventory.read',
        'warehouses.read',
        'suppliers.read',
      ],
    },
  ];

  const rolesByCompany: Record<string, Record<string, any>> = {};

  for (const company of companies) {
    rolesByCompany[company.id] = {};

    for (const roleDef of roleDefinitions) {
      const role = await prisma.role.create({
        data: {
          companyId: company.id,
          name: roleDef.name,
          slug: roleDef.slug,
          description: roleDef.description,
          isSystemRole: true,
          isActive: true,
        },
      });

      rolesByCompany[company.id][roleDef.slug] = role;

      // Assign permissions to role
      for (const permSlug of roleDef.permissionSlugs) {
        const permission = allPermissions.find(p => p.slug === permSlug);
        if (permission) {
          await prisma.rolePermission.create({
            data: {
              roleId: role.id,
              permissionId: permission.id,
            },
          });
        }
      }
    }
  }

  console.log('✅ Created roles for all companies');

  // Continue in next message due to length...
  console.log('⏳ Seed in progress...');

  // Rest of seed will be in separate file
  await seedCompanyData(companies, rolesByCompany);

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(60));
  console.log('🎉 MASSIVE DATABASE SEED COMPLETED!');
  console.log('='.repeat(60));
  console.log(`⏱️  Total time: ${duration} seconds\n`);
}

// Separate function to continue seeding
async function seedCompanyData(companies: any[], rolesByCompany: Record<string, Record<string, any>>) {
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'William', 'Maria', 'James', 'Jennifer', 'Richard', 'Patricia', 'Carlos', 'Ana', 'Jose', 'Laura', 'Daniel', 'Jessica', 'Christopher', 'Ashley', 'Matthew', 'Michelle', 'Andrew', 'Melissa'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

  // =====================================================
  // 5. CREATE UNITS FOR EACH COMPANY
  // =====================================================
  console.log('📏 Creating units of measurement...');

  const unitsData = [
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

  for (const company of companies) {
    for (const unit of unitsData) {
      await prisma.unit.create({
        data: {
          companyId: company.id,
          name: unit.name,
          abbreviation: unit.abbreviation,
          type: unit.type as any,
          isBaseUnit: unit.isBaseUnit,
          conversionFactor: unit.conversionFactor,
          isActive: true,
        },
      });
    }
  }

  console.log(`✅ Created units for all companies`);

  // =====================================================
  // 6. CREATE USERS (15-20 PER COMPANY)
  // =====================================================
  console.log('👤 Creating users (this may take a moment)...');

  let userCount = 0;
  const usersByCompany: Record<string, any[]> = {};

  for (const company of companies) {
    usersByCompany[company.id] = [];

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        companyId: company.id,
        email: `admin@${company.email.split('@')[1]}`,
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        isEmailVerified: true,
        language: 'es',
        timezone: 'America/New_York',
      },
    });

    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: rolesByCompany[company.id]['super_admin'].id,
        assignedById: adminUser.id,
        isActive: true,
      },
    });

    usersByCompany[company.id].push(adminUser);
    userCount++;

    // Create 15-20 more users
    const numUsers = randomInt(15, 20);
    for (let i = 0; i < numUsers; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${company.email.split('@')[1]}`;

      const user = await prisma.user.create({
        data: {
          companyId: company.id,
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          isActive: randomInt(1, 100) > 10, // 90% active
          isEmailVerified: randomInt(1, 100) > 20, // 80% verified
          language: randomElement(['en', 'es']),
          timezone: randomElement(['America/New_York', 'America/Los_Angeles', 'America/Chicago']),
        },
      });

      // Assign random role
      const roleSlug = randomElement(['admin', 'manager', 'employee', 'employee']); // More employees
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: rolesByCompany[company.id][roleSlug].id,
          assignedById: adminUser.id,
          isActive: true,
        },
      });

      usersByCompany[company.id].push(user);
      userCount++;
    }
  }

  console.log(`✅ Created ${userCount} users across all companies`);

  // =====================================================
  // 7. CREATE WAREHOUSES (5-7 PER COMPANY)
  // =====================================================
  console.log('🏪 Creating warehouses...');

  const warehouseTypes: ('warehouse' | 'restaurant' | 'store' | 'kitchen' | 'other')[] = ['warehouse', 'restaurant', 'store', 'kitchen'];
  const cities = [
    { city: 'New York', state: 'NY', postalCode: '10001' },
    { city: 'Los Angeles', state: 'CA', postalCode: '90001' },
    { city: 'Chicago', state: 'IL', postalCode: '60601' },
    { city: 'Houston', state: 'TX', postalCode: '77001' },
    { city: 'Phoenix', state: 'AZ', postalCode: '85001' },
    { city: 'Philadelphia', state: 'PA', postalCode: '19019' },
    { city: 'Miami', state: 'FL', postalCode: '33101' },
  ];

  let warehouseCount = 0;
  const warehousesByCompany: Record<string, any[]> = {};

  for (const company of companies) {
    warehousesByCompany[company.id] = [];
    const numWarehouses = randomInt(5, 7);

    for (let i = 0; i < numWarehouses; i++) {
      const location = randomElement(cities);
      const manager = randomElement(usersByCompany[company.id]);

      const warehouse = await prisma.warehouse.create({
        data: {
          companyId: company.id,
          name: `${location.city} ${randomElement(['Main', 'Central', 'North', 'South', 'East', 'West'])} ${randomElement(warehouseTypes)}`.toUpperCase(),
          code: `WH-${company.id.substring(0, 4).toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
          type: randomElement(warehouseTypes),
          managerId: manager.id,
          city: location.city,
          state: location.state,
          country: 'USA',
          postalCode: location.postalCode,
          address: `${randomInt(100, 9999)} ${randomElement(['Main', 'Oak', 'Maple', 'Pine', 'Cedar'])} ${randomElement(['St', 'Ave', 'Blvd', 'Way'])}`,
          isActive: true,
        },
      });

      warehousesByCompany[company.id].push(warehouse);
      warehouseCount++;
    }
  }

  console.log(`✅ Created ${warehouseCount} warehouses`);

  // =====================================================
  // 8. CREATE CATEGORIES (10-15 PER COMPANY)
  // =====================================================
  console.log('📦 Creating categories...');

  const categoryNames = [
    'Fresh Vegetables', 'Fresh Fruits', 'Meats & Poultry', 'Seafood', 'Dairy Products',
    'Bakery Items', 'Beverages', 'Dry Goods', 'Canned Goods', 'Frozen Foods',
    'Condiments & Sauces', 'Spices & Seasonings', 'Oils & Vinegars', 'Grains & Pasta',
    'Snacks', 'Desserts', 'Cleaning Supplies', 'Paper Products', 'Kitchen Equipment',
    'Disposables',
  ];

  let categoryCount = 0;
  const categoriesByCompany: Record<string, any[]> = {};

  for (const company of companies) {
    categoriesByCompany[company.id] = [];
    const numCategories = randomInt(10, 15);
    const selectedCategories = categoryNames.slice(0, numCategories);

    for (const catName of selectedCategories) {
      const category = await prisma.category.create({
        data: {
          companyId: company.id,
          name: catName,
          slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: `Category for ${catName.toLowerCase()}`,
          isActive: true,
        },
      });

      categoriesByCompany[company.id].push(category);
      categoryCount++;
    }
  }

  console.log(`✅ Created ${categoryCount} categories`);

  // =====================================================
  // 9. CREATE SUPPLIERS (30-40 PER COMPANY)
  // =====================================================
  console.log('🚚 Creating suppliers...');

  const supplierPrefixes = ['Global', 'Premium', 'Fresh', 'Quality', 'Best', 'Top', 'Elite', 'Prime', 'Supreme', 'Ultimate'];
  const supplierTypes = ['Foods', 'Produce', 'Meats', 'Seafood', 'Dairy', 'Distributors', 'Wholesale', 'Supplies', 'Imports', 'Exports'];

  let supplierCount = 0;
  const suppliersByCompany: Record<string, any[]> = {};

  for (const company of companies) {
    suppliersByCompany[company.id] = [];
    const numSuppliers = randomInt(30, 40);

    for (let i = 0; i < numSuppliers; i++) {
      const supplierName = `${randomElement(supplierPrefixes)} ${randomElement(supplierTypes)} ${randomElement(['Inc', 'LLC', 'Co', 'Corp'])}`;

      const supplier = await prisma.supplier.create({
        data: {
          companyId: company.id,
          name: supplierName,
          email: `contact${i}@${supplierName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          phone: `+1-${randomInt(200, 999)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
          address: `${randomInt(100, 9999)} ${randomElement(['Industrial', 'Commerce', 'Business', 'Trade'])} ${randomElement(['Pkwy', 'Blvd', 'Dr', 'Way'])}`,
          city: randomElement(cities).city,
          state: randomElement(cities).state,
          country: 'USA',
          postalCode: randomElement(cities).postalCode,
          contactPerson: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
          paymentTerms: randomElement(['net15', 'net30', 'net45', 'net60', 'immediate']),
          rating: randomInt(3, 5),
          isActive: randomInt(1, 100) > 5, // 95% active
        },
      });

      suppliersByCompany[company.id].push(supplier);
      supplierCount++;
    }
  }

  console.log(`✅ Created ${supplierCount} suppliers`);

  // =====================================================
  // 10. CREATE PRODUCTS (150-200 PER COMPANY)
  // =====================================================
  console.log('🛍️  Creating products (this will take several minutes)...');

  const productBases = [
    'Tomatoes', 'Lettuce', 'Carrots', 'Onions', 'Potatoes', 'Peppers', 'Cucumbers', 'Broccoli',
    'Apples', 'Oranges', 'Bananas', 'Grapes', 'Strawberries', 'Watermelon', 'Pineapple',
    'Chicken Breast', 'Ground Beef', 'Pork Chops', 'Turkey', 'Salmon', 'Shrimp', 'Tuna',
    'Milk', 'Cheese', 'Butter', 'Yogurt', 'Cream', 'Eggs',
    'Bread', 'Rolls', 'Bagels', 'Muffins', 'Croissants',
    'Rice', 'Pasta', 'Flour', 'Sugar', 'Salt', 'Pepper', 'Olive Oil',
    'Tomato Sauce', 'Ketchup', 'Mustard', 'Mayo', 'BBQ Sauce',
  ];

  let productCount = 0;
  const productsByCompany: Record<string, any[]> = {};

  for (const company of companies) {
    productsByCompany[company.id] = [];
    const numProducts = randomInt(150, 200);
    const units = await prisma.unit.findMany({ where: { companyId: company.id } });

    for (let i = 0; i < numProducts; i++) {
      const category = randomElement(categoriesByCompany[company.id]);
      const unit = randomElement(units);
      const baseName = randomElement(productBases);
      const productName = `${baseName} ${randomElement(['Premium', 'Organic', 'Fresh', 'Grade A', 'Select', ''])}`.trim();
      const costPrice = randomDecimal(1, 50);
      const unitPrice = costPrice * randomDecimal(1.3, 2.5);

      const product = await prisma.product.create({
        data: {
          companyId: company.id,
          categoryId: category.id,
          sku: `SKU-${company.id.substring(0, 4).toUpperCase()}-${String(i + 1).padStart(5, '0')}`,
          name: productName,
          description: `High quality ${productName.toLowerCase()}`,
          unitId: unit.id,
          unitPrice,
          costPrice,
          minStockLevel: randomInt(10, 50),
          maxStockLevel: randomInt(100, 500),
          reorderPoint: randomInt(20, 80),
          isPerishable: randomElement([true, false, false]), // 33% perishable
          shelfLifeDays: randomInt(3, 30),
          isActive: true,
          productType: 'simple',
        },
      });

      productsByCompany[company.id].push(product);
      productCount++;

      // Assign 1-3 suppliers to each product
      const numProductSuppliers = randomInt(1, 3);
      const assignedSuppliers: string[] = [];
      for (let j = 0; j < numProductSuppliers; j++) {
        const supplier = randomElement(suppliersByCompany[company.id]);
        
        // Check if this supplier is already assigned
        if (!assignedSuppliers.includes(supplier.id)) {
          await prisma.productSupplier.create({
            data: {
              productId: product.id,
              supplierId: supplier.id,
              supplierSku: `SUP-${supplier.id.substring(0, 4)}-${String(i + 1).padStart(4, '0')}`,
              supplierPrice: costPrice * randomDecimal(0.9, 1.1),
              leadTimeDays: randomInt(1, 14),
              minimumOrderQuantity: randomDecimal(1, 10, 2),
              isPreferred: j === 0, // First one is preferred
            },
          });
          assignedSuppliers.push(supplier.id);
        }
      }

      // Progress indicator every 100 products
      if (productCount % 100 === 0) {
        console.log(`   ... ${productCount} products created so far`);
      }
    }
  }

  console.log(`✅ Created ${productCount} products with supplier relationships`);

  // =====================================================
  // 11. CREATE INVENTORY (PRODUCTS × WAREHOUSES)
  // =====================================================
  console.log('📊 Creating inventory records (this may take a while)...');

  let inventoryCount = 0;

  for (const company of companies) {
    for (const warehouse of warehousesByCompany[company.id]) {
      for (const product of productsByCompany[company.id]) {
        // Not all products in all warehouses (70% coverage)
        if (randomInt(1, 100) <= 70) {
          await prisma.inventory.create({
            data: {
              companyId: company.id,
              productId: product.id,
              warehouseId: warehouse.id,
              quantity: randomDecimal(10, 500, 2),
              reservedQuantity: randomDecimal(0, 20, 2),
              lastCountedAt: randomDate(new Date('2024-01-01'), new Date()),
            },
          });
          inventoryCount++;

          // Progress indicator every 500 records
          if (inventoryCount % 500 === 0) {
            console.log(`   ... ${inventoryCount} inventory records created so far`);
          }
        }
      }
    }
  }

  console.log(`✅ Created ${inventoryCount} inventory records`);

  // =====================================================
  // 12. CREATE STOCK MOVEMENTS (500-1000 PER COMPANY)
  // =====================================================
  console.log('📈 Creating stock movements...');

  const movementTypes: ('purchase' | 'sale' | 'transfer_in' | 'transfer_out' | 'adjustment_increase' | 'adjustment_decrease' | 'return' | 'damage' | 'expired' | 'production' | 'consumption')[] = ['purchase', 'sale', 'transfer_in', 'transfer_out', 'adjustment_increase', 'adjustment_decrease', 'return', 'damage', 'expired'];
  const movementReasons = [
    'Purchase receipt', 'Sale', 'Stock adjustment', 'Transfer between warehouses',
    'Customer return', 'Damaged goods', 'Expired product', 'Initial stock',
    'Inventory count adjustment', 'Promotional sale', 'Waste', 'Donation',
  ];

  let movementCount = 0;
  const startDate = new Date('2024-01-01');
  const endDate = new Date();

  for (const company of companies) {
    const numMovements = randomInt(500, 1000);

    for (let i = 0; i < numMovements; i++) {
      const warehouse = randomElement(warehousesByCompany[company.id]);
      const product = randomElement(productsByCompany[company.id]);
      const user = randomElement(usersByCompany[company.id]);
      const movementType = randomElement(movementTypes);
      const quantity = randomDecimal(1, 100, 2);

      await prisma.stockMovement.create({
        data: {
          companyId: company.id,
          productId: product.id,
          warehouseId: warehouse.id,
          movementType,
          quantity,
          notes: randomInt(1, 100) > 70 ? `Additional notes for ${movementType} movement` : null,
          performedById: user.id,
          performedAt: randomDate(startDate, endDate),
        },
      });
      movementCount++;

      if (movementCount % 500 === 0) {
        console.log(`   ... ${movementCount} stock movements created so far`);
      }
    }
  }

  console.log(`✅ Created ${movementCount} stock movements`);

  // =====================================================
  // 13. CREATE PURCHASE ORDERS (100-150 PER COMPANY)
  // =====================================================
  console.log('📋 Creating purchase orders...');

  const poStatuses: ('draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled')[] = ['draft', 'pending', 'approved', 'ordered', 'received', 'cancelled'];

  let poCount = 0;
  let poItemCount = 0;

  for (const company of companies) {
    const numOrders = randomInt(100, 150);

    for (let i = 0; i < numOrders; i++) {
      const supplier = randomElement(suppliersByCompany[company.id]);
      const warehouse = randomElement(warehousesByCompany[company.id]);
      const user = randomElement(usersByCompany[company.id]);
      const status = randomElement(poStatuses);
      const orderDate = randomDate(startDate, endDate);

      const po = await prisma.purchaseOrder.create({
        data: {
          companyId: company.id,
          orderNumber: `PO-${company.id.substring(0, 4).toUpperCase()}-${String(i + 1).padStart(5, '0')}`,
          supplierId: supplier.id,
          warehouseId: warehouse.id,
          orderDate,
          expectedDeliveryDate: new Date(orderDate.getTime() + randomInt(3, 21) * 24 * 60 * 60 * 1000),
          status,
          totalAmount: 0, // Will update after items
          notes: randomInt(1, 100) > 60 ? `Order notes for PO #${i + 1}` : null,
          createdById: user.id,
        },
      });

      // Add 3-10 items to each PO
      const numItems = randomInt(3, 10);
      let totalAmount = 0;

      for (let j = 0; j < numItems; j++) {
        const product = randomElement(productsByCompany[company.id]);
        const quantity = randomDecimal(10, 200, 2);
        const unitPrice = product.costPrice * randomDecimal(0.95, 1.05);

        await prisma.purchaseOrderItem.create({
          data: {
            purchaseOrderId: po.id,
            productId: product.id,
            quantity,
            unitPrice,
            receivedQuantity: status === 'received' ? quantity : 0,
          },
        });
        totalAmount += quantity * unitPrice;
        poItemCount++;
      }

      // Update PO with total
      await prisma.purchaseOrder.update({
        where: { id: po.id },
        data: { totalAmount, subtotal: totalAmount },
      });

      poCount++;

      if (poCount % 100 === 0) {
        console.log(`   ... ${poCount} purchase orders created so far`);
      }
    }
  }

  console.log(`✅ Created ${poCount} purchase orders with ${poItemCount} items`);

  // =====================================================
  // 14. CREATE STOCK TRANSFERS (50-100 PER COMPANY)
  // =====================================================
  console.log('🔄 Creating stock transfers...');

  const transferStatuses: ('pending' | 'in_transit' | 'completed' | 'cancelled')[] = ['pending', 'in_transit', 'completed', 'cancelled'];

  let transferCount = 0;
  let transferItemCount = 0;

  for (const company of companies) {
    if (warehousesByCompany[company.id].length < 2) continue; // Need at least 2 warehouses

    const numTransfers = randomInt(50, 100);

    for (let i = 0; i < numTransfers; i++) {
      const warehouses = [...warehousesByCompany[company.id]];
      const fromWarehouse = warehouses[randomInt(0, warehouses.length - 1)];
      const toWarehouseOptions = warehouses.filter(w => w.id !== fromWarehouse.id);
      const toWarehouse = randomElement(toWarehouseOptions);
      const user = randomElement(usersByCompany[company.id]);
      const status = randomElement(transferStatuses);

      const transfer = await prisma.stockTransfer.create({
        data: {
          companyId: company.id,
          transferNumber: `TRF-${company.id.substring(0, 4).toUpperCase()}-${String(i + 1).padStart(5, '0')}`,
          fromWarehouseId: fromWarehouse.id,
          toWarehouseId: toWarehouse.id,
          status,
          requestedById: user.id,
          notes: randomInt(1, 100) > 70 ? `Transfer from ${fromWarehouse.name} to ${toWarehouse.name}` : null,
        },
      });

      // Add 2-8 items to each transfer
      const numItems = randomInt(2, 8);

      for (let j = 0; j < numItems; j++) {
        const product = randomElement(productsByCompany[company.id]);
        const quantity = randomDecimal(5, 100, 2);

        await prisma.stockTransferItem.create({
          data: {
            transferId: transfer.id,
            productId: product.id,
            quantityRequested: quantity,
            quantityShipped: status === 'in_transit' || status === 'completed' ? quantity : null,
            quantityReceived: status === 'completed' ? quantity : null,
          },
        });
        transferItemCount++;
      }

      transferCount++;
    }
  }

  console.log(`✅ Created ${transferCount} stock transfers with ${transferItemCount} items`);

  // =====================================================
  // 15. SUMMARY
  // =====================================================
  console.log('\n📊 DATA SUMMARY:');
  console.log(`   ✅ Companies: ${companies.length}`);
  console.log(`   ✅ Users: ${userCount}`);
  console.log(`   ✅ Warehouses: ${warehouseCount}`);
  console.log(`   ✅ Categories: ${categoryCount}`);
  console.log(`   ✅ Suppliers: ${supplierCount}`);
  console.log(`   ✅ Products: ${productCount}`);
  console.log(`   ✅ Inventory Records: ${inventoryCount}`);
  console.log(`   ✅ Stock Movements: ${movementCount}`);
  console.log(`   ✅ Purchase Orders: ${poCount} (${poItemCount} items)`);
  console.log(`   ✅ Stock Transfers: ${transferCount} (${transferItemCount} items)`);
  
  console.log('\n📝 DEMO CREDENTIALS:');
  console.log('   Email: admin@stockhub.com');
  console.log('   Email: admin@labellacucina.com');
  console.log('   Email: admin@quickbites.com');
  console.log('   Password: Admin123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
