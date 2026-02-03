import React from 'react';

interface ProgressCircleProps {
    current: number;
    goal: number;
    size?: number;
    strokeWidth?: number;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
    current,
    goal,
    size = 200,
    strokeWidth = 12,
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const percentage = Math.min((current / goal) * 100, 100);
    const offset = circumference - (percentage / 100) * circumference;

    // Color based on percentage
    const getColor = () => {
        if (percentage >= 90) return '#f44336'; // Red - over/near goal
        if (percentage >= 70) return '#ff9800'; // Orange - getting close
        return '#4CAF50'; // Green - good
    };

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#3a3a3a"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={getColor()}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-center">
                    <p className="text-4xl font-bold" style={{ color: getColor() }}>
                        {Math.round(current)}
                    </p>
                    <p className="text-sm text-text-secondary mt-1">
                        / {goal} kcal
                    </p>
                    <p className="text-xs text-text-disabled mt-1">
                        {Math.round(percentage)}%
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProgressCircle;
