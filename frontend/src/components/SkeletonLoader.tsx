import React from 'react';

export const RecipeCardSkeleton: React.FC = () => {
    return (
        <div className="recipe-card animate-pulse">
            {/* Image skeleton */}
            <div className="h-48 bg-surface-elevated"></div>

            {/* Content skeleton */}
            <div className="p-4">
                {/* Title */}
                <div className="h-5 bg-surface-elevated rounded w-3/4 mb-3"></div>

                {/* Stats */}
                <div className="flex gap-4 mb-3">
                    <div className="h-4 bg-surface-elevated rounded w-16"></div>
                    <div className="h-4 bg-surface-elevated rounded w-16"></div>
                    <div className="h-4 bg-surface-elevated rounded w-12"></div>
                </div>

                {/* Tags */}
                <div className="flex gap-2 mb-3">
                    <div className="h-6 bg-surface-elevated rounded-full w-16"></div>
                    <div className="h-6 bg-surface-elevated rounded-full w-20"></div>
                </div>

                {/* Macros */}
                <div className="flex gap-2">
                    <div className="flex-1 h-12 bg-surface-elevated rounded-lg"></div>
                    <div className="flex-1 h-12 bg-surface-elevated rounded-lg"></div>
                    <div className="flex-1 h-12 bg-surface-elevated rounded-lg"></div>
                </div>
            </div>
        </div>
    );
};

export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Welcome */}
            <div>
                <div className="h-8 bg-surface-elevated rounded w-48 mb-2"></div>
                <div className="h-4 bg-surface-elevated rounded w-32"></div>
            </div>

            {/* Daily Summary Card */}
            <div className="card">
                <div className="h-6 bg-surface-elevated rounded w-32 mb-4"></div>

                {/* Circle skeleton */}
                <div className="flex justify-center mb-6">
                    <div className="w-48 h-48 bg-surface-elevated rounded-full"></div>
                </div>

                {/* Macro bars */}
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i}>
                            <div className="flex justify-between mb-2">
                                <div className="h-4 bg-surface-elevated rounded w-20"></div>
                                <div className="h-4 bg-surface-elevated rounded w-24"></div>
                            </div>
                            <div className="h-2 bg-surface-elevated rounded-full"></div>
                        </div>
                    ))}
                </div>

                {/* Remaining */}
                <div className="mt-4 p-3 bg-surface-elevated rounded-xl">
                    <div className="h-4 bg-background rounded w-24 mx-auto mb-2"></div>
                    <div className="h-8 bg-background rounded w-32 mx-auto"></div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <div className="h-6 bg-surface-elevated rounded w-32 mb-3"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-surface-elevated rounded-2xl"></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const SkeletonLoader: React.FC<{ type: 'recipe' | 'dashboard' }> = ({
    type,
}) => {
    if (type === 'recipe') {
        return (
            <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <RecipeCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    return <DashboardSkeleton />;
};

export default SkeletonLoader;
