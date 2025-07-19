import React from "react";
import { TrendingUp } from 'lucide-react';

const AttendanceRate = ({ attendanceRate, presentCount, totalSessions, months, attendanceData }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
          <TrendingUp className="text-white" size={20} />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Overall Attendance Rate</h3>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">{attendanceRate}%</div>
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
            <span>Attendance Progress</span>
            <span>{presentCount} / {totalSessions} sessions</span>
          </div>
          <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-4">
            <div 
              className={`h-4 rounded-full transition-all duration-500 ${
                attendanceRate >= 80 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                  : attendanceRate >= 60 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-red-500 to-pink-500'
              }`}
              style={{ width: `${attendanceRate}%` }}
            ></div>
          </div>
        </div>
      </div>
      {months.length === 0 && attendanceData.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            <strong>Info:</strong> All your attendance records are from the current period. Use the class filter to view specific courses.
          </p>
        </div>
      )}
    </div>
  );
};

export default AttendanceRate; 