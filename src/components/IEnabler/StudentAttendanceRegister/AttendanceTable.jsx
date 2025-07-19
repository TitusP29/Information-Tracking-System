import React from "react";
import { Calendar, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const AttendanceTable = ({ filteredAttendance }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-50 to-emerald-50 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
              <Calendar className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Attendance Records</h2>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {filteredAttendance.length} records found
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
            <tr>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                  <Calendar size={16} />
                  <span className="text-sm uppercase tracking-wider">Date</span>
                </div>
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                  <span className="text-sm uppercase tracking-wider">Class</span>
                </div>
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                  <Clock size={16} />
                  <span className="text-sm uppercase tracking-wider">Time</span>
                </div>
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                  <span className="text-sm uppercase tracking-wider">Status</span>
                </div>
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                  <span className="text-sm uppercase tracking-wider">Type</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {filteredAttendance.length > 0 ? (
              filteredAttendance.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all duration-200"
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">
                          {new Date(record.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {new Date(record.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {record.venue || 'No venue specified'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{record.class}</div>
                    {record.instructor && (
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {record.instructor}
                      </div>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="text-slate-400" size={16} />
                      <span className="text-slate-900 dark:text-slate-100">
                        {record.time || 'No time specified'}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-semibold ${
                        record.status === "Present"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                          : record.status === "Absent"
                          ? "bg-gradient-to-r from-red-500 to-pink-500"
                          : "bg-gradient-to-r from-amber-500 to-orange-500"
                      }`}
                    >
                      {record.status === "Present" && <CheckCircle size={12} />}
                      {record.status === "Absent" && <XCircle size={12} />}
                      {record.status === "Late" && <AlertTriangle size={12} />}
                      {record.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold
                      ${record.attendanceType === "Physical" 
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" 
                        : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"}`}
                    >
                      {record.attendanceType}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-3 sm:px-6 py-12 text-center">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                      No attendance records found for the selected filters.
                    </p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
                      Your attendance records will appear here once they are recorded by your instructor.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable; 