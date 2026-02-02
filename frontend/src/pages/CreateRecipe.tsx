import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipesApi } from '../api/recipes';
import type { Ingredient } from '../types/recipe';
import Layout from '../components/Layout';
import ImageUpload from '../components/ImageUpload';

interface IngredientField {
    ingredient_id: number;
    amount: number;
    unit: string;
}

const CreateRecipe: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        instructions: '',
        prep_time_minutes: 0,
        cook_time_minutes: 0,
        servings: 1,
        is_public: true,
        tags: '',
    });

    const [ingredients, setIngredients] = useState<IngredientField[]>([
        { ingredient_id: 0, amount: 0, unit: 'g' },
    ]);

    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        loadIngredients();
    }, []);

    const loadIngredients = async () => {
        try {
            const data = await recipesApi.getIngredients();
            setAvailableIngredients(data);
        } catch (error) {
            console.error('Failed to load ingredients:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.checked,
        });
    };

    const addIngredient = () => {
        setIngredients([...ingredients, { ingredient_id: 0, amount: 0, unit: 'g' }]);
    };

    const removeIngredient = (index: number) => {
        if (ingredients.length > 1) {
            setIngredients(ingredients.filter((_, i) => i !== index));
        }
    };

    const updateIngredient = (index: number, field: keyof IngredientField, value: any) => {
        const updated = [...ingredients];
        updated[index] = {
            ...updated[index],
            [field]: field === 'ingredient_id' ? parseInt(value) : field === 'amount' ? parseFloat(value) : value,
        };
        setIngredients(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate
            if (!formData.title.trim()) {
                throw new Error('Title is required');
            }
            if (!formData.instructions.trim()) {
                throw new Error('Instructions are required');
            }
            if (ingredients.length === 0 || ingredients.every(i => i.ingredient_id === 0)) {
                throw new Error('At least one ingredient is required');
            }

            // Upload image if selected
            let imageUrl = '';
            if (imageFile) {
                imageUrl = await recipesApi.uploadImage(imageFile);
            }

            // Prepare tag names
            const tagNames = formData.tags
                .split(',')
                .map((t) => t.trim())
                .filter((t) => t.length > 0);

            // Filter valid ingredients
            const validIngredients = ingredients.filter(
                (i) => i.ingredient_id > 0 && i.amount > 0
            );

            // Create recipe
            const recipe = await recipesApi.createRecipe({
                ...formData,
                image_url: imageUrl,
                ingredients: validIngredients,
                tag_names: tagNames,
            });

            navigate(`/recipes/${recipe.id}`);
        } catch (err: any) {
            setError(err.message || err.response?.data?.detail || 'Failed to create recipe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/recipes')}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                        ← Back to Recipes
                    </button>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Recipe</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="card p-6 space-y-6">
                        <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>

                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Recipe Title *
                            </label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                required
                                className="input-field"
                                placeholder="e.g., Grilled Chicken with Rice"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                className="input-field"
                                placeholder="Brief description of your recipe..."
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="prep_time_minutes" className="block text-sm font-medium text-gray-700 mb-2">
                                    Prep Time (min)
                                </label>
                                <input
                                    id="prep_time_minutes"
                                    name="prep_time_minutes"
                                    type="number"
                                    min="0"
                                    required
                                    className="input-field"
                                    value={formData.prep_time_minutes}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="cook_time_minutes" className="block text-sm font-medium text-gray-700 mb-2">
                                    Cook Time (min)
                                </label>
                                <input
                                    id="cook_time_minutes"
                                    name="cook_time_minutes"
                                    type="number"
                                    min="0"
                                    required
                                    className="input-field"
                                    value={formData.cook_time_minutes}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-2">
                                    Servings
                                </label>
                                <input
                                    id="servings"
                                    name="servings"
                                    type="number"
                                    min="1"
                                    required
                                    className="input-field"
                                    value={formData.servings}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                                Tags (comma-separated)
                            </label>
                            <input
                                id="tags"
                                name="tags"
                                type="text"
                                className="input-field"
                                placeholder="e.g., high-protein, balanced, quick"
                                value={formData.tags}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="is_public"
                                name="is_public"
                                type="checkbox"
                                checked={formData.is_public}
                                onChange={handleCheckboxChange}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
                                Make this recipe public
                            </label>
                        </div>
                    </div>

                    <div className="card p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Recipe Image</h2>
                        <ImageUpload onImageSelect={setImageFile} />
                    </div>

                    <div className="card p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Ingredients *</h2>
                            <button
                                type="button"
                                onClick={addIngredient}
                                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm font-medium"
                            >
                                + Add Ingredient
                            </button>
                        </div>

                        <div className="space-y-3">
                            {ingredients.map((ing, index) => (
                                <div key={index} className="flex gap-2">
                                    <select
                                        value={ing.ingredient_id}
                                        onChange={(e) => updateIngredient(index, 'ingredient_id', e.target.value)}
                                        className="flex-1 input-field"
                                        required
                                    >
                                        <option value="0">Select ingredient...</option>
                                        {availableIngredients.map((i) => (
                                            <option key={i.id} value={i.id}>
                                                {i.name}
                                            </option>
                                        ))}
                                    </select>

                                    <input
                                        type="number"
                                        value={ing.amount || ''}
                                        onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                                        className="w-24 input-field"
                                        placeholder="Amount"
                                        min="0"
                                        step="0.1"
                                        required
                                    />

                                    <select
                                        value={ing.unit}
                                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                                        className="w-24 input-field"
                                        required
                                    >
                                        <option value="g">g</option>
                                        <option value="ml">ml</option>
                                        <option value="unit">unit</option>
                                        <option value="cup">cup</option>
                                        <option value="tbsp">tbsp</option>
                                        <option value="tsp">tsp</option>
                                    </select>

                                    {ingredients.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeIngredient(index)}
                                            className="text-red-500 hover:text-red-700 px-3"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Instructions *</h2>
                        <textarea
                            name="instructions"
                            rows={10}
                            required
                            className="input-field"
                            placeholder="1. First, prepare the ingredients...&#10;2. Then, heat the pan...&#10;3. Finally, serve and enjoy!"
                            value={formData.instructions}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Recipe...' : 'Create Recipe'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/recipes')}
                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default CreateRecipe;
