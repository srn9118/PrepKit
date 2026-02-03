import React from 'react';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
    title: string;
    showBack?: boolean;
    actions?: React.ReactNode;
    transparent?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
    title,
    showBack = false,
    actions,
    transparent = false,
}) => {
    const navigate = useNavigate();

    return (
        <header
            className={`sticky top-0 z-40 ${transparent
                    ? 'bg-background/80 backdrop-blur-md'
                    : 'bg-surface border-b border-border'
                }`}
        >
            <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
                {/* Left side - Back button or empty space */}
                <div className="w-10">
                    {showBack && (
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-elevated transition-colors"
                        >
                            <span className="text-xl">←</span>
                        </button>
                    )}
                </div>

                {/* Center - Title */}
                <h1 className="text-lg font-bold text-text-primary truncate px-4">
                    {title}
                </h1>

                {/* Right side - Actions */}
                <div className="w-10 flex items-center justify-end">
                    {actions}
                </div>
            </div>
        </header>
    );
};

export default TopBar;
