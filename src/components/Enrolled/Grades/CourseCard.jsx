import React from "react";
import { BookOpen, Target, User } from 'lucide-react';

const CourseCard = ({ course, selectedCourse, courseData, enrolledStudents, onCourseClick }) => {
  return (
    <div
      className={`cursor-pointer bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl border-2 transition-all duration-200 ${
        selectedCourse === course 
          ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20" 
          : "border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600"
      }`}
      onClick={() => onCourseClick(course)}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-xl shadow-lg ${
          selectedCourse === course 
            ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
            : "bg-gradient-to-r from-slate-500 to-slate-600"
        }`}>
          <BookOpen className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{course}</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Click to manage grades</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Target size={16} />
        <span>{(courseData[course] || []).length} students graded</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-2">
        <User size={16} />
        <span>{enrolledStudents.length} enrolled students</span>
      </div>
    </div>
  );
};

export default CourseCard; 