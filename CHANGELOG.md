# Changelog

All notable changes to PrepKit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Module 7 - Modern UI Redesign (2026-02-03)

#### Added - Foundation & Core Components
- **Dark Theme System**: Complete CSS custom properties system with dark mode colors
  - Background: #1a1a1a, Surface: #2d2d2d, Surface Elevated: #3a3a3a
  - Text hierarchy: primary (#fff), secondary (#a0a0a0), disabled (#666)
  - Primary color: #4CAF50 (green), Error: #ef4444 (red)
- **BottomNav Component**: Fixed bottom navigation with 4 tabs
  - Dashboard, Recipes, Planner, Profile
  - Active state with accent color and bold text
  - Mobile-optimized with 70px height
- **TopBar Component**: App-like top navigation
  - Title (left), actions (right), optional back button
  - Clean 60px height with bottom border
- **Layout Component**: Wrapper with proper spacing for BottomNav
  - max-w-md centered container
  - pb-20 to prevent content hiding behind bottom nav

#### Added - Progress & Data Visualization
- **ProgressCircle Component**: Animated SVG circular progress indicator
  - 192px diameter with animated stroke
  - Center text for consumed/goal values
  - Smooth transitions (500ms)
  - Used for daily calorie tracking
- **MacroBar Component**: Horizontal progress bars for macronutrients
  - Color-coded: Protein (blue), Carbs (yellow), Fats (green)
  - Gradient fills with smooth animations
  - Current/Goal labels
  - Responsive width transitions

#### Redesigned - Pages (Phase 3)
- **Dashboard Page**:
  - ProgressCircle showing daily calorie consumption
  - 3 MacroBars for Protein, Carbs, and Fats
  - Gradient quick action cards (Plan meals, Browse recipes, Shopping list)
  - "Today's Meals" section with empty state
  - "Tip of the Day" card
- **RecipeList Page**:
  - TopBar with "+" create button
  - Search bar with emoji icon
  - Tabs: Discover | My Recipes
  - **Horizontal scrolling category chips** (Salads, Meat, Vegan, etc.)
  - **Category filtering functionality** (clickable chips)
  - 2-column grid layout
  - Active filter indicator with Clear button
- **RecipeDetail Page**:
  - Hero image (300px height) with gradient overlay
  - Back and Favorite buttons (floating)
  - Stats row: kcal, time, servings
  - Tabs: Ingredients | Instructions | Nutrition
  - Sticky CTA "Add to Meal Plan" button
  - Properly spaced title section (2rem padding-top)
- **MealPlanner Page** (Mobile-First Redesign):
  - TopBar with shopping cart button
  - Week navigator (← →)
  - **Single-day view** optimized for mobile
  - **Horizontal day selector** with scroll
  - Visual indicators (dots) for planned meals
  - "TODAY" marker on current day
  - Daily totals card (Cal/Prot/Carbs/Fats)
  - Vertical sections by meal type (Breakfast, Lunch, Dinner, Snacks)
  - Touch-friendly "+" buttons for each meal type
  - Recipe cards with thumbnails
  - Proper color contrast (#fff on #2d2d2d)
- **Profile Page** (New):
  - Circular avatar with user initial
  - User name and email
  - Daily goals grid (4 cards: Calories, Protein, Carbs, Fats)
  - Settings options (Edit Profile, Preferences, About)
  - Logout button (red accent)
  - App version footer

#### Redesigned - ShoppingList (Phase 4 Polish)
- **Modern ShoppingList Page**:
  - TopBar with Print button (🖨️)
  - Week range display with dates
  - Progress bar (0-100% completion)
  - Summary stats: Total Items + Checked count
  - **Touch-friendly checkboxes** (24px × 24px)
  - **Check animations**: opacity 50% + line-through
  - "Clear X Checked Items" button (red, destructive)
  - Separated sections:
    - "To Buy (X)" - unchecked items
    - "Checked (Y)" - completed items with reduced opacity
  - Shopping tips card
  - Print-friendly styles

#### Added - Loading States (Phase 4 Polish)
- **SkeletonLoader Component**:
  - RecipeCardSkeleton: Mimics recipe card structure
  - DashboardSkeleton: Circle + bars + action cards
  - `animate-pulse` utility for shimmer effect
- **Loading Integration**:
  - RecipeList: Shows 6 skeleton cards while loading
  - Dashboard: 500ms simulated loading with skeleton

#### Changed - RecipeCard Component
- Redesigned with modern aesthetic:
  - Image-first layout (16:9 aspect ratio)
  - Rounded corners (16px)
  - Gradient background for image overlay
  - Favorite star button (top-right)
  - Compact nutrition stats with emojis
  - Tag badges (primary color)
  - Macro grid at bottom (Protein/Carbs/Fats)
  - Smooth hover effects (scale 1.02)

#### Fixed - UI Bugs
- **BUG 1**: RecipeList category chips
  - ✅ Horizontal scroll now functional (`overflow-x-scroll`)
  - ✅ Chips are clickable and filter recipes by tag
  - ✅ Active state with primary background
  - ✅ Clear filter button appears when active
- **BUG 2**: RecipeDetail spacing
  - ✅ Added 2rem padding-top to title section
  - ✅ Proper spacing between hero image and content
- **BUG 3**: MealPlanner contrast
  - ✅ Fixed text colors (white #fff on dark backgrounds)
  - ✅ Proper contrast ratios (AA+ compliance)
- **BUG 4**: MealPlanner mobile layout
  - ✅ Changed from 7-column grid to single-day view
  - ✅ Horizontal day selector with swipe
  - ✅ Vertical meal type sections
  - ✅ Much more spacious and usable on mobile

#### Technical Improvements
- Added `globals.css` with comprehensive CSS custom properties
- Utility classes: `.card`, `.btn-primary`, `.btn-secondary`, `.input-field`, `.tab-active`, `.tab-inactive`
- Consistent border-radius: 12-16px
- Consistent padding: 16-20px in cards
- Touch target compliance: Minimum 24px for all interactive elements
- Smooth transitions: 200-500ms throughout
- Mobile-first responsive breakpoints

#### Design System Established
- **Colors**: 15 custom properties for consistent theming
- **Typography**: System font stack (Inter, SF Pro, Roboto)
- **Spacing**: Consistent scale (4px, 8px, 16px, 24px, 32px)
- **Shadows**: Subtle elevation (0 2px 8px rgba(0,0,0,0.2))
- **Animations**: Unified 200-500ms durations

---

## [0.2.0] - Module 6 - Meal Planner (2026-02-02)

### Added - Meal Planning System
- Weekly meal planner with calendar grid
- 4 meal types: Breakfast, Lunch, Dinner, Snacks
- Add/Remove meals functionality
- Meal search modal
- Shopping list generation with ingredient aggregation
- Date navigation (previous/next week)
- Weekly nutrition statistics

### Added - Backend API
- `GET /meal-plans` - Get meal plan for date range
- `POST /meal-plans` - Add meal to plan
- `PUT /meal-plans/{id}` - Update meal servings
- `DELETE /meal-plans/{id}` - Remove meal
- `GET /meal-plans/shopping-list` - Generate shopping list

### Added - Frontend Components
- `WeeklyCalendar.tsx` - 7x4 meal grid
- `MealSlot.tsx` - Individual meal card
- `AddMealModal.tsx` - Recipe search and selection
- `MealPlanner.tsx` - Main planner page
- `ShoppingList.tsx` - Shopping list page

---

## [0.1.0] - Modules 1-5 - Core Functionality

### Added - Initial Release
- User authentication (Register/Login/JWT)
- Recipe CRUD operations
- Ingredient management
- Tag system for recipes
- Nutrition calculation per serving
- PostgreSQL database with Alembic migrations
- Docker containerization
- FastAPI backend with automatic API docs
- React + TypeScript frontend
- Basic responsive UI

### Backend Models
- User
- Recipe
- Ingredient
- RecipeIngredient
- Tag
- MealPlanItem

### API Endpoints
- `/auth/*` - Authentication
- `/recipes/*` - Recipe management
- `/ingredients/*` - Ingredient CRUD
- `/tags/*` - Tag operations

---

[Unreleased]: https://github.com/username/prepkit/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/username/prepkit/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/username/prepkit/releases/tag/v0.1.0
