/**
 * SupermarketBadge component
 * Displays a supermarket name as a badge with color coding
 */

import React from 'react';

interface SupermarketBadgeProps {
    name: string;
    className?: string;
}

const SUPERMARKET_COLORS: Record<string, string> = {
    'Mercadona': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Carrefour': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Supeco': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Día': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Lidl': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Aldi': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

export const SupermarketBadge: React.FC<SupermarketBadgeProps> = ({ name, className = '' }) => {
    const colorClass = SUPERMARKET_COLORS[name] || 'bg-surface-elevated text-text-primary border-surface-elevated';

    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass} ${className}`}
        >
            {name}
        </span>
    );
};
