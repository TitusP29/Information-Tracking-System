import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import {
  Users,
  Search,
  User,
  GraduationCap,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function ManageStudents() {
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      // Fetch all students with their progress data
      const { data: registerData, error: registerError } = await supabase
        .from('register')
        .select('*')
        .order('reg_date', { ascending: false });

      if (registerError) throw registerError;

      // For each student, fetch their progress
      const applicationsWithProgress = await Promise.all(
        (registerData || []).map(async (student) => {
          const { data: progressData, error: progressError } = await supabase
            .from('progress_management')
            .select('*')
            .eq('student_number', student.national_id)
            .single();

          if (progressError) throw progressError;

          return {
            id: student.id,
            name: `${student.first_name} ${student.surname}`,
            course: student.course,
            date: student.reg_date,
            national_id: student.national_id,
            status: progressData?.application_review || 'pending',
            progress: progressData
          };
        })
      );

      setApplications(applicationsWithProgress);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app =>
    (app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.course.toLowerCase().includes(searchTerm.toLowerCase())) &&
    app.status === 'approved'
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-semibold">Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center">
          <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mb-4" />
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold">Error loading students: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-700 dark:text-cyan-400 flex items-center gap-3">
          <Users className="text-blue-600 dark:text-cyan-300" size={32} />
          Manage Students
        </h1>
      </div>

      {/* Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <label htmlFor="search" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Search className="text-blue-600 dark:text-cyan-300" size={18} />
          Search by name or course
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            id="search"
            type="text"
            placeholder="Type to search approved students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Students Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={24} />
          Approved Students
        </h3>
        
        <div className="space-y-6">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((app) => (
              <div key={app.id} className="bg-gray-50 dark:bg-gray-700 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <User className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">{app.name}</h4>
                      <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                        <GraduationCap size={16} className="text-emerald-600 dark:text-emerald-400" />
                        {app.course}
                      </p>
                    </div>
                  </div>
                  <span className="px-4 py-2 text-sm font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 flex items-center gap-2">
                    <CheckCircle size={16} />
                    Approved
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold">Student ID:</span> {app.national_id}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-amber-600 dark:text-amber-400" />
                    <span className="font-semibold">Approved on:</span> {new Date(app.date).toLocaleDateString()}
                  </div>
                  {app.progress?.student_class && (
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold">Class:</span> {app.progress.student_class}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-700 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600">
              <Users className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No approved students</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                There are no approved students in the system yet. Students will appear here once their applications are approved.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
