/**
 * PriceManager page
 * Manage ingredient prices and exclusions
 */

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import TopBar from '../components/TopBar';
import { supermarketsApi } from '../api/supermarkets';
import { pricesApi } from '../api/prices';
import { exclusionsApi } from '../api/exclusions';
import { recipesApi } from '../api/recipes';
import type { Supermarket, IngredientPrice, Exclusion } from '../types/price';
import type { Ingredient } from '../types/recipe';
import { SupermarketBadge } from '../components/SupermarketBadge';
import { PriceInput } from '../components/PriceInput';
import { PriceComparisonModal } from '../components/PriceComparisonModal';

export const PriceManager: React.FC = () => {
    const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
    const [prices, setPrices] = useState<IngredientPrice[]>([]);
    const [exclusions, setExclusions] = useState<Exclusion[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddPrice, setShowAddPrice] = useState(false);
    const [showPriceComparison, setShowPriceComparison] = useState(false);

    // Load initial data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [supermarketsData, ingredientsData, exclusionsData] = await Promise.all([
                supermarketsApi.getAll(true),
                recipesApi.getIngredients(),
                exclusionsApi.getMy(),
            ]);
            setSupermarkets(supermarketsData);
            setIngredients(ingredientsData);
            setExclusions(exclusionsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPricesForIngredient = async (ingredientId: number) => {
        try {
            const pricesData = await pricesApi.getForIngredient(ingredientId);
            setPrices(pricesData);
        } catch (error) {
            console.error('Error loading prices:', error);
            setPrices([]);
        }
    };

    const handleIngredientSelect = async (ingredient: Ingredient) => {
        setSelectedIngredient(ingredient);
        await loadPricesForIngredient(ingredient.id);
        setShowPriceComparison(true);
    };

    const handleAddPrice = async (data: {
        supermarket_id: number;
        price_per_unit: number;
        unit: 'kg' | 'L' | 'unit';
    }) => {
        if (!selectedIngredient) return;

        try {
            await pricesApi.upsert({
                ingredient_id: selectedIngredient.id,
                ...data,
            });
            // Reload prices
            await loadPricesForIngredient(selectedIngredient.id);
            setShowAddPrice(false);
        } catch (error) {
            console.error('Error adding price:', error);
        }
    };

    const handleRemoveExclusion = async (exclusionId: number) => {
        try {
            await exclusionsApi.delete(exclusionId);
            // Reload exclusions
            const exclusionsData = await exclusionsApi.getMy();
            setExclusions(exclusionsData);
        } catch (error) {
            console.error('Error removing exclusion:', error);
        }
    };

    if (loading) {
        return (
            <Layout>
                <TopBar title="Precios" />
                <div className="flex items-center justify-center h-64">
                    <div className="text-text-secondary">Cargando...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <TopBar title="Gestión de Precios" />

            <div className="space-y-6">
                {/* Header info */}
                <div className="card p-4">
                    <h2 className="font-semibold text-text-primary mb-2">💰 Comparador de Precios</h2>
                    <p className="text-sm text-text-secondary">
                        Añade precios de ingredientes para optimizar tu lista de la compra
                    </p>
                </div>

                {/* Supermarkets */}
                <div className="card p-4">
                    <h3 className="font-semibold text-text-primary mb-3">Supermercados disponibles</h3>
                    <div className="flex flex-wrap gap-2">
                        {supermarkets.map((s) => (
                            <SupermarketBadge key={s.id} name={s.name} />
                        ))}
                    </div>
                </div>

                {/* Ingredients list */}
                <div className="card p-4">
                    <h3 className="font-semibold text-text-primary mb-3">Ingredientes</h3>
                    <p className="text-sm text-text-secondary mb-4">
                        Selecciona un ingrediente para ver o añadir precios
                    </p>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {ingredients.map((ingredient) => (
                            <button
                                key={ingredient.id}
                                onClick={() => handleIngredientSelect(ingredient)}
                                className="w-full text-left px-4 py-3 rounded-lg bg-surface-elevated hover:bg-surface border border-surface-elevated hover:border-primary/30 transition-all"
                            >
                                <p className="font-medium text-text-primary">{ingredient.name}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Exclusions */}
                {exclusions.length > 0 && (
                    <div className="card p-4">
                        <h3 className="font-semibold text-text-primary mb-3">
                            🚫 Exclusiones ({exclusions.length})
                        </h3>
                        <p className="text-sm text-text-secondary mb-4">
                            Ingredientes que prefieres no comprar en ciertos supermercados
                        </p>
                        <div className="space-y-2">
                            {exclusions.map((exclusion) => (
                                <div
                                    key={exclusion.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated"
                                >
                                    <div>
                                        <p className="font-medium text-text-primary text-sm">
                                            {exclusion.ingredient_name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <SupermarketBadge name={exclusion.supermarket_name} className="text-xs" />
                                            {exclusion.reason && (
                                                <span className="text-xs text-text-secondary">• {exclusion.reason}</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveExclusion(exclusion.id)}
                                        className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                    >
                                        Quitar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Price Comparison Modal */}
            {showPriceComparison && selectedIngredient && (
                <PriceComparisonModal
                    ingredientName={selectedIngredient.name}
                    prices={prices}
                    onClose={() => {
                        setShowPriceComparison(false);
                        setShowAddPrice(false);
                    }}
                    onAddPrice={() => setShowAddPrice(true)}
                />
            )}

            {/* Add Price Modal */}
            {showAddPrice && selectedIngredient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-text-primary mb-4">
                            Añadir precio: {selectedIngredient.name}
                        </h2>
                        <PriceInput
                            supermarkets={supermarkets}
                            onSubmit={handleAddPrice}
                            onCancel={() => setShowAddPrice(false)}
                            defaultUnit="kg"
                        />
                    </div>
                </div>
            )}
        </Layout>
    );
};
