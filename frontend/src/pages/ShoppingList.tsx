import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { mealPlanApi } from '../api/meal-plan';
import { pricesApi } from '../api/prices';
import type { ShoppingListResponse } from '../types/meal-plan';
import type { OptimizedShoppingListResponse, IngredientPrice } from '../types/price';
import Layout from '../components/Layout';
import TopBar from '../components/TopBar';
import { SupermarketBadge } from '../components/SupermarketBadge';
import { PriceComparisonModal } from '../components/PriceComparisonModal';
import { getMonday, formatDate, addDays } from '../utils/dateHelpers';

type ViewMode = 'normal' | 'optimized';

const ShoppingList: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [shoppingList, setShoppingList] = useState<ShoppingListResponse | null>(null);
    const [optimizedList, setOptimizedList] = useState<OptimizedShoppingListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
    const [viewMode, setViewMode] = useState<ViewMode>('normal');
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [selectedIngredientPrices, setSelectedIngredientPrices] = useState<IngredientPrice[]>([]);
    const [selectedIngredientName, setSelectedIngredientName] = useState('');

    // Get dates from location state or default to current week
    const defaultStart = getMonday(new Date());
    const defaultEnd = addDays(defaultStart, 6);

    const [startDate] = useState(
        location.state?.startDate || formatDate(defaultStart)
    );
    const [endDate] = useState(
        location.state?.endDate || formatDate(defaultEnd)
    );

    useEffect(() => {
        loadShoppingList();
    }, [startDate, endDate]);

    const loadShoppingList = async () => {
        setLoading(true);
        try {
            const [normalData, optimizedData] = await Promise.all([
                mealPlanApi.getShoppingList(startDate, endDate),
                mealPlanApi.getOptimizedShoppingList(startDate, endDate),
            ]);
            setShoppingList(normalData);
            setOptimizedList(optimizedData);
        } catch (error) {
            console.error('Failed to load shopping list:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = (ingredientId: number) => {
        const newChecked = new Set(checkedItems);
        if (newChecked.has(ingredientId)) {
            newChecked.delete(ingredientId);
        } else {
            newChecked.add(ingredientId);
        }
        setCheckedItems(newChecked);
    };

    const clearCheckedItems = () => {
        if (checkedItems.size === 0) return;
        if (!window.confirm(`Clear ${checkedItems.size} checked items?`)) return;
        setCheckedItems(new Set());
    };

    const handlePrint = () => {
        window.print();
    };

    const handleViewPriceComparison = async (ingredientId: number, ingredientName: string) => {
        try {
            const prices = await pricesApi.getForIngredient(ingredientId);
            setSelectedIngredientPrices(prices);
            setSelectedIngredientName(ingredientName);
            setShowPriceModal(true);
        } catch (error) {
            console.error('Error loading prices:', error);
        }
    };

    if (loading) {
        return (
            <Layout>
                <TopBar title="Shopping List" showBack />
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </Layout>
        );
    }

    if (!shoppingList || shoppingList.items.length === 0) {
        return (
            <Layout>
                <TopBar title="Shopping List" showBack />
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">
                        No ingredients needed
                    </h2>
                    <p className="text-text-secondary mb-6">
                        Add meals to your planner to generate a shopping list
                    </p>
                    <Link to="/planner" className="btn-primary inline-block">
                        Go to Meal Planner
                    </Link>
                </div>
            </Layout>
        );
    }

    const checkedCount = checkedItems.size;
    const totalCount = shoppingList.total_items;
    const uncheckedItems = shoppingList.items.filter(
        (item) => !checkedItems.has(item.ingredient_id)
    );
    const checkedItemsList = shoppingList.items.filter((item) =>
        checkedItems.has(item.ingredient_id)
    );

    const hasPrices = optimizedList && optimizedList.items_with_prices > 0;

    return (
        <Layout>
            <TopBar
                title="Shopping List"
                showBack
                rightButton={
                    <button
                        onClick={handlePrint}
                        className="text-text-primary hover:text-primary transition-colors print:hidden"
                        title="Print"
                    >
                        <span className="text-xl">🖨️</span>
                    </button>
                }
            />

            <div className="space-y-4">
                {/* View Toggle */}
                <div className="card p-1 flex gap-1 print:hidden">
                    <button
                        onClick={() => setViewMode('normal')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'normal'
                            ? 'bg-primary text-white'
                            : 'text-text-primary hover:bg-surface-elevated'
                            }`}
                    >
                        📋 Normal
                    </button>
                    <button
                        onClick={() => setViewMode('optimized')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'optimized'
                            ? 'bg-primary text-white'
                            : 'text-text-primary hover:bg-surface-elevated'
                            }`}
                    >
                        💰 Optimizada
                    </button>
                </div>

                {/* Week Range */}
                <div className="card p-4">
                    <p className="text-sm text-text-secondary">
                        {new Date(startDate).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                        })}{' '}
                        -{' '}
                        {new Date(endDate).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </p>
                </div>

                {/* NORMAL VIEW */}
                {viewMode === 'normal' && (
                    <>
                        {/* Progress */}
                        <div className="card p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-text-secondary">Progress</span>
                                <span className="text-sm font-medium text-text-primary">
                                    {checkedCount}/{totalCount} items
                                </span>
                            </div>
                            <div className="w-full bg-surface-elevated rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Unchecked Items */}
                        {uncheckedItems.length > 0 && (
                            <div className="card p-4">
                                <h3 className="font-semibold text-text-primary mb-3">
                                    To Buy ({uncheckedItems.length})
                                </h3>
                                <div className="space-y-2">
                                    {uncheckedItems.map((item) => (
                                        <div
                                            key={item.ingredient_id}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-elevated transition-colors"
                                        >
                                            <button
                                                onClick={() => toggleItem(item.ingredient_id)}
                                                className="w-6 h-6 flex-shrink-0 rounded border-2 border-surface-elevated hover:border-primary transition-all"
                                            />
                                            <div className="flex-1">
                                                <p className="text-text-primary font-medium">
                                                    {item.ingredient_name}
                                                </p>
                                                <p className="text-sm text-text-secondary">
                                                    {item.total_amount.toFixed(0)} {item.unit}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Checked Items */}
                        {checkedItemsList.length > 0 && (
                            <div className="card p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-text-primary">
                                        Checked ({checkedItemsList.length})
                                    </h3>
                                    <button
                                        onClick={clearCheckedItems}
                                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        Clear checked
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {checkedItemsList.map((item) => (
                                        <div
                                            key={item.ingredient_id}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-elevated transition-colors opacity-50"
                                        >
                                            <button
                                                onClick={() => toggleItem(item.ingredient_id)}
                                                className="w-6 h-6 flex-shrink-0 rounded bg-primary border-2 border-primary flex items-center justify-center transition-all"
                                            >
                                                <span className="text-white text-xs">✓</span>
                                            </button>
                                            <div className="flex-1">
                                                <p className="text-text-primary font-medium line-through">
                                                    {item.ingredient_name}
                                                </p>
                                                <p className="text-sm text-text-secondary line-through">
                                                    {item.total_amount.toFixed(0)} {item.unit}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* OPTIMIZED VIEW */}
                {viewMode === 'optimized' && (
                    <>
                        {!hasPrices ? (
                            <div className="card p-6 text-center">
                                <div className="text-6xl mb-4">💰</div>
                                <h3 className="text-xl font-bold text-text-primary mb-2">
                                    No prices added yet
                                </h3>
                                <p className="text-text-secondary mb-4">
                                    Add prices in the Prices tab 💰 to see price recommendations and save money
                                </p>
                                <button
                                    onClick={() => navigate('/prices')}
                                    className="btn-primary inline-block"
                                >
                                    Go to Prices
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Recommendation Card */}
                                <div className="card p-4 bg-primary/10 border border-primary/30">
                                    <h3 className="font-semibold text-primary mb-2">💡 Recommendation</h3>
                                    <p className="text-sm text-text-primary">
                                        {optimizedList.recommended_distribution}
                                    </p>
                                    {optimizedList.potential_savings && (
                                        <p className="text-xs text-text-secondary mt-2">
                                            {optimizedList.potential_savings}
                                        </p>
                                    )}
                                </div>

                                {/* Supermarket Totals */}
                                {optimizedList.supermarket_totals.length > 0 && (
                                    <div className="card p-4">
                                        <h3 className="font-semibold text-text-primary mb-3">
                                            Totals by Supermarket
                                        </h3>
                                        <div className="space-y-2">
                                            {optimizedList.supermarket_totals.map((total) => (
                                                <div
                                                    key={total.supermarket_id}
                                                    className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <SupermarketBadge name={total.supermarket_name} />
                                                        <span className="text-xs text-text-secondary">
                                                            ({total.item_count} items)
                                                        </span>
                                                    </div>
                                                    <span className="text-lg font-bold text-primary">
                                                        €{Number(total.total_price).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-surface-elevated flex items-center justify-between">
                                            <span className="font-semibold text-text-primary">Total</span>
                                            <span className="text-xl font-bold text-primary">
                                                €{Number(optimizedList.total_optimized).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Optimized Items List */}
                                <div className="card p-4">
                                    <h3 className="font-semibold text-text-primary mb-3">
                                        Shopping List ({optimizedList.total_items} items)
                                    </h3>
                                    <div className="space-y-2">
                                        {optimizedList.items.map((item) => (
                                            <div
                                                key={item.ingredient_id}
                                                className="p-3 rounded-lg bg-surface-elevated"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-text-primary">
                                                            {item.ingredient_name}
                                                        </p>
                                                        <p className="text-sm text-text-secondary">
                                                            {item.total_amount.toFixed(0)} {item.unit}
                                                        </p>
                                                    </div>
                                                    {item.cheapest_price && (
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-primary">
                                                                €{Number(item.total_cost).toFixed(2)}
                                                            </p>
                                                            <p className="text-xs text-text-secondary">
                                                                €{Number(item.cheapest_price).toFixed(2)}/{item.unit}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                {item.cheapest_supermarket ? (
                                                    <div className="flex items-center justify-between">
                                                        <SupermarketBadge name={item.cheapest_supermarket} />
                                                        <button
                                                            onClick={() =>
                                                                handleViewPriceComparison(
                                                                    item.ingredient_id,
                                                                    item.ingredient_name
                                                                )
                                                            }
                                                            className="text-xs text-primary hover:underline"
                                                        >
                                                            Compare prices
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-text-secondary italic">
                                                        No prices available
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Price Comparison Modal */}
            {showPriceModal && (
                <PriceComparisonModal
                    ingredientName={selectedIngredientName}
                    prices={selectedIngredientPrices}
                    onClose={() => setShowPriceModal(false)}
                />
            )}
        </Layout>
    );
};

export default ShoppingList;
