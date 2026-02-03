import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recipesApi } from '../api/recipes';
import type { RecipeListItem } from '../types/recipe';
import Layout from '../components/Layout';
import TopBar from '../components/TopBar';
import RecipeCard from '../components/RecipeCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';

const RecipeList: React.FC = () => {
    const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
    const [allRecipes, setAllRecipes] = useState<RecipeListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [activeTab, setActiveTab] = useState<'discover' | 'my-recipes'>('discover');
    const { user } = useAuth();

    useEffect(() => {
        loadRecipes();
    }, [search, activeTab]);

    useEffect(() => {
        filterByCategory();
    }, [selectedCategory, allRecipes]);

    const loadRecipes = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (search) params.search = search;
            if (activeTab === 'my-recipes' && user) {
                params.author_id = user.id;
            }

            const data = await recipesApi.getRecipes(params);
            setAllRecipes(data);
            setRecipes(data);
        } catch (error) {
            console.error('Failed to load recipes:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterByCategory = () => {
        if (!selectedCategory) {
            setRecipes(allRecipes);
            return;
        }

        // Filter recipes by category (tag name)
        const filtered = allRecipes.filter((recipe) =>
            recipe.tags?.some((tag) => tag.name.toLowerCase() === selectedCategory.toLowerCase())
        );
        setRecipes(filtered);
    };

    // Category chips
    const categories = [
        { icon: '🥗', label: 'Salads' },
        { icon: '🍖', label: 'Meat' },
        { icon: '🥦', label: 'Vegan' },
        { icon: '🍜', label: 'Pasta' },
        { icon: '🍲', label: 'Soups' },
        { icon: '🍰', label: 'Desserts' },
    ];

    const handleCategoryClick = (category: string) => {
        setSelectedCategory(selectedCategory === category ? '' : category);
    };

    return (
        <Layout>
            <TopBar
                title="Recipes"
                actions={
                    user && (
                        <Link
                            to="/recipes/create"
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-primary hover:bg-primary-dark transition-colors"
                        >
                            <span className="text-xl text-white">+</span>
                        </Link>
                    )
                }
            />

            <div className="space-y-4 mt-6">
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search recipes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field w-full pl-12"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                        🔍
                    </span>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border">
                    <button
                        onClick={() => setActiveTab('discover')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'discover' ? 'tab-active' : 'tab-inactive'
                            }`}
                    >
                        Discover
                    </button>
                    {user && (
                        <button
                            onClick={() => setActiveTab('my-recipes')}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'my-recipes' ? 'tab-active' : 'tab-inactive'
                                }`}
                        >
                            My Recipes
                        </button>
                    )}
                </div>

                {/* Category Chips - Horizontal Scroll - FIXED */}
                <div className="relative -mx-4">
                    <div
                        className="flex gap-3 overflow-x-scroll pb-2 px-4"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch',
                        }}
                    >
                        {categories.map((cat, index) => (
                            <button
                                key={index}
                                onClick={() => handleCategoryClick(cat.label)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.label
                                    ? 'bg-primary text-white scale-105'
                                    : 'bg-surface-elevated text-text-primary hover:bg-primary/20'
                                    }`}
                            >
                                <span className="mr-2">{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Active Filter Indicator */}
                {selectedCategory && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <span>Filtered by: {selectedCategory}</span>
                        <button
                            onClick={() => setSelectedCategory('')}
                            className="text-primary font-semibold"
                        >
                            Clear
                        </button>
                    </div>
                )}

                {/* Recipes Grid */}
                {loading ? (
                    <SkeletonLoader type="recipe" />
                ) : recipes.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🍽️</div>
                        <h3 className="text-xl font-semibold text-text-primary">
                            No recipes found
                        </h3>
                        <p className="mt-2 text-text-secondary">
                            {selectedCategory
                                ? `No ${selectedCategory.toLowerCase()} recipes available`
                                : activeTab === 'my-recipes'
                                    ? 'Create your first recipe!'
                                    : 'Try adjusting your search'}
                        </p>
                        {user && activeTab === 'my-recipes' && (
                            <Link to="/recipes/create" className="btn-primary mt-4 inline-block">
                                Create Recipe
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {recipes.map((recipe) => (
                            <RecipeCard key={recipe.id} recipe={recipe} />
                        ))}
                    </div>
                )}
            </div>

            <style>{`
        div[style*="scrollbar-width"]::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </Layout>
    );
};

export default RecipeList;
