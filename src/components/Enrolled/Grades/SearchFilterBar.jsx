import React from "react";
import { Search, Filter } from 'lucide-react';

const SearchFilterBar = ({ searchTerm, setSearchTerm, gradeFilter, setGradeFilter, hasData }) => {
  if (!hasData) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={22} />
          <input
            type="text"
            placeholder="Search students by name..."
            className="w-full pl-12 pr-4 py-3 sm:py-4 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white text-lg transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          className="px-4 sm:px-6 py-3 sm:py-4 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white text-lg transition-all duration-200"
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
        >
          <option value="All">All Grades</option>
          <option value="Pass">Pass Only</option>
          <option value="Fail">Fail Only</option>
        </select>
        
        <button className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 font-medium w-full sm:w-auto">
          <Filter size={20} />
          Filters
        </button>
      </div>
    </div>
  );
};

export default SearchFilterBar; 