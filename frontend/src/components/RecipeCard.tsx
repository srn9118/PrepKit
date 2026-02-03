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
            className="recipe-card cursor-pointer"
        >
            {/* Image Container */}
            <div className="relative h-48 bg-surface-elevated">
                {recipe.image_url ? (
                    <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                        🍽️
                    </div>
                )}

                {/* Favorite Button (Top Right) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement favorite functionality
                    }}
                    className="absolute top-3 right-3 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                    <span className="text-xl">⭐</span>
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title */}
                <h3 className="font-bold text-lg text-text-primary mb-2 line-clamp-2">
                    {recipe.title}
                </h3>

                {/* Stats Row */}
                <div className="flex items-center gap-4 text-sm text-text-secondary mb-3">
                    <span className="flex items-center gap-1">
                        🔥 {Math.round(recipe.calories_per_serving)} kcal
                    </span>
                    <span className="flex items-center gap-1">
                        ⏱️ {totalTime} min
                    </span>
                    <span className="flex items-center gap-1">
                        🍽️ {recipe.servings}
                    </span>
                </div>

                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {recipe.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag.id}
                                className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium"
                            >
                                {tag.name}
                            </span>
                        ))}
                        {recipe.tags.length > 3 && (
                            <span className="px-2 py-1 bg-surface-elevated text-text-secondary rounded-full text-xs">
                                +{recipe.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Macros Mini-Grid */}
                <div className="flex gap-2 text-xs">
                    <div className="flex-1 bg-surface-elevated rounded-lg px-2 py-1.5 text-center">
                        <p className="text-text-secondary">Protein</p>
                        <p className="font-semibold text-text-primary">
                            {Math.round(recipe.protein_per_serving)}g
                        </p>
                    </div>
                    <div className="flex-1 bg-surface-elevated rounded-lg px-2 py-1.5 text-center">
                        <p className="text-text-secondary">Carbs</p>
                        <p className="font-semibold text-text-primary">
                            {Math.round(recipe.carbs_per_serving)}g
                        </p>
                    </div>
                    <div className="flex-1 bg-surface-elevated rounded-lg px-2 py-1.5 text-center">
                        <p className="text-text-secondary">Fats</p>
                        <p className="font-semibold text-text-primary">
                            {Math.round(recipe.fats_per_serving)}g
                        </p>
                    </div>
                </div>

                {/* Author */}
                <p className="mt-3 text-xs text-text-disabled">
                    by {recipe.author_name}
                </p>
            </div>
        </div>
    );
};

export default RecipeCard;
