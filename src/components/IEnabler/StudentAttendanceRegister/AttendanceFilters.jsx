import React from "react";
import { Filter, Calendar } from 'lucide-react';

const classes = ['All', 'Project Management', 'Renewable Energy Workshop Assistance', 'New Venture Creation', 'Energy Efficiency Technician', 'Solar Technician'];

const AttendanceFilters = ({ selectedClass, setSelectedClass, selectedMonth, setSelectedMonth, months }) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
      <div className="flex items-center gap-3">
        <Filter className="text-slate-600 dark:text-slate-400" size={20} />
        <label className="font-medium text-slate-700 dark:text-slate-300">Filter by Class:</label>
        <select 
          value={selectedClass} 
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border border-slate-300 dark:border-slate-600 rounded-xl px-3 sm:px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          {classes.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center gap-3">
        <Calendar className="text-slate-600 dark:text-slate-400" size={20} />
        <label className="font-medium text-slate-700 dark:text-slate-300">Month:</label>
        <select 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-slate-300 dark:border-slate-600 rounded-xl px-3 sm:px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="">All Months</option>
          {months.length > 0 ? (
            months.map(month => (
              <option key={month} value={month}>
                {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </option>
            ))
          ) : (
            <option value="" disabled>No date data available</option>
          )}
        </select>
      </div>
    </div>
  );
};

export default AttendanceFilters; 