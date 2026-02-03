import React from 'react';

interface MacroBarProps {
    label: string;
    current: number;
    goal: number;
    color: string;
    icon?: string;
    unit?: string;
}

const MacroBar: React.FC<MacroBarProps> = ({
    label,
    current,
    goal,
    color,
    icon = '',
    unit = 'g',
}) => {
    const percentage = Math.min((current / goal) * 100, 100);

    // Color mapping
    const colorMap: Record<string, string> = {
        blue: '#2196F3',
        yellow: '#FFC107',
        green: '#4CAF50',
        red: '#f44336',
        purple: '#9C27B0',
    };

    const barColor = colorMap[color] || color;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    {icon && <span className="text-sm">{icon}</span>}
                    <span className="text-sm font-medium text-text-primary">{label}</span>
                </div>
                <span className="text-sm font-semibold text-text-primary">
                    {Math.round(current)}{unit} / {goal}{unit}
                </span>
            </div>

            <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: barColor,
                    }}
                />
            </div>

            {/* Optional: Show percentage */}
            {percentage > 100 && (
                <p className="text-xs text-warning mt-1">
                    {Math.round(percentage)}% - Over goal
                </p>
            )}
        </div>
    );
};

export default MacroBar;
