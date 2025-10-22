import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

async function resetDatabase() {
  console.log('🔄 Starting database reset...\n');

  // Read DATABASE_URL from .env
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const dbUrlMatch = envContent.match(/DATABASE_URL="(.+?)"/);
  
  if (!dbUrlMatch) {
    console.error('❌ DATABASE_URL not found in .env file');
    process.exit(1);
  }

  const databaseUrl = dbUrlMatch[1];
  console.log('📋 Database URL found');

  // Create PostgreSQL client
  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Read and execute drop script
    console.log('🗑️  Dropping existing tables and views...');
    const dropScript = fs.readFileSync(
      path.join(__dirname, 'drop-all.sql'),
      'utf-8'
    );
    
    await client.query(dropScript);
    console.log('✅ All existing objects dropped!\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }

  // Now run Prisma push
  console.log('🔧 Pushing Prisma schema to database...');
  try {
    execSync('npx prisma db push --accept-data-loss --skip-generate', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    console.log('✅ Schema pushed successfully!\n');
  } catch (error) {
    console.error('❌ Error pushing schema');
    process.exit(1);
  }

  // Run seed
  console.log('🌱 Seeding database...');
  try {
    execSync('npm run prisma:seed', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    console.log('\n✅ Database seeded successfully!\n');
  } catch (error) {
    console.error('❌ Error seeding database');
    process.exit(1);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Database reset completed successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📝 Demo Credentials:');
  console.log('   Email:    admin@demo-restaurant.com');
  console.log('   Password: Admin123!\n');
}

resetDatabase();
