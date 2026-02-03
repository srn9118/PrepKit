import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { mealPlanApi } from '../api/meal-plan';
import type { ShoppingListResponse } from '../types/meal-plan';
import Layout from '../components/Layout';
import TopBar from '../components/TopBar';
import { getMonday, formatDate, addDays } from '../utils/dateHelpers';

const ShoppingList: React.FC = () => {
    const location = useLocation();
    const [shoppingList, setShoppingList] = useState<ShoppingListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

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
            const data = await mealPlanApi.getShoppingList(startDate, endDate);
            setShoppingList(data);
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

    return (
        <Layout>
            <TopBar
                title="Shopping List"
                showBack
                actions={
                    <button
                        onClick={handlePrint}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-elevated transition-colors print:hidden"
                    >
                        <span className="text-xl">🖨️</span>
                    </button>
                }
            />

            <div className="space-y-4 mt-6">
                {/* Week Range */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-text-secondary uppercase tracking-wide">
                                Week Range
                            </p>
                            <p className="text-sm font-semibold text-text-primary mt-1">
                                {new Date(startDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                })}{' '}
                                -{' '}
                                {new Date(endDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-text-secondary uppercase tracking-wide">
                                Progress
                            </p>
                            <p className="text-2xl font-bold text-primary mt-1">
                                {Math.round((checkedCount / totalCount) * 100)}%
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 h-2 bg-surface-elevated rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500 rounded-full"
                            style={{ width: `${(checkedCount / totalCount) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="card text-center">
                        <p className="text-sm text-text-secondary">Total Items</p>
                        <p className="text-3xl font-bold text-text-primary mt-1">
                            {totalCount}
                        </p>
                    </div>
                    <div className="card text-center">
                        <p className="text-sm text-text-secondary">Checked</p>
                        <p className="text-3xl font-bold text-primary mt-1">
                            {checkedCount}
                        </p>
                    </div>
                </div>

                {/* Clear Checked Button */}
                {checkedCount > 0 && (
                    <button
                        onClick={clearCheckedItems}
                        className="w-full py-3 bg-error/20 text-error font-semibold rounded-xl hover:bg-error/30 transition-colors"
                    >
                        Clear {checkedCount} Checked Item{checkedCount !== 1 ? 's' : ''}
                    </button>
                )}

                {/* Unchecked Items */}
                {uncheckedItems.length > 0 && (
                    <div>
                        <h2 className="text-lg font-bold text-text-primary mb-3">
                            To Buy ({uncheckedItems.length})
                        </h2>
                        <div className="space-y-2">
                            {uncheckedItems.map((item) => (
                                <div
                                    key={item.ingredient_id}
                                    onClick={() => toggleItem(item.ingredient_id)}
                                    className="card flex items-center gap-4 cursor-pointer hover:bg-surface-elevated transition-all active:scale-[0.98]"
                                >
                                    {/* Checkbox */}
                                    <div className="w-6 h-6 rounded-lg border-2 border-border flex items-center justify-center flex-shrink-0">
                                        {/* Empty */}
                                    </div>

                                    {/* Item Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-text-primary">
                                            {item.ingredient_name}
                                        </p>
                                    </div>

                                    {/* Amount */}
                                    <div className="font-bold text-primary text-right">
                                        {item.total_amount} {item.unit}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Checked Items */}
                {checkedItemsList.length > 0 && (
                    <div>
                        <h2 className="text-lg font-bold text-text-secondary mb-3">
                            Checked ({checkedItemsList.length})
                        </h2>
                        <div className="space-y-2">
                            {checkedItemsList.map((item) => (
                                <div
                                    key={item.ingredient_id}
                                    onClick={() => toggleItem(item.ingredient_id)}
                                    className="card flex items-center gap-4 cursor-pointer opacity-50 hover:opacity-70 transition-all active:scale-[0.98]"
                                >
                                    {/* Checkbox - Checked */}
                                    <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-sm">✓</span>
                                    </div>

                                    {/* Item Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-text-secondary line-through">
                                            {item.ingredient_name}
                                        </p>
                                    </div>

                                    {/* Amount */}
                                    <div className="font-bold text-text-secondary line-through text-right">
                                        {item.total_amount} {item.unit}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tips Card */}
                <div className="card bg-primary/10 border border-primary/20">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                            <h3 className="font-bold text-text-primary mb-2">
                                Shopping Tips
                            </h3>
                            <ul className="text-sm text-text-secondary space-y-1">
                                <li>• Check your pantry before shopping</li>
                                <li>• Group items by store section</li>
                                <li>• Buy fresh ingredients closer to meal day</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
        @media print {
          body {
            background: white !important;
          }
          .card {
            background: white !important;
            border: 1px solid #ccc !important;
          }
        }
      `}</style>
        </Layout>
    );
};

export default ShoppingList;
