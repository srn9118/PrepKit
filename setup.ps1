# PrepKit Backend - Setup Script (PowerShell)

Write-Host "🚀 Setting up PrepKit Backend..." -ForegroundColor Green

# Step 1: Create .env file if it doesn't exist
if (-not (Test-Path "backend\.env")) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env"
    
    # Generate SECRET_KEY (basic random hex - user should replace with proper key)
    Write-Host "🔐 Please generate a SECRET_KEY using:" -ForegroundColor Yellow
    Write-Host "   openssl rand -hex 32" -ForegroundColor Cyan
    Write-Host "   And replace it in backend\.env" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Step 2: Build and start Docker containers
Write-Host "🐳 Building Docker containers..." -ForegroundColor Yellow
docker-compose build

Write-Host "🚀 Starting services..." -ForegroundColor Yellow
docker-compose up -d

# Step 3: Wait for PostgreSQL to be healthy
Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Step 4: Run migrations
Write-Host "📊 Running database migrations..." -ForegroundColor Yellow
docker-compose exec backend alembic revision --autogenerate -m "Initial migration - users table"
docker-compose exec backend alembic upgrade head

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Access the API documentation:" -ForegroundColor Cyan
Write-Host "   - Swagger UI: http://localhost:8000/api/docs"
Write-Host "   - ReDoc: http://localhost:8000/api/redoc"
Write-Host ""
Write-Host "🧪 Run tests:" -ForegroundColor Cyan
Write-Host "   docker-compose exec backend pytest -v"
Write-Host ""
Write-Host "📝 View logs:" -ForegroundColor Cyan
Write-Host "   docker-compose logs -f backend"
