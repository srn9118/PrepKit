import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { RecipeListItem } from '../types/recipe';

interface RecipeCardProps {
    recipe: RecipeListItem;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
    const navigate = useNavigate();
    const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;

    const handleClick = () => {
        navigate(`/recipes/${recipe.id}`);
    };

    return (
        <div
            onClick={handleClick}
            className="card overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition duration-200 cursor-pointer"
        >
            <div className="relative h-48 bg-gray-200">
                {recipe.image_url ? (
                    <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                        🍽️
                    </div>
                )}
            </div>

            <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{recipe.title}</h3>
                {recipe.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                )}

                <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        ⏱️ {totalTime} min
                    </span>
                    <span className="flex items-center gap-1">
                        👥 {recipe.servings} servings
                    </span>
                </div>

                {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {recipe.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag.id}
                                className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium"
                            >
                                {tag.name}
                            </span>
                        ))}
                        {recipe.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                +{recipe.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                    <div className="bg-orange-50 text-orange-700 px-2 py-1 rounded">
                        {Math.round(recipe.calories_per_serving)} cal
                    </div>
                    <div className="bg-red-50 text-red-700 px-2 py-1 rounded">
                        {Math.round(recipe.protein_per_serving)}g protein
                    </div>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                    by {recipe.author_name}
                </div>
            </div>
        </div>
    );
};

export default RecipeCard;
