import React from 'react';
import type { MealPlanItem } from '../types/meal-plan';

interface MealSlotProps {
    meal: MealPlanItem | null;
    onRemove?: () => void;
    onAdd?: () => void;
    onClick?: () => void;
}

const MealSlot: React.FC<MealSlotProps> = ({ meal, onRemove, onAdd, onClick }) => {
    if (!meal) {
        // Empty slot
        return (
            <button
                onClick={onAdd}
                className="h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition flex items-center justify-center text-gray-400 hover:text-primary-600"
            >
                <span className="text-3xl">+</span>
            </button>
        );
    }

    // Filled slot
    return (
        <div
            onClick={onClick}
            className="h-24 border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer bg-white group relative"
        >
            {meal.recipe_image_url && (
                <img
                    src={meal.recipe_image_url}
                    alt={meal.recipe_title}
                    className="w-full h-12 object-cover"
                />
            )}
            <div className="p-2">
                <p className="text-xs font-medium text-gray-900 truncate">{meal.recipe_title}</p>
                <p className="text-xs text-gray-500">{meal.servings} serving{meal.servings > 1 ? 's' : ''}</p>
            </div>

            {onRemove && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                >
                    ✕
                </button>
            )}
        </div>
    );
};

export default MealSlot;
