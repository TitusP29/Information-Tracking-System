import React from "react";
import { Download } from 'lucide-react';

const ExportButton = ({ filteredAttendance, selectedClass, selectedMonth }) => {
  const handleExport = () => {
    const csvContent = [
      ['Date', 'Class', 'Time', 'Status', 'Type', 'Venue', 'Instructor'],
      ...filteredAttendance.map(record => [
        record.date,
        record.class,
        record.time || '',
        record.status,
        record.attendanceType,
        record.venue || '',
        record.instructor || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_attendance_${selectedClass}_${selectedMonth || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6 flex justify-end">
      <button 
        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg"
        onClick={handleExport}
      >
        <Download size={16} />
        Export My Attendance
      </button>
    </div>
  );
};

export default ExportButton; 