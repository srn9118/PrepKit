/**
 * PriceComparisonModal component
 * Modal displaying price comparison across supermarkets for an ingredient
 */

import React from 'react';
import type { IngredientPrice } from '../types/price';
import { SupermarketBadge } from './SupermarketBadge';

interface PriceComparisonModalProps {
    ingredientName: string;
    prices: IngredientPrice[];
    onClose: () => void;
    onAddPrice?: () => void;
}

export const PriceComparisonModal: React.FC<PriceComparisonModalProps> = ({
    ingredientName,
    prices,
    onClose,
    onAddPrice,
}) => {
    const sortedPrices = [...prices].sort((a, b) => Number(a.price_per_unit) - Number(b.price_per_unit));
    const cheapestPrice = sortedPrices[0];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-xl">
                {/* Header */}
                <div className="sticky top-0 bg-surface border-b border-surface-elevated px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-text-primary">{ingredientName}</h2>
                            <p className="text-sm text-text-secondary mt-1">
                                Comparación de precios
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-surface-elevated hover:bg-surface flex items-center justify-center transition-all"
                        >
                            <span className="text-text-secondary text-xl">×</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {sortedPrices.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-text-secondary mb-4">No hay precios registrados</p>
                            {onAddPrice && (
                                <button
                                    onClick={onAddPrice}
                                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all"
                                >
                                    Añadir precio
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Cheapest price highlight */}
                            {cheapestPrice && (
                                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-primary uppercase">
                                            💰 Más barato
                                        </span>
                                        <SupermarketBadge name={cheapestPrice.supermarket_name} />
                                    </div>
                                    <p className="text-2xl font-bold text-text-primary">
                                        €{Number(cheapestPrice.price_per_unit).toFixed(2)}
                                        <span className="text-sm text-text-secondary font-normal ml-1">
                                            / {cheapestPrice.unit}
                                        </span>
                                    </p>
                                </div>
                            )}

                            {/* All prices list */}
                            <div className="space-y-2">
                                {sortedPrices.map((price, index) => {
                                    const isCheapest = index === 0;
                                    const priceDiff =
                                        index > 0
                                            ? ((Number(price.price_per_unit) - Number(cheapestPrice.price_per_unit)) / Number(cheapestPrice.price_per_unit)) * 100
                                            : 0;

                                    return (
                                        <div
                                            key={price.id}
                                            className={`p-4 rounded-lg border transition-all ${isCheapest
                                                ? 'bg-primary/5 border-primary/20'
                                                : 'bg-surface-elevated border-surface-elevated hover:border-surface'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <SupermarketBadge name={price.supermarket_name} />
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-text-primary">
                                                        €{Number(price.price_per_unit).toFixed(2)}
                                                        <span className="text-xs text-text-secondary ml-1">
                                                            / {price.unit}
                                                        </span>
                                                    </p>
                                                    {!isCheapest && priceDiff > 0 && (
                                                        <p className="text-xs text-red-400">
                                                            +{priceDiff.toFixed(0)}%
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-text-secondary">
                                                Actualizado: {new Date(price.updated_at).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Add price button */}
                            {onAddPrice && (
                                <button
                                    onClick={onAddPrice}
                                    className="w-full px-4 py-3 bg-surface-elevated text-text-primary rounded-lg font-medium hover:bg-surface transition-all"
                                >
                                    + Añadir precio
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
