import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recipesApi } from '../api/recipes';
import type { Recipe } from '../types/recipe';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const RecipeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'nutrition'>('ingredients');

    useEffect(() => {
        if (id) {
            loadRecipe(parseInt(id));
        }
    }, [id]);

    const loadRecipe = async (recipeId: number) => {
        setLoading(true);
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </Layout>
        );
    }

    if (!recipe) {
        return (
            <Layout>
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-text-primary">Recipe not found</h2>
                </div>
            </Layout>
        );
    }

    const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Hero Image */}
            <div className="relative h-72 bg-surface-elevated">
                {recipe.image_url ? (
                    <>
                        <img
                            src={recipe.image_url}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl">
                        🍽️
                    </div>
                )}

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                    <span className="text-xl text-white">←</span>
                </button>

                {/* Favorite Button */}
                <button className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/60 transition-colors">
                    <span className="text-xl">⭐</span>
                </button>
            </div>

            {/* Content */}
            <div className="max-w-md mx-auto px-4 -mt-6" style={{ paddingTop: '2rem' }}>
                {/* Title Card */}
                <div className="card mb-4">
                    <h1 className="text-2xl font-bold text-text-primary mb-2">
                        {recipe.title}
                    </h1>
                    <p className="text-sm text-text-secondary mb-3">
                        by {recipe.author_name}
                    </p>

                    {/* Stats Row */}
                    <div className="flex justify-between items-center p-3 bg-surface-elevated rounded-xl">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-primary">
                                {Math.round(recipe.calories_per_serving)}
                            </p>
                            <p className="text-xs text-text-secondary">kcal</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-text-primary">
                                {totalTime}
                            </p>
                            <p className="text-xs text-text-secondary">min</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-text-primary">
                                {recipe.servings}
                            </p>
                            <p className="text-xs text-text-secondary">servings</p>
                        </div>
                    </div>

                    {/* Tags */}
                    {recipe.tags && recipe.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {recipe.tags.map((tag) => (
                                <span
                                    key={tag.id}
                                    className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium"
                                >
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border mb-4">
                    {(['ingredients', 'instructions', 'nutrition'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-sm font-semibold capitalize ${activeTab === tab ? 'tab-active' : 'tab-inactive'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="mb-24">
                    {activeTab === 'ingredients' && (
                        <div className="card">
                            <h3 className="font-bold text-lg text-text-primary mb-4">
                                Ingredients
                            </h3>
                            <div className="space-y-3">
                                {recipe.ingredients.map((ing) => (
                                    <div
                                        key={ing.ingredient_id}
                                        className="flex justify-between items-center p-3 bg-surface-elevated rounded-lg"
                                    >
                                        <span className="text-text-primary">{ing.ingredient_name}</span>
                                        <span className="text-text-secondary font-medium">
                                            {ing.amount} {ing.unit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'instructions' && (
                        <div className="card">
                            <h3 className="font-bold text-lg text-text-primary mb-4">
                                Instructions
                            </h3>
                            <div className="prose prose-invert max-w-none">
                                <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">
                                    {recipe.instructions}
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'nutrition' && (
                        <div className="space-y-4">
                            <div className="card">
                                <h3 className="font-bold text-lg text-text-primary mb-4">
                                    Per Serving
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-orange-500/10 rounded-lg">
                                        <p className="text-xs text-text-secondary">Calories</p>
                                        <p className="text-xl font-bold text-orange-500">
                                            {Math.round(recipe.calories_per_serving)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-blue-500/10 rounded-lg">
                                        <p className="text-xs text-text-secondary">Protein</p>
                                        <p className="text-xl font-bold text-blue-500">
                                            {Math.round(recipe.protein_per_serving)}g
                                        </p>
                                    </div>
                                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                                        <p className="text-xs text-text-secondary">Carbs</p>
                                        <p className="text-xl font-bold text-yellow-500">
                                            {Math.round(recipe.carbs_per_serving)}g
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-500/10 rounded-lg">
                                        <p className="text-xs text-text-secondary">Fats</p>
                                        <p className="text-xl font-bold text-green-500">
                                            {Math.round(recipe.fats_per_serving)}g
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <h3 className="font-bold text-lg text-text-primary mb-4">
                                    Total Recipe
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-surface-elevated rounded-lg">
                                        <p className="text-xs text-text-secondary">Calories</p>
                                        <p className="text-lg font-bold text-text-primary">
                                            {Math.round(recipe.total_calories)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-surface-elevated rounded-lg">
                                        <p className="text-xs text-text-secondary">Protein</p>
                                        <p className="text-lg font-bold text-text-primary">
                                            {Math.round(recipe.total_protein)}g
                                        </p>
                                    </div>
                                    <div className="p-3 bg-surface-elevated rounded-lg">
                                        <p className="text-xs text-text-secondary">Carbs</p>
                                        <p className="text-lg font-bold text-text-primary">
                                            {Math.round(recipe.total_carbs)}g
                                        </p>
                                    </div>
                                    <div className="p-3 bg-surface-elevated rounded-lg">
                                        <p className="text-xs text-text-secondary">Fats</p>
                                        <p className="text-lg font-bold text-text-primary">
                                            {Math.round(recipe.total_fats)}g
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky CTA Button */}
            <div className="fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={() => navigate('/planner')}
                        className="btn-primary w-full text-center"
                    >
                        Add to Meal Plan
                    </button>

                    {user && user.id === recipe.author_id && (
                        <button
                            onClick={handleDelete}
                            className="w-full mt-2 text-sm text-error font-semibold py-2"
                        >
                            Delete Recipe
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipeDetail;
