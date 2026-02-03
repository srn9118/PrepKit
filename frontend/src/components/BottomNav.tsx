import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavItem {
    label: string;
    path: string;
    icon: string;
}

const BottomNav: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems: NavItem[] = [
        { label: 'Home', path: '/dashboard', icon: '🏠' },
        { label: 'Recipes', path: '/recipes', icon: '🍳' },
        { label: 'Planner', path: '/planner', icon: '📅' },
        { label: 'Profile', path: '/profile', icon: '👤' },
    ];

    const isActive = (path: string): boolean => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50 safe-area-bottom">
            <div className="max-w-md mx-auto">
                <div className="grid grid-cols-4 h-16">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`flex flex-col items-center justify-center gap-1 transition-all ${active
                                        ? 'text-primary'
                                        : 'text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                <span className="text-2xl">{item.icon}</span>
                                <span className={`text-xs ${active ? 'font-semibold' : 'font-normal'}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default BottomNav;
