import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recipesApi } from '../api/recipes';
import type { Recipe } from '../types/recipe';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const RecipeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            loadRecipe(parseInt(id));
        }
    }, [id]);

    const loadRecipe = async (recipeId: number) => {
        try {
            const data = await recipesApi.getRecipeById(recipeId);
            setRecipe(data);
        } catch (error) {
            console.error('Failed to load recipe:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!recipe || !window.confirm('Are you sure you want to delete this recipe?')) return;

        try {
            await recipesApi.deleteRecipe(recipe.id);
            navigate('/recipes');
        } catch (error) {
            console.error('Failed to delete recipe:', error);
            alert('Failed to delete recipe');
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </Layout>
        );
    }

    if (!recipe) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Recipe not found</h2>
                </div>
            </Layout>
        );
    }

    const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;
    const isOwner = user?.id === recipe.author_id;

    return (
        <Layout>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/recipes')}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                        ← Back to Recipes
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div>
                        {recipe.image_url ? (
                            <img
                                src={recipe.image_url}
                                alt={recipe.title}
                                className="w-full h-96 object-cover rounded-lg shadow-md"
                            />
                        ) : (
                            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-8xl">
                                🍽️
                            </div>
                        )}
                    </div>

                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
                        <p className="text-gray-600 mb-4">by {recipe.author_name}</p>

                        {recipe.description && (
                            <p className="text-gray-700 mb-6">{recipe.description}</p>
                        )}

                        <div className="flex items-center gap-6 mb-6 text-gray-700">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">⏱️</span>
                                <div>
                                    <div className="text-sm text-gray-500">Total Time</div>
                                    <div className="font-semibold">{totalTime} minutes</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">👥</span>
                                <div>
                                    <div className="text-sm text-gray-500">Servings</div>
                                    <div className="font-semibold">{recipe.servings}</div>
                                </div>
                            </div>
                        </div>

                        {recipe.tags && recipe.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {recipe.tags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {isOwner && (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDelete}
                                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition font-medium"
                                >
                                    Delete Recipe
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="card p-6 mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ingredients</h2>
                            <ul className="space-y-2">
                                {recipe.ingredients.map((ing, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-primary-600 mr-2">•</span>
                                        <span>
                                            {ing.amount} {ing.unit} {ing.ingredient_name}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="card p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructions</h2>
                            <div className="prose max-w-none">
                                {recipe.instructions.split('\n').map((line, index) => (
                                    <p key={index} className="mb-3 text-gray-700">
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="card p-6 sticky top-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Nutrition Facts</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Per Serving</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                                            <span className="text-sm font-medium">Calories</span>
                                            <span className="font-bold text-orange-700">
                                                {Math.round(recipe.calories_per_serving)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                                            <span className="text-sm font-medium">Protein</span>
                                            <span className="font-bold text-red-700">
                                                {Math.round(recipe.protein_per_serving)}g
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                                            <span className="text-sm font-medium">Carbs</span>
                                            <span className="font-bold text-yellow-700">
                                                {Math.round(recipe.carbs_per_serving)}g
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                            <span className="text-sm font-medium">Fats</span>
                                            <span className="font-bold text-green-700">
                                                {Math.round(recipe.fats_per_serving)}g
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Recipe</h3>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <div className="font-bold text-gray-900">
                                                {Math.round(recipe.total_calories)}
                                            </div>
                                            <div className="text-gray-600">cal</div>
                                        </div>
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <div className="font-bold text-gray-900">
                                                {Math.round(recipe.total_protein)}g
                                            </div>
                                            <div className="text-gray-600">protein</div>
                                        </div>
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <div className="font-bold text-gray-900">
                                                {Math.round(recipe.total_carbs)}g
                                            </div>
                                            <div className="text-gray-600">carbs</div>
                                        </div>
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <div className="font-bold text-gray-900">
                                                {Math.round(recipe.total_fats)}g
                                            </div>
                                            <div className="text-gray-600">fats</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default RecipeDetail;
