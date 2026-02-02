// Date helper functions for meal planner

// Get Monday of the week containing the given date
export const getMonday = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};

// Format date as YYYY-MM-DD
export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

// Add days to a date
export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

// Get day name (short format)
export const getDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
};

// Get day number
export const getDayNumber = (date: Date): number => {
    return date.getDate();
};

// Get month name
export const getMonthName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short' });
};

// Check if two dates are the same day
export const isSameDay = (date1: Date, date2: Date): boolean => {
    return formatDate(date1) === formatDate(date2);
};

// Get week range string (e.g., "Feb 3 - Feb 9")
export const getWeekRangeString = (startDate: Date): string => {
    const endDate = addDays(startDate, 6);
    const startMonth = getMonthName(startDate);
    const endMonth = getMonthName(endDate);

    if (startMonth === endMonth) {
        return `${startMonth} ${getDayNumber(startDate)} - ${getDayNumber(endDate)}`;
    } else {
        return `${startMonth} ${getDayNumber(startDate)} - ${endMonth} ${getDayNumber(endDate)}`;
    }
};
