# PrepKit - Modern Meal Planning Application

PrepKit is a full-stack meal planning and recipe management application with a modern, mobile-first UI inspired by leading nutrition apps like Yazio.

## 🎨 Design Philosophy

PrepKit features a **modern dark theme** with a clean, app-like interface optimized for mobile devices:

- **Dark Mode First**: Sleek #1a1a1a background with #2d2d2d cards
- **Touch-Friendly**: All interactive elements meet 24px minimum touch targets
- **Smooth Animations**: Subtle transitions and micro-interactions throughout
- **Mobile-Optimized**: Bottom navigation, horizontal scrolling, and single-column layouts

## 📸 Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)
*Daily calorie progress circle, macro bars, and quick action cards*

### Recipe List
![Recipe List](./screenshots/recipe-list.png)
*2-column grid with category filters and search*

### Recipe Detail
![Recipe Detail](./screenshots/recipe-detail.png)
*Hero image, tabbed content (Ingredients/Instructions/Nutrition), and sticky CTA*

### Meal Planner
![Meal Planner](./screenshots/meal-planner.png)
*Single-day view with horizontal day selector and meal type sections*

### Shopping List
![Shopping List](./screenshots/shopping-list.png)
*Touch-friendly checkboxes, progress tracking, and print support*

### Profile
![Profile](./screenshots/profile.png)
*User information, daily nutrition goals, and settings*

## ✨ Features

### 🍽️ Recipe Management
- Browse and search recipes with category filters
- Create custom recipes with ingredients and instructions
- View detailed nutrition information
- Save favorite recipes
- Tag-based organization

### 📅 Meal Planning
- Weekly meal planner with calendar view
- Drag-and-drop meal scheduling (4 meal types: Breakfast, Lunch, Dinner, Snacks)
- Mobile-friendly single-day view
- Nutrition tracking and daily totals
- Week-to-week navigation

### 🛒 Shopping Lists
- Auto-generate shopping lists from meal plans
- Ingredient aggregation across recipes
- Touch-friendly checkboxes (24px)
- Progress tracking with visual indicators
- Print-friendly layout
- Clear completed items

### 📊 Nutrition Tracking
- Circular progress indicator for daily calories
- Horizontal macro bars (Protein, Carbs, Fats)
- Real-time progress updates
- Customizable daily goals

### 🎨 Modern UI Components
- **BottomNav**: Fixed navigation with 4 main sections
- **TopBar**: Clean header with context-specific actions
- **ProgressCircle**: Animated SVG circular progress
- **MacroBar**: Horizontal bars with gradient fills
- **RecipeCard**: Image-first cards with nutrition stats
- **SkeletonLoader**: Smooth loading states

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM
- **Alembic** - Database migrations
- **Pydantic** - Data validation
- **JWT** - Authentication

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Custom CSS** - Dark theme system

### DevOps
- **Docker & Docker Compose** - Containerization
- **Pytest** - Backend testing
- **ESLint** - Code quality

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MealKit
   ```

2. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### Database Migrations
```bash
cd backend
alembic upgrade head
```

## 📁 Project Structure

```
MealKit/
├── backend/
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── routers/        # API endpoints
│   │   ├── services/       # Business logic
│   │   └── main.py         # FastAPI app
│   ├── alembic/            # Database migrations
│   └── tests/              # Backend tests
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── api/            # API clients
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Helper functions
│   │   └── context/        # React contexts
│   └── public/             # Static assets
└── docker-compose.yml      # Docker orchestration
```

## 🎯 API Endpoints

### Authentication
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user profile

### Recipes
- `GET /recipes` - List recipes (with search, pagination, filters)
- `GET /recipes/{id}` - Get recipe details
- `POST /recipes` - Create new recipe
- `PUT /recipes/{id}` - Update recipe
- `DELETE /recipes/{id}` - Delete recipe

### Meal Planning
- `GET /meal-plans` - Get meal plan for date range
- `POST /meal-plans` - Add meal to plan
- `PUT /meal-plans/{id}` - Update meal plan item
- `DELETE /meal-plans/{id}` - Remove meal from plan
- `GET /meal-plans/shopping-list` - Generate shopping list

### Ingredients
- `GET /ingredients` - List all ingredients
- `POST /ingredients` - Create new ingredient

## 🎨 Design System

### Color Palette
```css
/* Background */
--background: #1a1a1a
--surface: #2d2d2d
--surface-elevated: #3a3a3a

/* Text */
--text-primary: #ffffff
--text-secondary: #a0a0a0
--text-disabled: #666666

/* Primary */
--primary: #4CAF50
--primary-dark: #45a049

/* Semantic */
--error: #ef4444
--warning: #f59e0b
--success: #10b981
```

### Typography
- **Font Family**: System fonts (Inter, SF Pro, Roboto)
- **Headings**: 700-800 weight, 24-28px
- **Body**: 400 weight, 16px
- **Labels**: 600 weight, 14px

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
pytest --cov=app tests/  # With coverage
```

### Frontend Tests (Coming Soon)
```bash
cd frontend
npm test
```

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@db:5432/prepkit
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- UI/UX inspiration from [Yazio](https://www.yazio.com/)
- Icon set from emoji unicode
- Color palette inspired by modern dark themes

## 📞 Support

For support, email support@prepkit.app or open an issue in the repository.

---

**Built with ❤️ using FastAPI + React + TypeScript**