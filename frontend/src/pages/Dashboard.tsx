import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import TopBar from '../components/TopBar';
import ProgressCircle from '../components/ProgressCircle';
import MacroBar from '../components/MacroBar';
import SkeletonLoader from '../components/SkeletonLoader';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Mock data - replace with real data later
  const dailyCalories = user?.daily_calories || 2000;
  const consumedCalories = 1450; // TODO: Get from meal plan

  const macros = {
    protein: { current: 85, goal: user?.daily_protein || 150 },
    carbs: { current: 180, goal: user?.daily_carbs || 250 },
    fats: { current: 45, goal: user?.daily_fats || 65 },
  };

  const quickActions = [
    {
      icon: '📝',
      title: 'Plan Meals',
      subtitle: 'Schedule your week',
      gradient: 'from-green-600 to-green-700',
      path: '/planner',
    },
    {
      icon: '🍳',
      title: 'Browse Recipes',
      subtitle: 'Find new ideas',
      gradient: 'from-orange-600 to-orange-700',
      path: '/recipes',
    },
    {
      icon: '🛒',
      title: 'Shopping List',
      subtitle: 'Get groceries',
      gradient: 'from-blue-600 to-blue-700',
      path: '/shopping-list',
    },
  ];

  return (
    <Layout>
      <TopBar title="PrepKit" />

      {loading ? (
        <div className="mt-6">
          <SkeletonLoader type="dashboard" />
        </div>
      ) : (
        <div className="space-y-6 mt-6">
          {/* Welcome Section */}
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              Hello, {user?.full_name?.split(' ')[0] || 'there'}! 👋
            </h2>
            <p className="text-text-secondary mt-1">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Daily Summary Card */}
          <div className="card">
            <h3 className="text-lg font-bold text-text-primary mb-4">
              Daily Summary
            </h3>

            {/* Calorie Progress Circle */}
            <div className="flex justify-center mb-6">
              <ProgressCircle
                current={consumedCalories}
                goal={dailyCalories}
                size={200}
                strokeWidth={12}
              />
            </div>

            {/* Macros Bars */}
            <div className="space-y-4">
              <MacroBar
                label="Protein"
                current={macros.protein.current}
                goal={macros.protein.goal}
                color="blue"
                icon="🥩"
              />
              <MacroBar
                label="Carbs"
                current={macros.carbs.current}
                goal={macros.carbs.goal}
                color="yellow"
                icon="🍞"
              />
              <MacroBar
                label="Fats"
                current={macros.fats.current}
                goal={macros.fats.goal}
                color="green"
                icon="🥑"
              />
            </div>

            {/* Remaining Calories */}
            <div className="mt-4 p-3 bg-surface-elevated rounded-xl text-center">
              <p className="text-sm text-text-secondary">Remaining Today</p>
              <p className="text-2xl font-bold text-primary">
                {dailyCalories - consumedCalories} kcal
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-3">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className={`bg-gradient-to-r ${action.gradient} rounded-2xl p-4 flex items-center gap-4 text-white hover:scale-[1.02] active:scale-95 transition-transform`}
                >
                  <div className="text-4xl">{action.icon}</div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-lg">{action.title}</p>
                    <p className="text-white/80 text-sm">{action.subtitle}</p>
                  </div>
                  <div className="text-2xl">→</div>
                </button>
              ))}
            </div>
          </div>

          {/* Today's Meals Preview */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-text-primary">
                Today's Meals
              </h3>
              <button
                onClick={() => navigate('/planner')}
                className="text-sm text-primary font-semibold"
              >
                View All →
              </button>
            </div>

            {/* Empty State */}
            <div className="card text-center py-12">
              <p className="text-6xl mb-3">🍽️</p>
              <p className="text-text-secondary">No meals planned for today</p>
              <button
                onClick={() => navigate('/planner')}
                className="mt-4 btn-primary inline-block"
              >
                Plan Your Day
              </button>
            </div>
          </div>

          {/* Nutrition Tips */}
          <div className="card bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h4 className="font-bold text-text-primary mb-1">Tip of the Day</h4>
                <p className="text-sm text-text-secondary">
                  Aim to eat protein with every meal to stay fuller longer and support muscle recovery.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;