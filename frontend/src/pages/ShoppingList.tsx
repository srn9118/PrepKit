import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { mealPlanApi } from '../api/meal-plan';
import type { ShoppingListResponse } from '../types/meal-plan';
import Layout from '../components/Layout';
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

    const handlePrint = () => {
        window.print();
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

    if (!shoppingList || shoppingList.items.length === 0) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No ingredients needed</h2>
                    <p className="text-gray-600 mb-6">Add meals to your planner to generate a shopping list</p>
                    <Link
                        to="/planner"
                        className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-medium"
                    >
                        Go to Meal Planner
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to="/planner"
                        className="text-primary-600 hover:text-primary-700 font-medium mb-4 inline-block"
                    >
                        ← Back to Planner
                    </Link>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping List</h1>
                            <p className="text-gray-600">
                                {shoppingList.start_date} to {shoppingList.end_date}
                            </p>
                        </div>
                        <button
                            onClick={handlePrint}
                            className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition font-medium print:hidden"
                        >
                            🖨️ Print
                        </button>
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-primary-700 font-medium">Total Items</p>
                            <p className="text-2xl font-bold text-primary-900">{shoppingList.total_items}</p>
                        </div>
                        <div>
                            <p className="text-sm text-primary-700 font-medium">Checked Off</p>
                            <p className="text-2xl font-bold text-primary-900">
                                {checkedItems.size} / {shoppingList.total_items}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Shopping List Items */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h2>
                        <div className="space-y-2">
                            {shoppingList.items.map((item) => (
                                <div
                                    key={item.ingredient_id}
                                    onClick={() => toggleItem(item.ingredient_id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${checkedItems.has(item.ingredient_id)
                                        ? 'border-green-200 bg-green-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${checkedItems.has(item.ingredient_id)
                                            ? 'bg-green-500 border-green-500'
                                            : 'border-gray-300'
                                            }`}
                                    >
                                        {checkedItems.has(item.ingredient_id) && (
                                            <span className="text-white text-xs">✓</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <span
                                            className={`font-medium ${checkedItems.has(item.ingredient_id)
                                                ? 'text-gray-500 line-through'
                                                : 'text-gray-900'
                                                }`}
                                        >
                                            {item.ingredient_name}
                                        </span>
                                    </div>
                                    <div
                                        className={`font-semibold ${checkedItems.has(item.ingredient_id) ? 'text-gray-500' : 'text-gray-700'
                                            }`}
                                    >
                                        {item.total_amount} {item.unit}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">💡 Shopping Tips</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Check your pantry before shopping to avoid duplicates</li>
                        <li>• Organize items by store section for efficient shopping</li>
                        <li>• Consider buying fresh ingredients closer to meal day</li>
                    </ul>
                </div>
            </div>
        </Layout>
    );
};

export default ShoppingList;
