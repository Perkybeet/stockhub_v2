# =========================================
# Stock Management Database Setup Script
# =========================================

Write-Host "🚀 Starting database setup..." -ForegroundColor Cyan
Write-Host ""

# Configuration
$DB_HOST = "localhost"
$DB_PORT = "5433"
$DB_NAME = "stock_management_db"
$DB_USER = "postgres"
$DB_PASSWORD = Read-Host -Prompt "Enter PostgreSQL password for user '$DB_USER'" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD)
$PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Set environment variable for PostgreSQL password
$env:PGPASSWORD = $PlainPassword

Write-Host "📋 Step 1: Checking PostgreSQL connection..." -ForegroundColor Yellow

# Try to connect to PostgreSQL
try {
    $null = & psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d postgres -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL connection successful!" -ForegroundColor Green
    } else {
        throw "Connection failed"
    }
} catch {
    Write-Host "❌ Cannot connect to PostgreSQL. Please check:" -ForegroundColor Red
    Write-Host "   - PostgreSQL is running on port $DB_PORT" -ForegroundColor Red
    Write-Host "   - Username and password are correct" -ForegroundColor Red
    Write-Host "   - psql command is available in PATH" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Step 2: Creating database..." -ForegroundColor Yellow

# Check if database exists
$dbExists = & psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';" 2>&1

if ($dbExists -eq "1") {
    Write-Host "⚠️  Database '$DB_NAME' already exists" -ForegroundColor Yellow
    $response = Read-Host -Prompt "Do you want to drop and recreate it? (yes/no)"
    
    if ($response -eq "yes") {
        Write-Host "   Dropping existing database..." -ForegroundColor Yellow
        & psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d postgres -c "DROP DATABASE $DB_NAME;" 2>&1 | Out-Null
        Write-Host "   Creating new database..." -ForegroundColor Yellow
        & psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d postgres -c "CREATE DATABASE $DB_NAME;" 2>&1 | Out-Null
        Write-Host "✅ Database recreated successfully!" -ForegroundColor Green
    } else {
        Write-Host "   Using existing database..." -ForegroundColor Yellow
    }
} else {
    & psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d postgres -c "CREATE DATABASE $DB_NAME;" 2>&1 | Out-Null
    Write-Host "✅ Database created successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "📝 Step 3: Updating .env file..." -ForegroundColor Yellow

# Update or create .env file
$envContent = @"
# Database Configuration
DATABASE_URL="postgresql://${DB_USER}:${PlainPassword}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

# Application Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Session Configuration
SESSION_SECRET=your_super_secret_session_key_here_change_in_production
SESSION_TIMEOUT=3600

# Security Configuration
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=300

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourdomain.com

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf

# API Configuration
API_PREFIX=api/v1
SWAGGER_PATH=api/docs

# Monitoring and Logging
LOG_LEVEL=debug
LOG_FILE=logs/app.log
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8 -Force
Write-Host "✅ .env file updated!" -ForegroundColor Green

Write-Host ""
Write-Host "🔧 Step 4: Generating Prisma Client..." -ForegroundColor Yellow

npm run prisma:generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma Client generated!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🗂️  Step 5: Pushing Prisma schema to database..." -ForegroundColor Yellow

npm run prisma:push --accept-data-loss
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Schema synchronized!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to push schema" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🌱 Step 6: Seeding database with initial data..." -ForegroundColor Yellow

npm run prisma:seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database seeded successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to seed database" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 Database setup completed successfully!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Demo Credentials:" -ForegroundColor Yellow
Write-Host "   Email:    admin@demo-restaurant.com" -ForegroundColor White
Write-Host "   Password: Admin123!" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Start the backend:  npm run start:dev" -ForegroundColor White
Write-Host "   2. Start the frontend: cd ../frontend && npm run dev" -ForegroundColor White
Write-Host "   3. Open Prisma Studio: npm run prisma:studio" -ForegroundColor White
Write-Host "   4. View API docs:      http://localhost:3001/api/docs" -ForegroundColor White
Write-Host ""

# Clear password from environment
$env:PGPASSWORD = $null
