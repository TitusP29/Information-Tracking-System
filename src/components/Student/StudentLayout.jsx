import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from '../../../supabaseClient';
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  Bell,
  LogOut,
  BarChart3,
  Laptop,
  User,
  Menu,
  X,
  Home,
  Settings,
  BookOpen,
  Calendar,
  CreditCard
} from "lucide-react";

const StudentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/student',
      icon: LayoutDashboard,
      description: 'Overview of your academic progress'
    },
    {
      name: 'Application Intake',
      href: '/application-intake',
      icon: GraduationCap,
      description: 'Browse and apply for courses'
    },
    {
      name: 'Registration Progress',
      href: '/registration-progress',
      icon: BarChart3,
      description: 'Track your application status'
    },
    {
      name: 'Documents',
      href: '/documents',
      icon: FileText,
      description: 'Manage your academic documents'
    },
    {
      name: 'I-Enabler Dashboard',
      href: '/ienabler',
      icon: Laptop,
      description: 'Access I-Enabler learning platform'
    },
    {
      name: 'About Us',
      href: '/aboutus',
      icon: User,
      description: 'Learn more about our institution'
    }
  ];

  const isActiveRoute = (href) => {
    return location.pathname === href;
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 sm:w-80 bg-gradient-to-b from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out
        flex flex-col shadow-2xl
      `}>
        {/* Sidebar Header */}
        <div className="p-4 sm:p-6 border-b border-slate-700 dark:border-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl shadow-lg">
                <GraduationCap className="text-white" size={24} />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  GAS
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-300">
                  GRACE ARTISAN SCHOOL
                </div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 sm:px-4 py-4 sm:py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 rounded-2xl transition-all duration-200 w-full
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <div className={`
                  p-2 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-slate-700/50 text-slate-400 group-hover:bg-slate-600/50 group-hover:text-white'
                  }
                `}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm sm:text-base">{item.name}</div>
                  <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-700 dark:border-slate-600">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 text-red-400 hover:text-white hover:bg-red-500/20 rounded-2xl transition-all duration-200 group"
          >
            <div className="p-2 bg-red-500/20 rounded-xl group-hover:bg-red-500/30 transition-all duration-200">
              <LogOut size={20} />
            </div>
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0 min-w-0">
        {/* Top Navigation Bar */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 gap-2 sm:gap-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200"
            >
              <Menu size={24} />
            </button>

            {/* Page Title */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:block">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  Student Portal
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Welcome back to your learning journey
                </p>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="p-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all duration-200 relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700 rounded-2xl">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <User className="text-white" size={16} />
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Student
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-3 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;