import React, { useState } from 'react';
import { recipesApi } from '../api/recipes';
import type { RecipeListItem } from '../types/recipe';
import { MealType } from '../types/meal-plan';

interface AddMealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (recipeId: number, servings: number) => void;
    selectedSlot: {
        date: string;
        mealType: MealType;
    } | null;
}

const AddMealModal: React.FC<AddMealModalProps> = ({ isOpen, onClose, onAdd, selectedSlot }) => {
    const [search, setSearch] = useState('');
    const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<number | null>(null);
    const [servings, setServings] = useState(1);

    React.useEffect(() => {
        if (isOpen) {
            loadRecipes();
        }
    }, [isOpen, search]);

    const loadRecipes = async () => {
        setLoading(true);
        try {
            const data = await recipesApi.getRecipes({ search, limit: 20 });
            setRecipes(data);
        } catch (error) {
            console.error('Failed to load recipes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        if (selectedRecipe) {
            onAdd(selectedRecipe, servings);
            handleClose();
        }
    };

    const handleClose = () => {
        setSearch('');
        setSelectedRecipe(null);
        setServings(1);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Add Meal</h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ✕
                        </button>
                    </div>
                    {selectedSlot && (
                        <p className="text-sm text-gray-600 mt-2">
                            {selectedSlot.date} • {selectedSlot.mealType}
                        </p>
                    )}
                </div>

                {/* Search */}
                <div className="p-6 border-b">
                    <input
                        type="text"
                        placeholder="Search recipes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                </div>

                {/* Recipe List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    ) : recipes.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No recipes found</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {recipes.map((recipe) => (
                                <div
                                    key={recipe.id}
                                    onClick={() => setSelectedRecipe(recipe.id)}
                                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${selectedRecipe === recipe.id
                                            ? 'border-primary-600 bg-primary-50'
                                            : 'border-gray-200 hover:border-primary-300'
                                        }`}
                                >
                                    {recipe.image_url ? (
                                        <img
                                            src={recipe.image_url}
                                            alt={recipe.title}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-2xl">
                                            🍽️
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{recipe.title}</h3>
                                        <p className="text-xs text-gray-500">
                                            {Math.round(recipe.calories_per_serving)} cal • {Math.round(recipe.protein_per_serving)}g protein
                                        </p>
                                    </div>
                                    {selectedRecipe === recipe.id && (
                                        <div className="text-primary-600">✓</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-medium text-gray-700">Servings:</label>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setServings(Math.max(1, servings - 1))}
                                className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            >
                                -
                            </button>
                            <span className="w-12 text-center font-semibold">{servings}</span>
                            <button
                                onClick={() => setServings(servings + 1)}
                                className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAdd}
                            disabled={!selectedRecipe}
                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add to Plan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddMealModal;
