import React from "react";
import { 
  User, 
  Award, 
  BarChart3, 
  Target, 
  BookOpen, 
  GraduationCap, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';

const GradeTable = ({ 
  course, 
  students, 
  filteredStudents, 
  courseData, 
  onEdit, 
  onDelete, 
  setSelectedCourse 
}) => {
  const getStatus = (grade) => (grade >= 50 ? "Pass" : "Fail");

  const getStatusBadge = (grade) => {
    const isPass = grade >= 50;
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl font-semibold text-sm shadow-lg ${
        isPass 
          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white" 
          : "bg-gradient-to-r from-red-500 to-red-600 text-white"
      }`}>
        {isPass ? <CheckCircle size={14} /> : <XCircle size={14} />}
        {getStatus(grade)}
      </div>
    );
  };

  const calculateCourseAverage = (grades) => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, curr) => acc + curr.grade, 0);
    return (sum / grades.length).toFixed(2);
  };

  const calculateStudentOverallAverage = (studentId) => {
    let total = 0;
    let count = 0;
    Object.values(courseData).forEach((students) => {
      students.forEach((s) => {
        if (s.studentId.toLowerCase() === studentId.toLowerCase()) {
          total += s.grade;
          count++;
        }
      });
    });
    return count > 0 ? (total / count).toFixed(2) : "-";
  };

  if (filteredStudents.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-slate-50 to-emerald-50 dark:from-slate-700 dark:to-slate-800 px-8 py-6 border-b border-slate-200 dark:border-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{course}</h3>
              <p className="text-slate-600 dark:text-slate-400">Student grades and performance</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium">Course Average:</span>
            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full font-bold">
              {calculateCourseAverage(filteredStudents)}
            </span>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
            <tr>
              <th className="px-8 py-6 text-left">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-semibold">
                  <User size={18} />
                  <span className="text-sm uppercase tracking-wider">Name</span>
                </div>
              </th>
              <th className="px-8 py-6 text-left">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-semibold">
                  <Award size={18} />
                  <span className="text-sm uppercase tracking-wider">Student #</span>
                </div>
              </th>
              <th className="px-8 py-6 text-left">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-semibold">
                  <BarChart3 size={18} />
                  <span className="text-sm uppercase tracking-wider">Grade</span>
                </div>
              </th>
              <th className="px-8 py-6 text-left">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-semibold">
                  <Target size={18} />
                  <span className="text-sm uppercase tracking-wider">Status</span>
                </div>
              </th>
              <th className="px-8 py-6 text-left">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-semibold">
                  <BookOpen size={18} />
                  <span className="text-sm uppercase tracking-wider">Comment</span>
                </div>
              </th>
              <th className="px-8 py-6 text-left">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-semibold">
                  <GraduationCap size={18} />
                  <span className="text-sm uppercase tracking-wider">Overall Avg</span>
                </div>
              </th>
              <th className="px-8 py-6 text-left">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-semibold">
                  <Edit size={18} />
                  <span className="text-sm uppercase tracking-wider">Actions</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {filteredStudents.map((student, index) => (
              <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all duration-200 group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                        {student.name}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-sm">
                        Student
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">{student.studentId.slice(-4)}</span>
                    </div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {student.studentId}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <BarChart3 className="text-blue-600 dark:text-blue-400" size={18} />
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                      {student.grade}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  {getStatusBadge(student.grade)}
                </td>
                <td className="px-8 py-6">
                  <div className="max-w-xs">
                    <div className="text-slate-900 dark:text-slate-100">
                      {student.comment || "-"}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <GraduationCap className="text-purple-600 dark:text-purple-400" size={18} />
                    </div>
                    <div className="font-semibold text-purple-600 dark:text-purple-400 text-lg">
                      {calculateStudentOverallAverage(student.studentId)}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        onEdit(index, student);
                      }}
                      className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl group-hover:scale-105"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        onDelete(index);
                      }}
                      className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl group-hover:scale-105"
                    >
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
            <span>Showing {filteredStudents.length} of {students.length} students</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeTable; 