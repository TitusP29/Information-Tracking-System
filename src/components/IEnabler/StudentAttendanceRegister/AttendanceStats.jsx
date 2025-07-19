import React from "react";
import { BarChart3, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const AttendanceStats = ({ totalSessions, presentCount, absentCount, lateCount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
            <BarChart3 className="text-white" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Total Sessions</h3>
        </div>
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalSessions}</p>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
            <CheckCircle className="text-white" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Present</h3>
        </div>
        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{presentCount}</p>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
            <AlertTriangle className="text-white" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Late</h3>
        </div>
        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{lateCount}</p>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
            <XCircle className="text-white" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Absent</h3>
        </div>
        <p className="text-3xl font-bold text-red-600 dark:text-red-400">{absentCount}</p>
      </div>
    </div>
  );
};

export default AttendanceStats; 