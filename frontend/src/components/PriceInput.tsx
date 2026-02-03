/**
 * PriceInput component
 * Input form for adding/updating ingredient prices
 */

import React, { useState } from 'react';
import type { Supermarket, UnitType } from '../types/price';

interface PriceInputProps {
    supermarkets: Supermarket[];
    onSubmit: (data: { supermarket_id: number; price_per_unit: number; unit: UnitType }) => void;
    onCancel?: () => void;
    defaultUnit?: UnitType;
    isLoading?: boolean;
}

const UNIT_OPTIONS: { value: UnitType; label: string }[] = [
    { value: 'kg', label: 'kg' },
    { value: 'L', label: 'L (litros)' },
    { value: 'unit', label: 'unidad' },
];

export const PriceInput: React.FC<PriceInputProps> = ({
    supermarkets,
    onSubmit,
    onCancel,
    defaultUnit = 'kg',
    isLoading = false,
}) => {
    const [supermarketId, setSupermarketId] = useState<number>(supermarkets[0]?.id || 0);
    const [price, setPrice] = useState<string>('');
    const [unit, setUnit] = useState<UnitType>(defaultUnit);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!supermarketId || !price || parseFloat(price) <= 0) return;

        onSubmit({
            supermarket_id: supermarketId,
            price_per_unit: parseFloat(price),
            unit,
        });

        // Reset form
        setPrice('');
    };

    const activeSupermarkets = supermarkets.filter((s) => s.is_active);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Supermarket Select */}
            <div>
                <label htmlFor="supermarket" className="block text-sm font-medium text-text-primary mb-2">
                    Supermercado
                </label>
                <select
                    id="supermarket"
                    value={supermarketId}
                    onChange={(e) => setSupermarketId(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-surface-elevated text-text-primary border border-surface-elevated focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    required
                >
                    {activeSupermarkets.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Price and Unit */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-text-primary mb-2">
                        Precio (€)
                    </label>
                    <input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="2.50"
                        className="w-full px-4 py-3 rounded-lg bg-surface-elevated text-text-primary border border-surface-elevated focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-text-primary mb-2">
                        Unidad
                    </label>
                    <select
                        id="unit"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value as UnitType)}
                        className="w-full px-4 py-3 rounded-lg bg-surface-elevated text-text-primary border border-surface-elevated focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                        {UNIT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 rounded-lg bg-surface-elevated text-text-primary font-medium hover:bg-surface transition-all"
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
                    disabled={isLoading || !price || parseFloat(price) <= 0}
                >
                    {isLoading ? 'Guardando...' : 'Guardar precio'}
                </button>
            </div>
        </form>
    );
};
