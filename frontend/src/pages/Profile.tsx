import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import TopBar from '../components/TopBar';

const Profile: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const profileSections = [
        {
            title: 'Daily Goals',
            items: [
                { label: 'Calories', value: `${user?.daily_calories || 0} kcal`, icon: '🔥' },
                { label: 'Protein', value: `${user?.daily_protein || 0}g`, icon: '🥩' },
                { label: 'Carbs', value: `${user?.daily_carbs || 0}g`, icon: ' 🍞' },
                { label: 'Fats', value: `${user?.daily_fats || 0}g`, icon: '🥑' },
            ],
        },
    ];

    const settingsOptions = [
        { label: 'Edit Profile', icon: '✏️', action: () => { } },
        { label: 'Preferences', icon: '⚙️', action: () => { } },
        { label: 'About', icon: 'ℹ️', action: () => { } },
    ];

    return (
        <Layout>
            <TopBar title="Profile" />

            <div className="space-y-6 mt-6">
                {/* User Info Card */}
                <div className="card text-center">
                    <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white">
                        {user?.full_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary">
                        {user?.full_name || 'User'}
                    </h2>
                    <p className="text-text-secondary mt-1">{user?.email}</p>
                </div>

                {/* Daily Goals */}
                {profileSections.map((section, index) => (
                    <div key={index}>
                        <h3 className="text-lg font-bold text-text-primary mb-3">
                            {section.title}
                        </h3>
                        <div className="card">
                            <div className="grid grid-cols-2 gap-3">
                                {section.items.map((item, i) => (
                                    <div
                                        key={i}
                                        className="p-4 bg-surface-elevated rounded-xl text-center"
                                    >
                                        <div className="text-2xl mb-2">{item.icon}</div>
                                        <p className="text-sm text-text-secondary">{item.label}</p>
                                        <p className="text-lg font-bold text-text-primary mt-1">
                                            {item.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Settings */}
                <div>
                    <h3 className="text-lg font-bold text-text-primary mb-3">
                        Settings
                    </h3>
                    <div className="card space-y-2">
                        {settingsOptions.map((option, index) => (
                            <button
                                key={index}
                                onClick={option.action}
                                className="w-full flex items-center justify-between p-3 bg-surface-elevated rounded-lg hover:bg-surface transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{option.icon}</span>
                                    <span className="text-text-primary font-medium">
                                        {option.label}
                                    </span>
                                </div>
                                <span className="text-text-secondary">→</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full btn-secondary !bg-error/20 !text-error hover:!bg-error/30"
                >
                    Logout
                </button>

                {/* App Version */}
                <p className="text-center text-xs text-text-disabled">
                    PrepKit v1.0.0
                </p>
            </div>
        </Layout>
    );
};

export default Profile;
