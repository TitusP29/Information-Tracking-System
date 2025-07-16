import React, { useState, useEffect } from "react";
import {
  User,
  GraduationCap,
  FileText,
  Bell,
  LogOut,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Calendar,
  Award,
  BookOpen,
  Target,
  TrendingUp,
  Clock,
  Mail
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from '../../../supabaseClient';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStudentData() {
      try {
        // First get the student's data from the register table
        const { data: registerData, error: registerError } = await supabase
          .from('register')
          .select('*')
          .eq('user_id', user?.id)
          .order('reg_date', { ascending: false });

        if (registerError) throw registerError;

        if (registerData && registerData.length > 0) {
          // Get the most recent registration for profile data
          const latestRegistration = registerData[0];

          // Fetch progress data for all applications
          const applicationsWithProgress = await Promise.all(
            registerData.map(async (registration) => {
              const { data: progressData, error: progressError } = await supabase
                .from('progress_management')
                .select('*')
                .eq('student_number', registration.national_id)
                .single();

              if (progressError) throw progressError;

              return {
                ...registration,
                progress: progressData
              };
            })
          );

          setStudentData(latestRegistration);
          setApplications(applicationsWithProgress);
        }

        // Fetch notifications
        const { data: notificationsData, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_id', user?.id)
          .order('created_at', { ascending: false });

        if (notificationsError) throw notificationsError;

        // Fetch admin-wide notifications
        const { data: adminNotifs, error: adminError } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_role', 'admin')
          .order('created_at', { ascending: false });
        if (adminError) throw adminError;

        // Merge and sort notifications
        const allNotifications = [...(notificationsData || []), ...(adminNotifs || [])]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setNotifications(allNotifications);

        // Fetch documents
        const { data: docsData, error: docsError } = await supabase
          .from('documents')
          .select('*, attachments(*)')
          .eq('user_id', user?.id);

        if (docsError) throw docsError;
        setDocuments(docsData?.[0] || null);

      } catch (err) {
        console.error('Error fetching student data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchStudentData();
    }
  }, [user]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>;
      case 'warning':
        return <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>;
      case 'error':
        return <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>;
      default:
        return <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>;
    }
  };

  const getDocumentStatus = (docType) => {
    if (!documents) return false;
    return documents[`${docType}_uploaded`];
  };

  const getMissingDocuments = () => {
    const requiredDocs = ['id', 'certificate', 'residence', 'payment'];
    return requiredDocs.filter(doc => !getDocumentStatus(doc));
  };

  const getDocumentLabel = (docType) => {
    const labels = {
      id: 'ID Document',
      certificate: 'Latest Certificate',
      residence: 'Proof of Residence',
      payment: 'Proof of Payment'
    };
    return labels[docType] || docType;
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
        icon: <Clock size={14} />
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const label = status === 'complete' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending';

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl font-semibold text-sm shadow-lg ${config.bg} ${config.text}`}>
        {config.icon}
        {label}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-red-600 dark:text-red-400 text-lg">Error loading student data: {error}</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-slate-600 dark:text-slate-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">No student data found. Please complete your registration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 min-h-screen">
      {/* Main Dashboard Heading */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-cyan-600 dark:from-blue-100 dark:to-cyan-300 mb-2">
          Student Dashboard
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
          Welcome back, <span className="font-semibold text-blue-700 dark:text-blue-200">{studentData.first_name}</span>!
        </p>
      </div>

      {/* Profile & Applications Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Profile Card */}
        <div className="flex flex-col h-full">
          <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                <User className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Student Profile</h2>
                <p className="text-slate-600 dark:text-slate-400">Your personal information</p>
              </div>
            </div>
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">
                  {studentData.first_name[0]}{studentData.surname[0]}
                </span>
              </div>
              <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 mb-2">
                {studentData.first_name} {studentData.surname}
              </h3>
              <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                <Mail size={16} />
                <span>{studentData.email}</span>
              </div>
            </div>
            <div className="space-y-4 mt-auto">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Award className="text-blue-600 dark:text-blue-400" size={18} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Student Number</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{studentData.national_id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <BookOpen className="text-purple-600 dark:text-purple-400" size={18} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Applications</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{applications.length} courses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Applications Card */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Target className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Applications</h2>
                <p className="text-slate-600 dark:text-slate-400">Track your course applications</p>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              {applications.length > 0 ? (
                applications.map((application, index) => (
                  <div key={index} className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                          <BookOpen className="text-white" size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{application.course}</h3>
                          <p className="text-slate-600 dark:text-slate-400 text-sm">Course Application</p>
                        </div>
                      </div>
                      {getApplicationStatusBadge(application.progress?.application_review)}
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Calendar size={16} />
                        <span>Applied: {new Date(application.reg_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">No applications found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Documents Card */}
        <div className="flex flex-col h-full">
          <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                <FileText className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Documents</h2>
                <p className="text-slate-600 dark:text-slate-400">Required documentation status</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              {documents ? (
                getMissingDocuments().length === 0 ? (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700 flex items-center justify-center">
                    <CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400 mr-2" />
                    <p className="font-semibold text-lg text-emerald-700 dark:text-emerald-300">All documents uploaded successfully</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Missing documents:</p>
                    <div className="space-y-3">
                      {getMissingDocuments().map(doc => (
                        <div key={doc} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700">
                          <XCircle className="text-red-600 dark:text-red-400" size={20} />
                          <span className="text-red-700 dark:text-red-300 font-medium">{getDocumentLabel(doc)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">No document information available</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Notifications Card */}
        <div className="flex flex-col h-full">
          <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Bell className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Notifications</h2>
                <p className="text-slate-600 dark:text-slate-400">Latest updates and alerts</p>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'}`}
                  >
                    <div className="flex items-start gap-4">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">{notification.title}</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">{notification.message}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Clock size={12} />
                          <span>{new Date(notification.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg"></div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">No notifications</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
