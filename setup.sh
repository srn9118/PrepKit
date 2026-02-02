#!/bin/bash

# PrepKit Backend - Setup Script

echo "🚀 Setting up PrepKit Backend..."

# Step 1: Create .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating .env file..."
    cp backend/.env.example backend/.env
    
    # Generate SECRET_KEY
    echo "🔐 Generating SECRET_KEY..."
    SECRET_KEY=$(openssl rand -hex 32)
    sed -i "s/generate_with_openssl_rand_hex_32/$SECRET_KEY/" backend/.env
    echo "✅ SECRET_KEY generated and saved to .env"
else
    echo "✅ .env file already exists"
fi

# Step 2: Build and start Docker containers
echo "🐳 Building Docker containers..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Step 3: Wait for PostgreSQL to be healthy
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Step 4: Run migrations
echo "📊 Running database migrations..."
docker-compose exec backend alembic revision --autogenerate -m "Initial migration - users table"
docker-compose exec backend alembic upgrade head

echo "✅ Setup complete!"
echo ""
echo "📚 Access the API documentation:"
echo "   - Swagger UI: http://localhost:8000/api/docs"
echo "   - ReDoc: http://localhost:8000/api/redoc"
echo ""
echo "🧪 Run tests:"
echo "   docker-compose exec backend pytest -v"
echo ""
echo "📝 View logs:"
echo "   docker-compose logs -f backend"
