import React, { useState, useEffect, createContext } from "react";
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import StudentClassAssignment from "./StudentClassAssignment";
import { supabase } from '../../../supabaseClient';
import {
  Home,
  CalendarDays,
  GraduationCap,
  CreditCard,
  Settings,
  LogOut,
  Search,
  Users,
  ArrowLeft,
  Plus,
  Filter,
  Loader2,
  RefreshCw,
  BarChart3,
  BookOpen,
  FileText,
  DollarSign
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Create context for sharing data
export const EnrolledStudentsContext = createContext();

const EnrolledStudents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showClassAssignment, setShowClassAssignment] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All');

  useEffect(() => {
    fetchApprovedStudents();
  }, []);

  const fetchApprovedStudents = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching approved students...');
      
      // Fetch students who have been approved (application_review = 'approved')
      const { data: approvedStudents, error } = await supabase
        .from('register')
        .select(`
          *,
          progress_management!inner(application_review)
        `)
        .eq('progress_management.application_review', 'approved')
        .order('reg_date', { ascending: false });

      if (error) {
        console.error('Error fetching approved students:', error);
        toast.error('Failed to fetch enrolled students');
        setStudents([]);
        return;
      }

      console.log('Approved students found:', approvedStudents?.length || 0);

      // Transform the data to match the expected format
      const transformedStudents = (approvedStudents || []).map(student => ({
        id: student.national_id,
        name: `${student.first_name} ${student.surname}`,
        dob: student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A',
        course: student.course,
        status: "Active",
        email: student.email,
        phone: student.phone,
        reg_date: student.reg_date
      }));

      setStudents(transformedStudents);
      console.log('Transformed students:', transformedStudents.length);
    } catch (error) {
      console.error('Error fetching approved students:', error);
      toast.error('Failed to fetch enrolled students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Make refresh function available globally
  React.useEffect(() => {
    window.refreshEnrolledStudents = fetchApprovedStudents;
    return () => {
      delete window.refreshEnrolledStudents;
    };
  }, []);

  // Filter students based on search term and course
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'All' || student.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  // Get unique courses for filter
  const courses = ['All', ...new Set(students.map(student => student.course))];

  // Helper to check if a route is active
  const isActive = (path) => {
    if (path === '/enrolled-students' && location.pathname === '/enrolled-students') return true;
    return location.pathname.startsWith(path) && path !== '/enrolled-students' ? true : false;
  };

  const StatusBadge = ({ status }) => {
    const statusColor =
      status === "Active"
        ? "bg-emerald-500"
        : status === "Suspended"
        ? "bg-amber-500"
        : "bg-gray-400";

    return (
      <span className={`text-white text-sm px-3 py-1 rounded-full font-semibold ${statusColor}`}>
        {status}
      </span>
    );
  };

  const contextValue = {
    students,
    loading,
    searchTerm,
    selectedCourse,
    fetchApprovedStudents
  };

  return (
    <EnrolledStudentsContext.Provider value={contextValue}>
      <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-gradient-to-b from-slate-800 to-slate-900 text-white p-4 md:p-8 shadow-2xl border-r border-slate-700/50 flex flex-row md:flex-col h-[60px] md:h-screen overflow-x-auto md:overflow-y-auto">
        <div className="mb-6 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            Student Portal
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1 md:mt-2">Management Dashboard</p>
        </div>
        <nav className="space-y-2 md:space-y-3 flex flex-row md:flex-col gap-2 md:gap-0 w-full">
          <button 
            className={`flex items-center w-full px-3 md:px-6 py-2 md:py-4 rounded-2xl font-semibold gap-2 md:gap-4 shadow-lg transition-all duration-200 hover:shadow-xl text-xs md:text-lg
              ${isActive('/enrolled-students') ? 'bg-gradient-to-r from-cyan-600 to-blue-600 ring-2 ring-cyan-400 text-white' : 'bg-slate-800 hover:bg-slate-700/60 text-slate-200'}`}
            onClick={() => navigate('/enrolled-students')}
          >
            <div className="p-2 bg-white/20 rounded-xl">
              <Home className="text-white" size={20} />
            </div>
            <span>Dashboard</span>
          </button>
          <button 
            className={`flex items-center w-full px-3 md:px-6 py-2 md:py-4 rounded-2xl font-semibold gap-2 md:gap-4 shadow-lg transition-all duration-200 hover:shadow-xl text-xs md:text-lg
              ${isActive('/enrolled-students/attendance') ? 'bg-gradient-to-r from-blue-600 to-cyan-600 ring-2 ring-blue-400 text-white' : 'bg-slate-800 hover:bg-slate-700/60 text-slate-200'}`}
            onClick={() => navigate('/enrolled-students/attendance')}
          >
            <div className="p-2 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
              <CalendarDays className="text-blue-300" size={20} />
            </div>
            <span>Attendance</span>
          </button>
          <button 
            className={`flex items-center w-full px-3 md:px-6 py-2 md:py-4 rounded-2xl font-semibold gap-2 md:gap-4 shadow-lg transition-all duration-200 hover:shadow-xl text-xs md:text-lg
              ${isActive('/enrolled-students/grades') ? 'bg-gradient-to-r from-emerald-600 to-green-600 ring-2 ring-emerald-400 text-white' : 'bg-slate-800 hover:bg-slate-700/60 text-slate-200'}`}
            onClick={() => navigate('/enrolled-students/grades')}
          >
            <div className="p-2 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500/30 transition-colors">
              <BarChart3 className="text-emerald-300" size={20} />
            </div>
            <span>Grades</span>
          </button>
          <button 
            className={`flex items-center w-full px-3 md:px-6 py-2 md:py-4 rounded-2xl font-semibold gap-2 md:gap-4 shadow-lg transition-all duration-200 hover:shadow-xl text-xs md:text-lg
              ${isActive('/enrolled-students/assignments') ? 'bg-gradient-to-r from-blue-600 to-indigo-600 ring-2 ring-blue-400 text-white' : 'bg-slate-800 hover:bg-slate-700/60 text-slate-200'}`}
            onClick={() => navigate('/enrolled-students/assignments')}
          >
            <div className="p-2 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
              <BookOpen className="text-blue-300" size={20} />
            </div>
            <span>Assignments</span>
          </button>
          <button 
            className={`flex items-center w-full px-3 md:px-6 py-2 md:py-4 rounded-2xl font-semibold gap-2 md:gap-4 shadow-lg transition-all duration-200 hover:shadow-xl text-xs md:text-lg
              ${isActive('/enrolled-students/exams') ? 'bg-gradient-to-r from-purple-600 to-violet-600 ring-2 ring-purple-400 text-white' : 'bg-slate-800 hover:bg-slate-700/60 text-slate-200'}`}
            onClick={() => navigate('/enrolled-students/exams')}
          >
            <div className="p-2 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
              <FileText className="text-purple-300" size={20} />
            </div>
            <span>Exams</span>
          </button>
          <button 
            className={`flex items-center w-full px-3 md:px-6 py-2 md:py-4 rounded-2xl font-semibold gap-2 md:gap-4 shadow-lg transition-all duration-200 hover:shadow-xl text-xs md:text-lg
              ${isActive('/enrolled-students/fees-management') ? 'bg-gradient-to-r from-green-600 to-emerald-600 ring-2 ring-green-400 text-white' : 'bg-slate-800 hover:bg-slate-700/60 text-slate-200'}`}
            onClick={() => navigate('/enrolled-students/fees-management')}
          >
            <div className="p-2 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
              <DollarSign className="text-green-300" size={20} />
            </div>
            <span>Fees Management</span>
          </button>
          <button 
            className={`flex items-center w-full px-3 md:px-6 py-2 md:py-4 rounded-2xl font-semibold gap-2 md:gap-4 shadow-lg transition-all duration-200 hover:shadow-xl text-xs md:text-lg
              ${isActive('/enrolled-students/lessons') ? 'bg-gradient-to-r from-orange-600 to-red-600 ring-2 ring-orange-400 text-white' : 'bg-slate-800 hover:bg-slate-700/60 text-slate-200'}`}
            onClick={() => navigate('/enrolled-students/lessons')}
          >
            <div className="p-2 bg-orange-500/20 rounded-xl group-hover:bg-orange-500/30 transition-colors">
              <BookOpen className="text-orange-300" size={20} />
            </div>
            <span>Lesson Manager</span>
          </button>
        </nav>
        
        {/* Logout Button */}
        <div className="mt-auto pt-4 border-t border-slate-700/50">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center w-full px-3 md:px-6 py-2 md:py-4 rounded-2xl font-semibold gap-2 md:gap-4 shadow-lg transition-all duration-200 hover:shadow-xl text-xs md:text-lg bg-slate-800 hover:bg-slate-700/60 text-slate-200"
          >
            <div className="p-2 bg-red-500/20 rounded-xl group-hover:bg-red-500/30 transition-colors">
              <LogOut className="text-red-300" size={20} />
            </div>
            <span>Back to Admin</span>
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-6 md:p-10 overflow-y-auto min-w-0">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-2 sm:gap-0">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-blue-800 dark:from-slate-100 dark:to-blue-100 flex items-center gap-2 md:gap-4">
                <div className="p-2 md:p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                  <Users className="text-white" size={24} />
                </div>
                Enrolled Students
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1 md:mt-2 text-base md:text-lg">
                Manage student enrollments, attendance, and academic records
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-semibold flex items-center gap-3 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30"
                onClick={() => setShowClassAssignment(true)}
              >
                <Plus size={20} />
                Assign Students to Classes
              </button>
              
              <button 
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold flex items-center gap-3 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                onClick={fetchApprovedStudents}
                disabled={loading}
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              
              <button 
                className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-4 rounded-2xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 font-semibold flex items-center gap-3 shadow-lg" 
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft size={20} />
                Back to Admin
              </button>
            </div>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={22} />
                <input 
                  type="text" 
                  placeholder="Search students by name, ID, or course..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white text-lg transition-all duration-200" 
                />
              </div>
              
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-xl px-4 py-2">
                <Filter className="text-slate-600 dark:text-slate-400" size={20} />
                <label className="font-medium text-slate-700 dark:text-slate-200">Course:</label>
                <select 
                  value={selectedCourse} 
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="ml-2 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">Total Students:</span>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-bold">
                  {filteredStudents.length}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <Outlet />
        </div>
      </main>
    </div> {/* Close main flex wrapper */}
    {/* Student Class Assignment Modal */}
    {showClassAssignment && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-7xl w-full h-[90vh] overflow-y-auto relative border border-slate-200 dark:border-slate-700">
          <button
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-3xl bg-slate-100 dark:bg-slate-700 rounded-full w-12 h-12 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 shadow-lg"
            onClick={() => setShowClassAssignment(false)}
            aria-label="Close"
          >
            &times;
          </button>
          <StudentClassAssignment />
        </div>
      </div>
    )}
    <Toaster />
    </EnrolledStudentsContext.Provider>
  );
};

export default EnrolledStudents;
