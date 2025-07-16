import React from "react";
import { GraduationCap, RefreshCw } from 'lucide-react';

const GradesHeader = ({ onRefresh }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
        <div className="flex items-center gap-4">
          <div className="p-3 sm:p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
            <GraduationCap className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-emerald-800 dark:from-slate-100 dark:to-emerald-100">
              Course Grades
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
              Manage and track student academic performance
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={onRefresh}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-semibold flex items-center gap-3 shadow-lg w-full sm:w-auto"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default GradesHeader; 