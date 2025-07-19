import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../../supabaseClient';
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  FileText,
  CreditCard,
  Eye,
  Send,
  Calendar,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'complete':
      return <CheckCircle size={20} className="text-emerald-500" />;
    case 'in_progress':
      return <Clock size={20} className="text-blue-500" />;
    case 'rejected':
      return <XCircle size={20} className="text-red-500" />;
    case 'pending':
      return <AlertTriangle size={20} className="text-amber-500" />;
    default:
      return <Clock size={20} className="text-slate-400" />;
  }
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'complete':
      return 'from-emerald-500 to-teal-500';
    case 'in_progress':
      return 'from-blue-500 to-cyan-500';
    case 'rejected':
      return 'from-red-500 to-pink-500';
    case 'pending':
      return 'from-amber-500 to-orange-500';
    default:
      return 'from-slate-400 to-slate-500';
  }
};

const getStatusBg = (status) => {
  switch (status?.toLowerCase()) {
    case 'complete':
      return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700';
    case 'in_progress':
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
    case 'rejected':
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
    case 'pending':
      return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700';
    default:
      return 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600';
  }
};

const RegistrationProgress = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProgressData() {
      try {
        // First get the student's national_id from the register table
        const { data: registerData, error: registerError } = await supabase
          .from('register')
          .select('national_id')
          .eq('user_id', user?.id)
          .single();

        if (registerError) {
          // If error is 'no rows', treat as no registration yet
          if (registerError.message && registerError.message.includes('multiple (or no) rows returned')) {
            setProgressData(null);
            setError(null);
            setLoading(false);
            return;
          }
          throw registerError;
        }

        if (registerData) {
          // Then fetch the progress data using the national_id
          const { data: progressData, error: progressError } = await supabase
            .from('progress_management')
            .select('*')
            .eq('student_number', registerData.national_id)
            .single();

          if (progressError) {
            // If error is 'no rows', treat as no progress yet
            if (progressError.message && progressError.message.includes('multiple (or no) rows returned')) {
              setProgressData(null);
              setError(null);
              setLoading(false);
              return;
            }
            throw progressError;
          }
          setProgressData(progressData);
        }
      } catch (err) {
        console.error('Error fetching progress data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchProgressData();
    }
  }, [user]);

  const steps = progressData ? [
    {
      id: 1,
      title: 'Application Submitted',
      description: 'Your application has been received and is being processed',
      status: progressData.application_submitted,
      date: progressData.created_at ? new Date(progressData.created_at).toLocaleDateString() : '',
      icon: Send
    },
    {
      id: 2,
      title: 'Documents Uploaded',
      description: 'Required documents have been uploaded and verified',
      status: progressData.document_uploaded,
      date: progressData.updated_at ? new Date(progressData.updated_at).toLocaleDateString() : '',
      icon: FileText
    },
    {
      id: 3,
      title: 'Payment Verified',
      description: 'Payment has been confirmed and processed',
      status: progressData.payment_verified,
      date: progressData.updated_at ? new Date(progressData.updated_at).toLocaleDateString() : '',
      icon: CreditCard
    },
    {
      id: 4,
      title: 'Application Review',
      description: 'Your application is under final review',
      status: progressData.application_review,
      date: progressData.updated_at ? new Date(progressData.updated_at).toLocaleDateString() : '',
      icon: Eye
    }
  ] : [];

  if (loading) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400 text-lg">Loading your registration progress...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="p-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl shadow-lg mx-auto mb-4 w-fit">
                  <XCircle className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Error Loading Progress</h3>
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="max-w-xl mx-auto py-6 text-center">
        <p className="text-gray-600">You have not started any registration yet. Please begin your registration to see progress here.</p>
      </div>
    );
  }

  const completedSteps = steps.filter(step => step.status === 'complete').length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                <TrendingUp className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-blue-800 dark:from-slate-100 dark:to-blue-100">
                  Registration Progress
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  Track your application status through each step
                </p>
              </div>
            </div>
            <button className="flex items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 font-semibold">
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
          </div>

          {/* Progress Overview */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-blue-900/20 rounded-2xl p-6 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Overall Progress</h3>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {completedSteps}/{totalSteps} Complete
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {progressPercentage}% of your registration process is complete
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-xl ${getStatusBg(step.status)}`}
            >
              <div className="p-6">
                <div className="flex items-start gap-6">
                  {/* Step Icon */}
                  <div className={`flex-shrink-0 p-4 rounded-2xl shadow-lg bg-gradient-to-r ${getStatusColor(step.status)}`}>
                    <step.icon className="text-white" size={24} />
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {step.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(step.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          step.status === 'complete' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                          step.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          step.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          step.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                          'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {step.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      {step.description}
                    </p>

                    {/* Date and Step Number */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Calendar size={16} />
                        <span>{step.date || 'Date pending'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Step {step.id}
                        </span>
                        {step.status === 'complete' && (
                          <CheckCircle size={16} className="text-emerald-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar for Current Step */}
              {step.status === 'in_progress' && (
                <div className="px-6 pb-6">
                  <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Processing in progress...</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
              <RefreshCw className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
                Next Steps
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {completedSteps === totalSteps 
                  ? "Congratulations! Your registration is complete. You'll receive further instructions via email."
                  : `Complete the remaining ${totalSteps - completedSteps} step${totalSteps - completedSteps > 1 ? 's' : ''} to finish your registration.`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationProgress;