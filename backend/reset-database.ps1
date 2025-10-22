# =========================================
# Complete Database Reset Script
# =========================================

Write-Host "Starting complete database reset..." -ForegroundColor Cyan
Write-Host ""

# Configuration from .env
$envFile = Get-Content ".env" -Raw
if ($envFile -match 'DATABASE_URL="postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/([^?]+)') {
    $DB_USER = $matches[1]
    $DB_PASS = $matches[2]
    $DB_HOST = $matches[3]
    $DB_PORT = $matches[4]
    $DB_NAME = $matches[5]
    
    Write-Host "Database Configuration:" -ForegroundColor Yellow
    Write-Host "   Host: $DB_HOST" -ForegroundColor White
    Write-Host "   Port: $DB_PORT" -ForegroundColor White
    Write-Host "   Database: $DB_NAME" -ForegroundColor White
    Write-Host "   User: $DB_USER" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "ERROR: Could not parse DATABASE_URL from .env" -ForegroundColor Red
    exit 1
}

# Set PostgreSQL password environment variable
$env:PGPASSWORD = $DB_PASS

Write-Host "Step 1: Dropping all existing objects..." -ForegroundColor Yellow

# Try to find psql
$psqlPath = $null
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        break
    }
}

if ($psqlPath) {
    Write-Host "   Found psql at: $psqlPath" -ForegroundColor Green
    & $psqlPath -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -f "prisma\drop-all.sql" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: All existing objects dropped!" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Could not drop some objects (may not exist)" -ForegroundColor Yellow
    }
} else {
    Write-Host "WARNING: psql not found in common locations, skipping drop step" -ForegroundColor Yellow
    Write-Host "   Proceeding with Prisma push (may fail if conflicts exist)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Pushing Prisma schema..." -ForegroundColor Yellow

# Force reset and push schema
$output = npx prisma db push --force-reset --accept-data-loss 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Schema pushed successfully!" -ForegroundColor Green
} else {
    Write-Host "ERROR: Failed to push schema" -ForegroundColor Red
    Write-Host $output
    exit 1
}

Write-Host ""
Write-Host "Step 3: Seeding database..." -ForegroundColor Yellow

npm run prisma:seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Database seeded successfully!" -ForegroundColor Green
} else {
    Write-Host "ERROR: Failed to seed database" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUCCESS: Database reset completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor Yellow
Write-Host "   Email:    admin@demo-restaurant.com" -ForegroundColor White
Write-Host "   Password: Admin123!" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "   1. Start backend:  npm run start:dev" -ForegroundColor White
Write-Host "   2. Open API docs:  http://localhost:3001/api/docs" -ForegroundColor White
Write-Host "   3. View data:      npm run prisma:studio" -ForegroundColor White
Write-Host ""

# Clear password
$env:PGPASSWORD = $null
