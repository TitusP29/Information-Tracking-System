import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import {
  GraduationCap,
  BookOpen,
  BarChart3,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';

const StudentGrades = () => {
  const auth = useAuth();
  const user = auth?.user;
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get the student's national_id from the register table
        const { data: registerData, error: registerError } = await supabase
          .from('register')
          .select('national_id')
          .eq('user_id', user.id)
          .single();

        if (registerError) throw registerError;
        if (!registerData) throw new Error('Student registration not found');

        // Fetch grades for this student
        const { data, error: gradesError } = await supabase
          .from('grades')
          .select('*')
          .eq('student_number', registerData.national_id)
          .order('course', { ascending: true });

        if (gradesError) throw gradesError;
        setGrades(data || []);
      } catch (err) {
        console.error('Error fetching grades:', err);
        setError(err.message);
        setGrades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [user]);

  const getStatusBadge = (grade) => {
    const isPass = grade >= 50;
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
        isPass 
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" 
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      }`}>
        {isPass ? <CheckCircle size={14} /> : <XCircle size={14} />}
        {isPass ? "Pass" : "Fail"}
      </span>
    );
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, grade) => acc + grade.grade, 0);
    return (sum / grades.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading your grades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">Error loading grades: {error}</p>
        </div>
      </div>
    );
  }

  if (grades.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            No Grades Available
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Your grades will appear here once they are entered by your instructor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <GraduationCap className="text-emerald-600 dark:text-emerald-400" size={24} />
            </div>
            My Academic Grades
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            View your course grades and academic performance
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span className="font-medium">Overall Average:</span>
          <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full font-bold">
            {calculateAverage()}%
          </span>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-emerald-50 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
              <BookOpen className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Course Grades</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Your performance across all courses</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <BookOpen size={16} />
                    <span className="text-sm uppercase tracking-wider">Course</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <BarChart3 size={16} />
                    <span className="text-sm uppercase tracking-wider">Grade</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <GraduationCap size={16} />
                    <span className="text-sm uppercase tracking-wider">Status</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <span className="text-sm uppercase tracking-wider">Feedback</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {grades.map((grade) => (
                <tr key={grade.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">
                          {grade.course.split(' ').map(word => word[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {grade.course}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-sm">
                          Course
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <BarChart3 className="text-blue-600 dark:text-blue-400" size={18} />
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                        {grade.grade}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(grade.grade)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-slate-900 dark:text-slate-100">
                        {grade.comment || "No feedback provided"}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 border-t border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span>Total Courses: {grades.length}</span>
              <span>Passed: {grades.filter(g => g.grade >= 50).length}</span>
              <span>Failed: {grades.filter(g => g.grade < 50).length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Average Grade:</span>
              <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded font-bold">
                {calculateAverage()}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentGrades; 