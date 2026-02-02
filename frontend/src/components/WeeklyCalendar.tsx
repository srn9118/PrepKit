import React from 'react';
import type { MealPlanItem } from '../types/meal-plan';
import { MealType } from '../types/meal-plan';
import MealSlot from './MealSlot';
import { formatDate, getDayName, getDayNumber } from '../utils/dateHelpers';

interface WeeklyCalendarProps {
    weekStartDate: Date;
    meals: MealPlanItem[];
    onAddMeal: (date: string, mealType: MealType) => void;
    onRemoveMeal: (mealId: number) => void;
    onMealClick: (recipeId: number) => void;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
    weekStartDate,
    meals,
    onAddMeal,
    onRemoveMeal,
    onMealClick,
}) => {
    const mealTypes: { type: MealType; icon: string; label: string }[] = [
        { type: MealType.BREAKFAST, icon: '🌅', label: 'Breakfast' },
        { type: MealType.LUNCH, icon: '🌮', label: 'Lunch' },
        { type: MealType.DINNER, icon: '🍽️', label: 'Dinner' },
        { type: MealType.SNACK, icon: '🍪', label: 'Snack' },
    ];

    // Generate week days
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStartDate);
        date.setDate(date.getDate() + i);
        return date;
    });

    // Get meal for specific slot
    const getMealForSlot = (date: Date, mealType: MealType): MealPlanItem | null => {
        const dateStr = formatDate(date);
        return meals.find((m) => m.date === dateStr && m.meal_type === mealType.toLowerCase()) || null;
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Header with day names */}
            <div className="grid grid-cols-8 border-b bg-gray-50">
                <div className="p-3"></div>
                {weekDays.map((day, i) => (
                    <div key={i} className="p-3 text-center">
                        <div className="text-xs font-semibold text-gray-600">{getDayName(day)}</div>
                        <div className="text-lg font-bold text-gray-900">{getDayNumber(day)}</div>
                    </div>
                ))}
            </div>

            {/* Meal rows */}
            {mealTypes.map((mealType) => (
                <div key={mealType.type} className="grid grid-cols-8 border-b last:border-b-0">
                    {/* Meal type label */}
                    <div className="p-3 bg-gray-50 border-r flex items-center gap-2">
                        <span className="text-xl">{mealType.icon}</span>
                        <span className="text-sm font-semibold text-gray-700">{mealType.label}</span>
                    </div>

                    {/* Meal slots for each day */}
                    {weekDays.map((day, dayIndex) => {
                        const meal = getMealForSlot(day, mealType.type);
                        return (
                            <div key={dayIndex} className="p-2 border-r last:border-r-0">
                                <MealSlot
                                    meal={meal}
                                    onAdd={() => onAddMeal(formatDate(day), mealType.type)}
                                    onRemove={meal ? () => onRemoveMeal(meal.id) : undefined}
                                    onClick={meal ? () => onMealClick(meal.recipe_id) : undefined}
                                />
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default WeeklyCalendar;
