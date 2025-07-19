import React, { useState, useEffect, useRef } from 'react';
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
  Menu,
  Sun,
  Moon,
  ArrowLeft,
  LogOut,
  ClipboardCheck,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Clock,
  CheckSquare,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import StudentAttendanceRegister from '@/components/IEnabler/StudentAttendanceRegister';
import StudentTimetable from './StudentTimetable';
import { useAuth } from '../../contexts/AuthContext';
import StudentGrades from './StudentGrades';
import StudentFinancialAid from './StudentFinancialAid';
import StudentNotifications from './StudentNotifications';
import StudentAssignments from './StudentAssignments';
import StudentExams from './StudentExams';
import StudentCourses from './StudentCourses';

const features = [
  { path: 'timetable', icon: <CalendarDays className="text-blue-600" />, title: 'Class Timetable', desc: 'View your daily and weekly classes.' },
  { path: 'assignments', icon: <BookOpen className="text-green-600" />, title: 'Assignments', desc: 'Track your assignment deadlines.' },
  { path: 'exams', icon: <FileText className="text-purple-600" />, title: 'Exam Schedule', desc: 'Upcoming exam dates and venues.' },
  { path: 'grades', icon: <Activity className="text-orange-600" />, title: 'Grades', desc: 'Check your grades and academic progress.' },
  { path: 'attendance', icon: <ClipboardCheck className="text-emerald-600" />, title: 'Attendance Register', desc: 'View your attendance records and statistics.' },
  { path: 'notifications', icon: <Bell className="text-red-600" />, title: 'Notifications', desc: 'Important campus updates and alerts.' },
  { path: 'courses', icon: <BookOpen className="text-teal-600" />, title: 'My Courses', desc: 'View your enrolled courses and progress.' },
  { path: 'financial-aid', icon: <Briefcase className="text-yellow-600" />, title: 'Financial Aid', desc: 'View NSFAS and other funding status.' },
];

function DummyPage({ title }) {
  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-500">This is a placeholder page for {title}.</p>
    </div>
  );
}

export default function IEnablerStudentDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const subscriptionRef = useRef(null);
  const auth = useAuth();
  const user = auth?.user;
  const authLoading = auth?.loading;
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for authentication to complete
    if (authLoading) return;
    
    async function checkApproval() {
      if (!user) {
        // Redirect to login page instead of showing error
        navigate('/login');
        return;
      }
      try {
        setLoading(true);
        // Get the student's national_id from the register table
        const { data: registerData, error: registerError } = await supabase
          .from('register')
          .select('national_id')
          .eq('user_id', user.id)
          .single();
        if (registerError) throw registerError;
        if (!registerData) throw new Error('Student registration not found');
        // Get the approval status from progress_management
        const { data: progressData, error: progressError } = await supabase
          .from('progress_management')
          .select('application_review')
          .eq('student_number', registerData.national_id)
          .single();
        if (progressError) throw progressError;
        if (progressData?.application_review?.toLowerCase() === 'approved') {
          setIsApproved(true);
        } else {
          setIsApproved(false);
        }
        
        // Fetch notifications
        await fetchNotifications();
      } catch (err) {
        setError(err.message || 'Error checking approval status');
        setIsApproved(false);
      } finally {
        setLoading(false);
      }
    }
    checkApproval();
  }, [user, authLoading, navigate]);

  // Poll for new notifications instead of using realtime
  useEffect(() => {
    if (!user) return;
    
    // Initial fetch
    fetchNotifications();
    
    // Set up polling every 30 seconds
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds
    
    return () => {
      clearInterval(pollInterval);
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setNotificationLoading(true);
      // Fetch user-specific notifications (recipient_id is UUID)
      const { data: userNotifs, error: userError } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });
      if (userError) {
        console.error('Error fetching user notifications:', userError, userError.message, userError.details, userError.hint, userError.code);
      }
      // Fetch admin-wide notifications (recipient_role is text)
      const { data: adminNotifs, error: adminError } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_role', 'admin')
        .order('created_at', { ascending: false });
      if (adminError) {
        console.error('Error fetching admin notifications:', adminError, adminError.message, adminError.details, adminError.hint, adminError.code);
      }
      // Merge and sort notifications by created_at descending
      const notifications = [...(userNotifs || []), ...(adminNotifs || [])]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(notifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('recipient_id', user.id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'error':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotificationDropdown && !event.target.closest('.notification-dropdown')) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationDropdown]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking approval status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Your registration has not been approved yet. Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900 dark:text-white">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-[#1e293b] text-white flex flex-col p-3 sm:p-4 md:fixed md:h-full z-10 h-screen overflow-y-auto">
          <div className="text-2xl font-bold mb-6 flex items-center justify-between md:justify-start">
            I-Enabler
            <div className="flex items-center gap-2">
              {/* Notification Dropdown */}
              <div className="relative notification-dropdown">
                <button 
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                  className="relative p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {showNotificationDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllAsRead}
                              className="text-xs text-blue-600 hover:text-blue-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                            >
                              Mark all read
                            </button>
                          )}
                          <button
                            onClick={() => setShowNotificationDropdown(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      {notificationLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                      ) : notifications.length > 0 ? (
                        <div className="space-y-2">
                          {notifications.slice(0, 5).map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-3 rounded-lg border transition-all ${
                                !notification.read 
                                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {getNotificationIcon(notification.type)}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                                        {notification.title}
                                      </h4>
                                      <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-2">
                                        {notification.message}
                                      </p>
                                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Clock size={12} />
                                        <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                    {!notification.read && (
                                      <button
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        className="ml-2 p-1 text-gray-400 hover:text-emerald-600 transition-colors"
                                        title="Mark as read"
                                      >
                                        <CheckSquare size={14} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {notifications.length > 5 && (
                            <div className="text-center pt-2">
                              <Link 
                                to="/ienabler/notifications"
                                onClick={() => setShowNotificationDropdown(false)}
                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                              >
                                View all {notifications.length} notifications
                              </Link>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Bell className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
          
          {/* Back to Student Dashboard Link */}
          <Link to="/student" className="flex items-center gap-2 hover:text-blue-300 transition-all mb-4 p-2 rounded bg-gray-700 hover:bg-gray-600">
            <ArrowLeft size={18}/> Back to Student Dashboard
          </Link>
          
          <nav className="space-y-4 flex-1">
            <Link to="/ienabler" className="flex items-center gap-2 p-2 rounded-lg hover:text-blue-300 hover:bg-gray-800 transition-all w-full"><Home size={18}/> Dashboard</Link>
            <Link to="/ienabler/assignments" className="flex items-center gap-2 p-2 rounded-lg hover:text-green-400 hover:bg-gray-800 transition-all w-full"><BookOpen size={18}/> Assignments</Link>
            <Link to="/ienabler/exams" className="flex items-center gap-2 p-2 rounded-lg hover:text-purple-400 hover:bg-gray-800 transition-all w-full"><FileText size={18}/> Exam Schedule</Link>
            {features.filter(f => !['assignments','exams'].includes(f.path)).map((f, i) => (
              <Link key={i} to={`/ienabler/${f.path}`} className="flex items-center gap-2 p-2 rounded-lg hover:text-blue-300 hover:bg-gray-800 transition-all w-full">
                {f.icon} {f.title}
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 hover:text-red-300 transition-all mt-4 p-2 rounded bg-red-600 hover:bg-red-700 text-white w-full"
          >
            <LogOut size={18} /> Logout
          </button>
        </aside>

          {/* Main Content */}
          <main className="flex-1 p-2 sm:p-4 md:ml-64 min-w-0">
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <motion.h1
                      className="text-xl sm:text-2xl font-semibold mb-4"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      Welcome, Student
                    </motion.h1>

                    <motion.div
                      className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: {},
                        visible: {
                          transition: {
                            staggerChildren: 0.1
                          }
                        }
                      }}
                    >
                      {features.map((f, i) => (
                        <motion.div
                          key={i}
                          className="bg-white dark:bg-gray-800 rounded-2xl shadow p-3 sm:p-4 flex items-start gap-3 sm:gap-4 hover:shadow-lg transition-transform hover:scale-[1.02] w-full"
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">{f.icon}</div>
                          <div>
                            <Link to={`/ienabler/${f.path}`} className="font-semibold text-base sm:text-lg hover:underline">{f.title}</Link>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{f.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </>
                }
              />
              <Route path="attendance" element={<StudentAttendanceRegister />} />
              <Route path="timetable" element={<StudentTimetable />} />
              <Route path="grades" element={<StudentGrades />} />
              <Route path="financial-aid" element={<StudentFinancialAid />} />
              <Route path="notifications" element={<StudentNotifications />} />
              <Route path="assignments" element={<StudentAssignments />} />
              <Route path="exams" element={<StudentExams />} />
              <Route path="courses" element={<StudentCourses />} />
              {features.filter(f => !['attendance','timetable','grades','financial-aid','notifications','assignments','exams'].includes(f.path)).map((f, i) => (
                <Route key={i} path={f.path} element={<DummyPage title={f.title} />} />
              ))}
            </Routes>
          </main>
        </div>
      </div>
  );
}
