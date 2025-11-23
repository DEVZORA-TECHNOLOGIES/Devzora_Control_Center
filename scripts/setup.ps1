# Devzora Control Center Setup Script
Write-Host "🚀 Setting up Devzora Control Center..." -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "`n📦 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check if PostgreSQL is available
Write-Host "`n🗄️  Checking PostgreSQL connection..." -ForegroundColor Yellow
Write-Host "⚠️  Please ensure PostgreSQL is running and create a database named 'devzora_int_tracker'" -ForegroundColor Yellow

# Install root dependencies
Write-Host "`n📦 Installing root dependencies..." -ForegroundColor Yellow
npm install

# Install backend dependencies
Write-Host "`n📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

# Install frontend dependencies
Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

# Setup environment files
Write-Host "`n⚙️  Setting up environment files..." -ForegroundColor Yellow

if (-Not (Test-Path "backend\.env")) {
    Copy-Item "backend\env.example" "backend\.env"
    Write-Host "✅ Created backend/.env - Please update with your database credentials" -ForegroundColor Green
} else {
    Write-Host "ℹ️  backend/.env already exists" -ForegroundColor Blue
}

if (-Not (Test-Path "frontend\.env")) {
    Copy-Item "frontend\env.example" "frontend\.env"
    Write-Host "✅ Created frontend/.env" -ForegroundColor Green
} else {
    Write-Host "ℹ️  frontend/.env already exists" -ForegroundColor Blue
}

# Database setup
Write-Host "`n🗄️  Setting up database..." -ForegroundColor Yellow
Set-Location backend

Write-Host "Running Prisma migrations..." -ForegroundColor Yellow
npx prisma migrate dev --name init

Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "Seeding database..." -ForegroundColor Yellow
npm run db:seed

Set-Location ..

Write-Host "`n✅ Setup completed!" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update backend/.env with your PostgreSQL connection string" -ForegroundColor White
Write-Host "2. Run 'npm run dev' from the root directory to start both servers" -ForegroundColor White
Write-Host "3. Or run 'npm run dev:backend' and 'npm run dev:frontend' separately" -ForegroundColor White
Write-Host "`n🌐 Default credentials:" -ForegroundColor Cyan
Write-Host "   Email: admin@devzora.com" -ForegroundColor White
Write-Host "   Password: password" -ForegroundColor White


