import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Home,
  CalendarDays,
  BookOpen,
  Bell,
  FileText,
  GraduationCap,
  Briefcase,
  Activity,
  User,
  Sun,
  Moon,
  LogOut,
  ClipboardList,
  Users,
  Settings,
  RefreshCw,
  Mail,
  Volume2,
  Monitor,
  Minimize2,
  Palette,
  Globe,
  RotateCcw,
  CheckCircle,
  Clock,
  XCircle,
  Award
} from 'lucide-react';
import Notifications from './Notifications';
import RegProgress from './RegProgress';
import ViewReg from './ViewReg';
import ManageCourse from './ManageCourse';
import ManageStudent from './ManageStudent';

import { supabase } from '../../../supabaseClient';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('adminSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      notifications: true,
      autoRefresh: false,
      darkMode: false,
      emailNotifications: true,
      soundNotifications: true,
      compactMode: false,
      theme: 'system',
      language: 'en'
    };
  });
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    inProgress: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    
    // Apply theme changes
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply compact mode
    if (settings.compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
  }, [settings]);

  const handleSettingsChange = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleThemeChange = (theme) => {
    setSettings(prev => ({
      ...prev,
      theme
    }));
  };

  const handleLanguageChange = (language) => {
    setSettings(prev => ({
      ...prev,
      language
    }));
  };

  const handleResetSettings = () => {
    const defaultSettings = {
      notifications: true,
      autoRefresh: false,
      darkMode: false,
      emailNotifications: true,
      soundNotifications: true,
      compactMode: false,
      theme: 'system',
      language: 'en'
    };
    setSettings(defaultSettings);
  };

  const handleRefreshData = () => {
    window.location.reload();
  };

  const tabs = [
    {
      label: 'Notifications',
      icon: <Bell size={16} />,
      activeClass: 'bg-blue-500 text-white',
      inactiveClass: 'bg-blue-100 text-blue-800',
    },
    {
      label: 'Registration Progress',
      icon: <ClipboardList size={16} />,
      activeClass: 'bg-emerald-700 text-white',
      inactiveClass: 'bg-emerald-100 text-emerald-800',
    },
    {
      label: 'View Registration',
      icon: <CalendarDays size={16} />,
      activeClass: 'bg-emerald-700 text-white',
      inactiveClass: 'bg-emerald-100 text-emerald-800',
    },
    {
      label: 'Manage Course Applications',
      icon: <CalendarDays size={16} />,
      activeClass: 'bg-emerald-700 text-white',
      inactiveClass: 'bg-emerald-100 text-emerald-800',
    },
    {
      label: 'Manage Students',
      icon: <Users size={16} />,
      activeClass: 'bg-blue-500 text-white',
      inactiveClass: 'bg-blue-100 text-blue-800',
      variant: 'secondary',
    },
  ];

  const handleLogout = () => {
    // Add token/session clearing here if needed in the future
    navigate('/');
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all registrations with their progress
      const { data: registrations, error } = await supabase
        .from('register')
        .select('*, progress_management(*)');

      if (error) throw error;

      // Calculate statistics
      const stats = {
        total: registrations.length,
        approved: registrations.filter(r => r.progress_management?.application_review === 'approved').length,
        inProgress: registrations.filter(r => r.progress_management?.application_review === 'in_progress').length,
        rejected: registrations.filter(r => r.progress_management?.application_review === 'rejected').length
      };

      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- UI Refactor Start ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 text-blue-700 dark:text-cyan-400">Admin Dashboard</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-xl p-6 animate-pulse flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full mb-3" />
                <div className="w-24 h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
                <div className="w-10 h-6 bg-gray-200 dark:bg-gray-600 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${settings.darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <aside className="w-full md:w-72 min-h-[60px] md:min-h-screen bg-[#1e293b] text-white flex flex-row md:flex-col py-4 md:py-8 px-3 md:px-6 shadow-xl overflow-x-auto md:overflow-y-auto">
        <div className="text-center text-3xl font-bold text-cyan-400 mb-2 tracking-wide hidden md:block">GAS</div>
        <div className="text-center text-lg font-semibold mb-8 hidden md:block">ADMIN PANEL</div>
        <nav className="flex flex-row md:flex-col gap-1 w-full">
          <button
            className={`flex items-center w-full px-2 md:px-4 py-2 md:py-3 mb-2 rounded-xl hover:bg-cyan-800/80 transition-colors text-left gap-2 md:gap-3 text-sm md:text-base ${activeTab === null ? 'bg-cyan-800/90 font-bold' : ''}`}
            onClick={() => setActiveTab(null)}
          >
            <Home className="text-cyan-400" /> Dashboard
          </button>
          <button
            className="flex items-center w-full px-2 md:px-4 py-2 md:py-3 mb-2 rounded-xl hover:bg-blue-800/80 transition-colors text-left gap-2 md:gap-3 text-sm md:text-base"
            onClick={() => navigate('/enrolled-students')}
          >
            <ClipboardList className="text-blue-400" size={18} /> Enrolled Students
          </button>
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              className={`flex items-center w-full px-2 md:px-4 py-2 md:py-3 mb-2 rounded-xl hover:bg-gray-700/80 transition-colors text-left gap-2 md:gap-3 text-sm md:text-base ${activeTab === idx ? 'bg-gray-700/90 font-bold' : ''}`}
              onClick={() => setActiveTab(idx)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
          <button onClick={() => setShowSettings(true)} className="flex items-center px-2 md:px-4 py-2 md:py-3 hover:bg-gray-700/80 rounded-xl text-left gap-2 md:gap-3 text-sm md:text-base mt-2">
            <Settings size={18} /> Settings
          </button>
          <button onClick={handleLogout} className="flex items-center px-2 md:px-4 py-2 md:py-3 hover:bg-red-700/80 rounded-xl text-left gap-2 md:gap-3 text-sm md:text-base text-red-300 hover:text-white transition-colors mt-4">
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-6 md:p-10 space-y-6 md:space-y-8 bg-gray-50 dark:bg-gray-900 min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-2 sm:gap-0">
          <h1 className="text-2xl sm:text-4xl font-bold flex items-center gap-2 sm:gap-3 text-blue-700 dark:text-cyan-400">
            <Users className="text-blue-600 dark:text-cyan-300" /> Admin Dashboard
          </h1>
          <button onClick={handleRefreshData} className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow transition-colors font-semibold w-full sm:w-auto">
            <RefreshCw size={18} /> Refresh Data
          </button>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8 overflow-x-auto md:overflow-hidden">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Registrations</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Users className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.approved}</p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.inProgress}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <XCircle className="text-red-600 dark:text-red-400" size={24} />
              </div>
            </div>
          </div>
        </div>
        {/* Main Content Area (Tabs) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          {activeTab === null && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-blue-700 dark:text-cyan-400">Welcome, Admin!</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Select a section from the sidebar to manage registrations, students, courses, and more.</p>
            </div>
          )}
          {activeTab === 0 && <Notifications />}
          {activeTab === 1 && <RegProgress />}
          {activeTab === 2 && <ViewReg />}
          {activeTab === 3 && <ManageCourse />}
          {activeTab === 4 && <ManageStudent />}
        </div>
        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative transition-all duration-300 ease-in-out ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl bg-gray-100 dark:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center"
                onClick={() => setShowSettings(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-2xl font-bold mb-6 text-blue-700 dark:text-cyan-400 flex items-center gap-3">
                <Settings className="text-blue-600 dark:text-cyan-300" size={24} />
                Settings
              </h3>
              <div className="space-y-6">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Sun className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">Dark Mode</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark theme</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingsChange('darkMode')}
                    className={`w-14 h-7 flex items-center rounded-full p-1 duration-300 ease-in-out ${settings.darkMode ? 'bg-cyan-600' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out ${settings.darkMode ? 'translate-x-7' : ''}`}
                    />
                  </button>
                </div>
                {/* Notifications Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Bell className="text-blue-600 dark:text-cyan-300" size={20} />
                    Notifications
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-3">
                        <Bell className="text-emerald-600 dark:text-emerald-400" size={18} />
                        <span className="font-medium text-gray-900 dark:text-white">Push Notifications</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={() => handleSettingsChange('notifications')}
                        className="accent-cyan-600 w-5 h-5"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-3">
                        <Mail className="text-blue-600 dark:text-blue-400" size={18} />
                        <span className="font-medium text-gray-900 dark:text-white">Email Notifications</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={() => handleSettingsChange('emailNotifications')}
                        className="accent-cyan-600 w-5 h-5"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-3">
                        <Volume2 className="text-purple-600 dark:text-purple-400" size={18} />
                        <span className="font-medium text-gray-900 dark:text-white">Sound Notifications</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.soundNotifications}
                        onChange={() => handleSettingsChange('soundNotifications')}
                        className="accent-cyan-600 w-5 h-5"
                      />
                    </div>
                  </div>
                </div>
                {/* Display Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Monitor className="text-blue-600 dark:text-cyan-300" size={20} />
                    Display
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-3">
                        <Minimize2 className="text-amber-600 dark:text-amber-400" size={18} />
                        <span className="font-medium text-gray-900 dark:text-white">Compact Mode</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.compactMode}
                        onChange={() => handleSettingsChange('compactMode')}
                        className="accent-cyan-600 w-5 h-5"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-3">
                        <Palette className="text-purple-600 dark:text-purple-400" size={18} />
                        <span className="font-medium text-gray-900 dark:text-white">Theme</span>
                      </div>
                      <select
                        value={settings.theme}
                        onChange={e => handleThemeChange(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      >
                        <option value="system">System</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>
                  </div>
                </div>
                {/* Language Section */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <Globe className="text-emerald-600 dark:text-emerald-400" size={18} />
                    <span className="font-medium text-gray-900 dark:text-white">Language</span>
                  </div>
                  <select
                    value={settings.language}
                    onChange={e => handleLanguageChange(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
                {/* Reset Button */}
                <button
                  onClick={handleResetSettings}
                  className="w-full mt-6 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl py-3 font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="text-gray-600 dark:text-gray-400" size={18} />
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
