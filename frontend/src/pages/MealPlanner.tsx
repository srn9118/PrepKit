import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mealPlanApi } from '../api/meal-plan';
import type { MealPlanItem } from '../types/meal-plan';
import { MealType } from '../types/meal-plan';
import Layout from '../components/Layout';
import WeeklyCalendar from '../components/WeeklyCalendar';
import AddMealModal from '../components/AddMealModal';
import { getMonday, formatDate, addDays, getWeekRangeString } from '../utils/dateHelpers';

const MealPlanner: React.FC = () => {
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
    const [meals, setMeals] = useState<MealPlanItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ date: string; mealType: MealType } | null>(null);
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

    const handleAddMealClick = (date: string, mealType: MealType) => {
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
    };

    const goToNextWeek = () => {
        setCurrentWeekStart(addDays(currentWeekStart, 7));
    };

    const goToThisWeek = () => {
        setCurrentWeekStart(getMonday(new Date()));
    };

    // Calculate weekly nutrition totals
    const weeklyTotals = meals.reduce(
        (acc, meal) => ({
            calories: acc.calories + meal.calories,
            protein: acc.protein + meal.protein,
            carbs: acc.carbs + meal.carbs,
            fats: acc.fats + meal.fats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const dailyAverage = {
        calories: Math.round(weeklyTotals.calories / 7),
        protein: Math.round(weeklyTotals.protein / 7),
        carbs: Math.round(weeklyTotals.carbs / 7),
        fats: Math.round(weeklyTotals.fats / 7),
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Meal Planner</h1>
                    <p className="text-gray-600">Plan your meals for the week</p>
                </div>

                {/* Week Navigation */}
                <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow p-4">
                    <button
                        onClick={goToPreviousWeek}
                        className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                    >
                        ← Previous Week
                    </button>

                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-900">
                            {getWeekRangeString(currentWeekStart)}
                        </h2>
                        <button
                            onClick={goToThisWeek}
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
                        >
                            Today
                        </button>
                    </div>

                    <button
                        onClick={goToNextWeek}
                        className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                    >
                        Next Week →
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-sm text-gray-600">Meals Planned</div>
                        <div className="text-2xl font-bold text-gray-900">{meals.length}</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg shadow p-4">
                        <div className="text-sm text-orange-700 font-medium">Avg Calories/Day</div>
                        <div className="text-2xl font-bold text-orange-900">{dailyAverage.calories}</div>
                    </div>
                    <div className="bg-red-50 rounded-lg shadow p-4">
                        <div className="text-sm text-red-700 font-medium">Avg Protein/Day</div>
                        <div className="text-2xl font-bold text-red-900">{dailyAverage.protein}g</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg shadow p-4">
                        <div className="text-sm text-yellow-700 font-medium">Avg Carbs/Day</div>
                        <div className="text-2xl font-bold text-yellow-900">{dailyAverage.carbs}g</div>
                    </div>
                    <div className="bg-green-50 rounded-lg shadow p-4">
                        <div className="text-sm text-green-700 font-medium">Avg Fats/Day</div>
                        <div className="text-2xl font-bold text-green-900">{dailyAverage.fats}g</div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-6">
                    <Link
                        to="/shopping-list"
                        state={{ startDate: formatDate(currentWeekStart), endDate: formatDate(addDays(currentWeekStart, 6)) }}
                        className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-medium flex items-center gap-2"
                    >
                        🛒 Generate Shopping List
                    </Link>
                    <Link
                        to="/recipes"
                        className="bg-white border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                        Browse Recipes
                    </Link>
                </div>

                {/* Calendar */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <WeeklyCalendar
                        weekStartDate={currentWeekStart}
                        meals={meals}
                        onAddMeal={handleAddMealClick}
                        onRemoveMeal={handleRemoveMeal}
                        onMealClick={handleMealClick}
                    />
                )}

                {/* Add Meal Modal */}
                <AddMealModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAddMeal}
                    selectedSlot={selectedSlot}
                />
            </div>
        </Layout>
    );
};

export default MealPlanner;
