import React from 'react';
import { Search, Filter } from 'lucide-react';

const SearchBar = ({ filter, setFilter, totalStudents }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={22} />
          <input
            type="text"
            placeholder="Search students by name or ID..."
            className="w-full pl-12 pr-4 py-4 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white text-lg transition-all duration-200"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        
        <button className="flex items-center gap-3 px-6 py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 font-medium">
          <Filter size={20} />
          Filters
        </button>
        
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <span className="font-medium">Total Students:</span>
          <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full font-bold">
            {totalStudents}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchBar; 