import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity, Utensils, LineChart, MessageSquare, LayoutDashboard, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFitness } from '../context/FitnessContext';

export default function Layout() {
  const location = useLocation();
  const { user, signOut } = useFitness();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Diet Plan', path: '/diet', icon: Utensils },
    { name: 'Workout Plan', path: '/workout', icon: Activity },
    { name: 'Progress', path: '/progress', icon: LineChart },
    { name: 'AI Coach', path: '/coach', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* Mobile Navigation (Bottom) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1",
                  isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-900"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Navigation (Sidebar) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen sticky top-0">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            FitSync AI
          </span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-blue-50 text-blue-700 font-semibold shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-slate-400")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 m-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-700 font-bold">{user?.displayName?.[0] || 'U'}</span>
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-800 truncate">{user?.displayName || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button onClick={signOut} className="p-2 text-slate-500 hover:text-red-600 transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
