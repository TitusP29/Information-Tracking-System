import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Clock,
  Users,
  Calendar,
  Target,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Eye,
  X,
  GraduationCap,
  TrendingUp,
  Award
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const ApplicationIntake = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [studentApplications, setStudentApplications] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('name, duration, status, mode, description');

        if (coursesError) throw coursesError;
        setCourses(coursesData);

        // If user is logged in, fetch their applications
        if (user?.id) {
          const { data: registerData, error: registerError } = await supabase
            .from('register')
            .select('course, national_id')
            .eq('user_id', user.id);

          if (registerError) throw registerError;

          if (registerData && registerData.length > 0) {
            // For each registration, fetch the progress
            const applications = {};
            for (const registration of registerData) {
              const { data: progressData, error: progressError } = await supabase
                .from('progress_management')
                .select('application_review')
                .eq('student_number', registration.national_id)
                .single();

              if (progressError) throw progressError;

              applications[registration.course] = {
                status: progressData?.application_review || 'pending'
              };
            }
            setStudentApplications(applications);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleApply = (courseName) => {
    navigate('/register', { state: { courseName } });
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setShowCourseDetails(true);
  };

  const handleCloseDetails = () => {
    setShowCourseDetails(false);
    setSelectedCourse(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Open: {
        bg: "bg-gradient-to-r from-emerald-500 to-emerald-600",
        text: "text-white",
        icon: <CheckCircle size={14} />
      },
      Closed: {
        bg: "bg-gradient-to-r from-red-500 to-red-600",
        text: "text-white",
        icon: <XCircle size={14} />
      }
    };

    const config = statusConfig[status] || statusConfig.Closed;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl font-semibold text-sm shadow-lg ${config.bg} ${config.text}`}>
        {config.icon}
        {status}
      </div>
    );
  };

  const getApplicationStatusBadge = (status) => {
    const statusConfig = {
      complete: {
        bg: "bg-gradient-to-r from-emerald-500 to-emerald-600",
        text: "text-white",
        icon: <CheckCircle size={14} />
      },
      rejected: {
        bg: "bg-gradient-to-r from-red-500 to-red-600",
        text: "text-white",
        icon: <XCircle size={14} />
      },
      pending: {
        bg: "bg-gradient-to-r from-amber-500 to-orange-500",
        text: "text-white",
        icon: <ClockIcon size={14} />
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const label = status === 'complete' ? 'Enrolled' : status === 'rejected' ? 'Rejected' : 'In Progress';

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl font-semibold text-sm shadow-lg ${config.bg} ${config.text}`}>
        {config.icon}
        {label}
      </div>
    );
  };

  const getButtonState = (course) => {
    // If course is closed, show disabled button
    if (course.status !== 'Open') {
      return {
        text: 'Applications Closed',
        disabled: true,
        className: 'w-full bg-slate-400 text-white font-semibold py-3 px-6 rounded-2xl cursor-not-allowed opacity-50 transition-all duration-200'
      };
    }

    // Check if student has applied for this course
    const application = studentApplications[course.name];
    if (application) {
      if (application.status === 'complete') {
        return {
          text: 'Enrolled',
          disabled: true,
          className: 'w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-2xl cursor-not-allowed shadow-lg'
        };
      } else if (application.status === 'rejected') {
        return {
          text: 'Application Rejected',
          disabled: true,
          className: 'w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 px-6 rounded-2xl cursor-not-allowed shadow-lg'
        };
      } else {
        return {
          text: 'Application in Progress',
          disabled: true,
          className: 'w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 px-6 rounded-2xl cursor-not-allowed shadow-lg'
        };
      }
    }

    // If no application exists, show apply button
    return {
      text: 'Apply Now',
      disabled: false,
      className: 'w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl'
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-slate-600 dark:text-slate-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">No courses available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
            <BookOpen className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-emerald-800 dark:from-slate-100 dark:to-emerald-100">
              Available Courses
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
              Explore and apply for our specialized training programs
            </p>
          </div>
        </div>

        {/* Course Statistics */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <BookOpen className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Courses</p>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-xl">{courses.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Open for Applications</p>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-xl">
                    {courses.filter(c => c.status === 'Open').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map(course => {
          const buttonState = getButtonState(course);
          const application = studentApplications[course.name];

          return (
            <div key={course.name} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-200">
              {/* Course Header */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 p-6 border-b border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                      <GraduationCap className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{course.name}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Training Program</p>
                    </div>
                  </div>
                  {getStatusBadge(course.status)}
                </div>

                {application && (
                  <div className="flex items-center gap-2">
                    {getApplicationStatusBadge(application.status)}
                  </div>
                )}
              </div>

              {/* Course Content */}
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                      <Clock className="text-amber-600 dark:text-amber-400" size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Duration</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{course.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <Users className="text-purple-600 dark:text-purple-400" size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Mode</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{course.mode}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                      <Target className="text-emerald-600 dark:text-emerald-400" size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Description</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-relaxed">
                        {course.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => !buttonState.disabled && handleApply(course.name)}
                    disabled={buttonState.disabled}
                    className={buttonState.className}
                  >
                    {buttonState.text}
                  </button>

                  <button
                    onClick={() => handleViewDetails(course)}
                    className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-3 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Eye size={18} />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Details Modal */}
      {showCourseDetails && selectedCourse && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full mx-4 border border-slate-200 dark:border-slate-700">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                    <GraduationCap className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{selectedCourse.name}</h2>
                    <p className="text-slate-600 dark:text-slate-400">Course Details</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseDetails}
                  className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-3xl bg-slate-100 dark:bg-slate-700 rounded-full w-12 h-12 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 shadow-lg"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                        <Clock className="text-amber-600 dark:text-amber-400" size={20} />
                      </div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">Duration</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">{selectedCourse.duration}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                        <Users className="text-purple-600 dark:text-purple-400" size={20} />
                      </div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">Mode</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">{selectedCourse.mode}</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                      <Target className="text-emerald-600 dark:text-emerald-400" size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">Description</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{selectedCourse.description}</p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-600">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(selectedCourse.status)}
                  </div>

                  <button
                    onClick={handleCloseDetails}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationIntake;
