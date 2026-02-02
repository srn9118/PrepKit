# PrepKit Backend

Meal prep & nutrition tracking API built with FastAPI.

## Setup

### Prerequisites
- Docker & Docker Compose
- Python 3.11+

### Installation

1. **Clone repository**
```bash
git clone <repo-url>
cd MealKit
```

2. **Create .env file**
```bash
cd backend
cp .env.example .env
# Edit .env with your values
```

3. **Generate SECRET_KEY**
```bash
openssl rand -hex 32
# Add to .env as SECRET_KEY
```

4. **Start services**
```bash
# From project root
docker-compose up -d
```

5. **Run migrations**
```bash
docker-compose exec backend alembic upgrade head
```

6. **Access API docs**
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## Testing

```bash
# Run all tests
docker-compose exec backend pytest -v

# Run with coverage
docker-compose exec backend pytest --cov=app tests/
```

## Development

### Create migration
```bash
docker-compose exec backend alembic revision --autogenerate -m "Description"
docker-compose exec backend alembic upgrade head
```

### Run tests with coverage
```bash
docker-compose exec backend pytest --cov=app tests/
```

### View logs
```bash
docker-compose logs -f backend
docker-compose logs -f postgres
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Get Google OAuth URL
- `POST /api/auth/google/callback` - Handle Google OAuth callback
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/me` - Update user profile (protected)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/health` - Health check

## Environment Variables

See [`.env.example`](backend/.env.example) for all required environment variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret (generate with `openssl rand -hex 32`)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

## Project Structure

```
prepkit/
├── backend/
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── routers/        # API endpoints
│   │   ├── services/       # Business logic
│   │   └── utils/          # Security, OAuth, etc.
│   ├── tests/              # Pytest tests
│   └── alembic/            # DB migrations
└── docker-compose.yml
```

## License

MIT
