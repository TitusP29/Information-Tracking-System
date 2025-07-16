import React from "react";
import { Calendar, RefreshCw } from 'lucide-react';

const AttendanceHeader = ({ onRefresh }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
        <div className="flex items-center gap-4">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
            <Calendar className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">My Attendance Register</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Track your class attendance and performance
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={onRefresh}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 sm:px-6 py-2 sm:py-2 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg w-full sm:w-auto"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHeader; 