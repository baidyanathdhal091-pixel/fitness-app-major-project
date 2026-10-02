import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarDays,
  Dumbbell,
  Apple,
  Utensils,
  FileText,
  TrendingUp,
  CheckSquare,
  User,
  Settings,
  Heart,
  LogOut,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/today', label: "Today's Plan", icon: CalendarDays },
  { to: '/workout', label: 'Workout', icon: Dumbbell },
  { to: '/nutrition', label: 'Nutrition', icon: Apple },
  { to: '/meal-plan', label: 'Meal Plan', icon: Utensils },
  { to: '/mess-optimizer', label: 'Mess Optimizer', icon: FileText },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/habits', label: 'Habits', icon: CheckSquare },
  { to: '/health-profile', label: 'Health Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { profile, clearAllData } = useApp();
  const navigate = useNavigate();

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      clearAllData();
      navigate('/');
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-200 dark:border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
          <Heart className="w-5 h-5 text-white" fill="white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white leading-none">Health Nova</h1>
          <p className="text-[10px] text-slate-400 mt-0.5">Fitness & Wellness</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-8 bg-emerald-500 rounded-r-full"
                    style={{ marginLeft: '-12px' }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs text-slate-400">Signed in as</p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
            {profile?.name || 'User'}
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          Reset All Data
        </button>
      </div>
    </aside>
  );
}
