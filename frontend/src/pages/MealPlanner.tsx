import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mealPlanApi } from '../api/meal-plan';
import type { MealPlanItem } from '../types/meal-plan';
import { MealType } from '../types/meal-plan';
import Layout from '../components/Layout';
import TopBar from '../components/TopBar';
import AddMealModal from '../components/AddMealModal';
import { getMonday, formatDate, addDays, getDayName, getDayNumber } from '../utils/dateHelpers';

const MealPlanner: React.FC = () => {
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
    const [selectedDay, setSelectedDay] = useState(0); // 0-6 for Mon-Sun
    const [meals, setMeals] = useState<MealPlanItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ date: string; mealType: typeof MealType[keyof typeof MealType] } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadWeeklyPlan();
    }, [currentWeekStart]);

    const loadWeeklyPlan = async () => {
        setLoading(true);
        try {
            const start = formatDate(currentWeekStart);
            const end = formatDate(addDays(currentWeekStart, 6));
            const data = await mealPlanApi.getMealPlan(start, end);
            setMeals(data);
        } catch (error) {
            console.error('Failed to load meal plan:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMealClick = (date: string, mealType: typeof MealType[keyof typeof MealType]) => {
        setSelectedSlot({ date, mealType });
        setShowAddModal(true);
    };

    const handleAddMeal = async (recipeId: number, servings: number) => {
        if (!selectedSlot) return;

        try {
            await mealPlanApi.addMeal({
                recipe_id: recipeId,
                date: selectedSlot.date,
                meal_type: selectedSlot.mealType,
                servings,
            });
            await loadWeeklyPlan();
        } catch (error) {
            console.error('Failed to add meal:', error);
            alert('Failed to add meal to plan');
        }
    };

    const handleRemoveMeal = async (mealId: number) => {
        if (!window.confirm('Remove this meal from your plan?')) return;

        try {
            await mealPlanApi.removeMeal(mealId);
            await loadWeeklyPlan();
        } catch (error) {
            console.error('Failed to remove meal:', error);
            alert('Failed to remove meal');
        }
    };

    const handleMealClick = (recipeId: number) => {
        navigate(`/recipes/${recipeId}`);
    };

    const goToPreviousWeek = () => {
        setCurrentWeekStart(addDays(currentWeekStart, -7));
        setSelectedDay(0);
    };

    const goToNextWeek = () => {
        setCurrentWeekStart(addDays(currentWeekStart, 7));
        setSelectedDay(0);
    };

    // Get meals for selected day
    const currentDate = addDays(currentWeekStart, selectedDay);
    const currentDateStr = formatDate(currentDate);
    const mealsForDay = meals.filter((meal) => meal.date === currentDateStr);

    const mealTypes = [
        { type: MealType.BREAKFAST, label: 'Breakfast', icon: '🌅' },
        { type: MealType.LUNCH, label: 'Lunch', icon: '☀️' },
        { type: MealType.DINNER, label: 'Dinner', icon: '🌙' },
        { type: MealType.SNACK, label: 'Snacks', icon: '🍿' },
    ];

    const getMealsForType = (type: string) => {
        return mealsForDay.filter((meal) => meal.meal_type === type);
    };

    // Calculate daily totals for selected day
    const dailyTotals = mealsForDay.reduce(
        (acc, meal) => ({
            calories: acc.calories + meal.calories,
            protein: acc.protein + meal.protein,
            carbs: acc.carbs + meal.carbs,
            fats: acc.fats + meal.fats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    return (
        <Layout>
            <TopBar
                title="Meal Planner"
                actions={
                    <Link to="/shopping-list" className="text-2xl">
                        🛒
                    </Link>
                }
            />

            <div className="space-y-4 mt-6">
                {/* Week Navigator */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={goToPreviousWeek}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-elevated text-text-primary hover:bg-surface transition-colors"
                    >
                        ←
                    </button>
                    <div className="text-center">
                        <p className="text-sm text-text-secondary">Week of</p>
                        <p className="font-bold text-text-primary">
                            {currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                    <button
                        onClick={goToNextWeek}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-elevated text-text-primary hover:bg-surface transition-colors"
                    >
                        →
                    </button>
                </div>

                {/* Day Selector - Horizontal Scroll */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
                    {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                        const day = addDays(currentWeekStart, dayIndex);
                        const dayMeals = meals.filter((m) => m.date === formatDate(day));
                        const isSelected = selectedDay === dayIndex;
                        const isToday = formatDate(new Date()) === formatDate(day);

                        return (
                            <button
                                key={dayIndex}
                                onClick={() => setSelectedDay(dayIndex)}
                                className={`flex-shrink-0 w-16 py-3 rounded-xl text-center transition-all ${isSelected
                                        ? 'bg-primary text-white scale-105'
                                        : 'bg-surface text-text-primary hover:bg-surface-elevated'
                                    }`}
                            >
                                <p className="text-xs font-medium opacity-80">
                                    {getDayName(day).substring(0, 3)}
                                </p>
                                <p className="text-xl font-bold my-1">{getDayNumber(day)}</p>
                                {dayMeals.length > 0 && (
                                    <div className="flex justify-center gap-0.5">
                                        {dayMeals.slice(0, 4).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                                {isToday && (
                                    <p className="text-[10px] font-semibold mt-1">TODAY</p>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Daily Stats Card */}
                <div className="card">
                    <h3 className="text-sm font-semibold text-text-secondary mb-3">
                        Daily Totals
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                        <div className="text-center p-2 bg-surface-elevated rounded-lg">
                            <p className="text-xs text-text-secondary">Cal</p>
                            <p className="text-lg font-bold text-primary">
                                {Math.round(dailyTotals.calories)}
                            </p>
                        </div>
                        <div className="text-center p-2 bg-surface-elevated rounded-lg">
                            <p className="text-xs text-text-secondary">Prot</p>
                            <p className="text-lg font-bold text-text-primary">
                                {Math.round(dailyTotals.protein)}g
                            </p>
                        </div>
                        <div className="text-center p-2 bg-surface-elevated rounded-lg">
                            <p className="text-xs text-text-secondary">Carbs</p>
                            <p className="text-lg font-bold text-text-primary">
                                {Math.round(dailyTotals.carbs)}g
                            </p>
                        </div>
                        <div className="text-center p-2 bg-surface-elevated rounded-lg">
                            <p className="text-xs text-text-secondary">Fats</p>
                            <p className="text-lg font-bold text-text-primary">
                                {Math.round(dailyTotals.fats)}g
                            </p>
                        </div>
                    </div>
                </div>

                {/* Meals by Type */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {mealTypes.map(({ type, label, icon }) => {
                            const typeMeals = getMealsForType(type);

                            return (
                                <div key={type} className="card">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-text-primary flex items-center gap-2">
                                            <span className="text-xl">{icon}</span>
                                            {label}
                                        </h3>
                                        <button
                                            onClick={() => handleAddMealClick(currentDateStr, type)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-white transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {typeMeals.length === 0 ? (
                                        <div className="text-center py-6 border-2 border-dashed border-border rounded-xl">
                                            <p className="text-sm text-text-disabled">No meal planned</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {typeMeals.map((meal) => (
                                                <div
                                                    key={meal.id}
                                                    onClick={() => handleMealClick(meal.recipe_id)}
                                                    className="flex items-center gap-3 p-3 bg-surface-elevated rounded-xl cursor-pointer hover:bg-surface transition-colors"
                                                >
                                                    {meal.recipe_image_url ? (
                                                        <img
                                                            src={meal.recipe_image_url}
                                                            alt={meal.recipe_title}
                                                            className="w-12 h-12 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center text-2xl">
                                                            🍽️
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-text-primary truncate">
                                                            {meal.recipe_title}
                                                        </p>
                                                        <p className="text-xs text-text-secondary">
                                                            {meal.servings} {meal.servings === 1 ? 'serving' : 'servings'} • {Math.round(meal.calories)} kcal
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveMeal(meal.id);
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-error/20 text-error transition-colors"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-3">
                    <Link
                        to="/recipes"
                        className="flex-1 btn-secondary text-center"
                    >
                        Browse Recipes
                    </Link>
                </div>
            </div>

            {/* Add Meal Modal */}
            <AddMealModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddMeal}
                selectedSlot={selectedSlot}
            />
        </Layout>
    );
};

export default MealPlanner;
