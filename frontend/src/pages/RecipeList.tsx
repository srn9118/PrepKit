import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recipesApi } from '../api/recipes';
import type { RecipeListItem } from '../types/recipe';
import Layout from '../components/Layout';
import RecipeCard from '../components/RecipeCard';
import { useAuth } from '../context/AuthContext';

const RecipeList: React.FC = () => {
    const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        loadRecipes();
    }, [search, selectedTag]);

    const loadRecipes = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (search) params.search = search;
            if (selectedTag) params.tag = selectedTag;

            const data = await recipesApi.getRecipes(params);
            setRecipes(data);
        } catch (error) {
            console.error('Failed to load recipes:', error);
        } finally {
            setLoading(false);
        }
    };

    // Extract unique tags from recipes
    const allTags = Array.from(
        new Set(recipes.flatMap((r) => r.tags?.map((t) => t.name) || []))
    );

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Recipes</h1>
                        <p className="mt-2 text-gray-600">Discover delicious meal ideas</p>
                    </div>
                    {user && (
                        <Link
                            to="/recipes/create"
                            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-medium"
                        >
                            + Create Recipe
                        </Link>
                    )}
                </div>

                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Search recipes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                    <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                        <option value="">All Tags</option>
                        {allTags.map((tag) => (
                            <option key={tag} value={tag}>
                                {tag}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : recipes.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <div className="text-6xl mb-4">🍽️</div>
                        <h3 className="text-xl font-semibold text-gray-700">No recipes found</h3>
                        <p className="mt-2">Try adjusting your search or create a new recipe!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {recipes.map((recipe) => (
                            <RecipeCard key={recipe.id} recipe={recipe} />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default RecipeList;
