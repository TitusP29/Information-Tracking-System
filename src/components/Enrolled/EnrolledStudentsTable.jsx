import React from "react";
import { Eye, Edit, Trash2, MoreHorizontal, User, Calendar, GraduationCap, Shield } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    Active: {
      bg: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      text: "text-white",
      icon: "bg-emerald-400/20"
    },
    Suspended: {
      bg: "bg-gradient-to-r from-amber-500 to-orange-500",
      text: "text-white",
      icon: "bg-amber-400/20"
    },
    Inactive: {
      bg: "bg-gradient-to-r from-slate-400 to-slate-500",
      text: "text-white",
      icon: "bg-slate-400/20"
    }
  };

  const config = statusConfig[status] || statusConfig.Inactive;

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${config.bg} ${config.text} font-semibold text-sm shadow-lg`}>
      <div className={`w-2 h-2 rounded-full ${config.icon}`}></div>
      {status}
    </div>
  );
};

const EnrolledStudentsTable = ({ students = [], loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading enrolled students...</p>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            No Enrolled Students Found
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            No students have been approved and enrolled yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 shadow-xl rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 px-4 md:px-8 py-4 md:py-6 border-b border-slate-200 dark:border-slate-600">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
              <User className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-slate-100">Student Records</h2>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">Manage enrolled student information</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium">Showing:</span>
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 md:px-3 py-1 rounded-full font-bold">
              {students.length} students
            </span>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="min-w-[600px] md:min-w-full text-xs md:text-base">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
            <tr>
              <th className="px-2 md:px-8 py-2 md:py-6 text-left">
                <div className="flex items-center gap-2 md:gap-3 text-slate-700 dark:text-slate-300 font-semibold">
                  <Shield size={16} md:size={18} />
                  <span className="uppercase tracking-wider">Student ID</span>
                </div>
              </th>
              <th className="px-2 md:px-8 py-2 md:py-6 text-left">
                <div className="flex items-center gap-2 md:gap-3 text-slate-700 dark:text-slate-300 font-semibold">
                  <User size={16} md:size={18} />
                  <span className="uppercase tracking-wider">Name</span>
                </div>
              </th>
              <th className="px-2 md:px-8 py-2 md:py-6 text-left">
                <div className="flex items-center gap-2 md:gap-3 text-slate-700 dark:text-slate-300 font-semibold">
                  <Calendar size={16} md:size={18} />
                  <span className="uppercase tracking-wider">Date of Birth</span>
                </div>
              </th>
              <th className="px-2 md:px-8 py-2 md:py-6 text-left">
                <div className="flex items-center gap-2 md:gap-3 text-slate-700 dark:text-slate-300 font-semibold">
                  <GraduationCap size={16} md:size={18} />
                  <span className="uppercase tracking-wider">Course</span>
                </div>
              </th>
              <th className="px-2 md:px-8 py-2 md:py-6 text-left">
                <div className="flex items-center gap-2 md:gap-3 text-slate-700 dark:text-slate-300 font-semibold">
                  <Shield size={16} md:size={18} />
                  <span className="uppercase tracking-wider">Status</span>
                </div>
              </th>
              <th className="px-2 md:px-8 py-2 md:py-6 text-left">
                <div className="flex items-center gap-2 md:gap-3 text-slate-700 dark:text-slate-300 font-semibold">
                  <MoreHorizontal size={16} md:size={18} />
                  <span className="uppercase tracking-wider">Actions</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {students.map((student, idx) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all duration-200 group">
                <td className="px-2 md:px-8 py-2 md:py-6">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xs md:text-sm">{student.id.split('/')[2] || student.id.slice(-3)}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-base md:text-lg">
                        {student.id}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
                        ID
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-2 md:px-8 py-2 md:py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-base md:text-lg">
                        {student.name}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
                        Student
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-2 md:px-8 py-2 md:py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
                      <Calendar className="text-slate-600 dark:text-slate-400" size={18} />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {student.dob}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
                        Birth Date
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-2 md:px-8 py-2 md:py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <GraduationCap className="text-purple-600 dark:text-purple-400" size={18} />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {student.course}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
                        Program
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-2 md:px-8 py-2 md:py-6">
                  <StatusBadge status={student.status} />
                </td>
                <td className="px-2 md:px-8 py-2 md:py-6">
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl group-hover:scale-105">
                      <Eye size={16} />
                      View
                    </button>
                    <button className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl group-hover:scale-105">
                      <Edit size={16} />
                      Edit
                    </button>
                    <button className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl group-hover:scale-105">
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="bg-slate-50 dark:bg-slate-700/50 px-8 py-4 border-t border-slate-200 dark:border-slate-600">
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span>Showing {students.length} of {students.length} students</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrolledStudentsTable; 