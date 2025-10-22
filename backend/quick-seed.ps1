# =========================================
# Quick Database Reset & Seed Script
# =========================================

Write-Host "🔄 Quick database reset and seed..." -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "   Please run setup-database.ps1 first or create .env manually" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔧 Step 1: Generating Prisma Client..." -ForegroundColor Yellow
npm run prisma:generate | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma Client generated!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🗂️  Step 2: Resetting database schema..." -ForegroundColor Yellow

$response = Read-Host -Prompt "This will delete all data. Continue? (yes/no)"

if ($response -ne "yes") {
    Write-Host "❌ Operation cancelled" -ForegroundColor Yellow
    exit 0
}

npm run prisma:push --force-reset --accept-data-loss

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Schema reset complete!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to reset schema" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🌱 Step 3: Seeding database..." -ForegroundColor Yellow

npm run prisma:seed

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database seeded successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to seed database" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✨ Database reset and seed completed!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Demo Credentials:" -ForegroundColor Yellow
Write-Host "   Email:    admin@demo-restaurant.com" -ForegroundColor White
Write-Host "   Password: Admin123!" -ForegroundColor White
Write-Host ""
