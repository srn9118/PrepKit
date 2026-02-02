import React from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.full_name}! 👋
          </h1>
          <p className="mt-2 text-gray-600">Here's your meal prep overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Calories</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{user?.daily_calories}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Protein</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{user?.daily_protein}g</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🥩</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Carbs</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{user?.daily_carbs}g</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🍞</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fats</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{user?.daily_fats}g</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🥑</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📝</span>
                  <div>
                    <p className="font-medium text-gray-900">Plan your meals</p>
                    <p className="text-sm text-gray-600">Schedule recipes for the week</p>
                  </div>
                </div>
              </button>

              <button className="w-full text-left px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🍳</span>
                  <div>
                    <p className="font-medium text-gray-900">Browse recipes</p>
                    <p className="text-sm text-gray-600">Find new meal ideas</p>
                  </div>
                </div>
              </button>

              <button className="w-full text-left px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🛒</span>
                  <div>
                    <p className="font-medium text-gray-900">Shopping list</p>
                    <p className="text-sm text-gray-600">Generate your grocery list</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">This Week's Plan</h2>
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">🗓️</p>
              <p>No meals planned yet</p>
              <p className="text-sm mt-1">Start planning your week!</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;