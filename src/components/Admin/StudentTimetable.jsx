import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const availableClasses = [
  'Project Management',
  'Renewable Energy Workshop Assistance',
  'New Venture Creation',
  'Energy Efficiency Technician',
  'Solar Technician'
];
const availableInstructors = [
  'Dr. Smith',
  'Prof. Johnson',
  'Ms. Davis',
  'Mr. Wilson',
  'Dr. Brown',
  'Prof. Anderson',
  'Ms. Garcia'
];
const classTypes = ['Physical', 'Virtual'];
const mockStudents = [
  'Titus Kubayi',
  'Alice Johnson',
  'Bob Smith',
  'Charlie Lee',
  'David Kim',
  'Eva Brown'
];

function StudentTimetable() {
  const [rows, setRows] = useState([]);
  const [noClassesText, setNoClassesText] = useState('No classes scheduled');
  const [previewMode, setPreviewMode] = useState(false);

  const addRow = () => {
    setRows([
      ...rows,
      {
        students: [],
        day: '',
        time: '',
        className: '',
        instructor: '',
        type: '',
        location: ''
      }
    ]);
  };

  const updateRow = (idx, field, value) => {
    setRows(rows.map((row, i) =>
      i === idx ? { ...row, [field]: value, location: field === 'type' ? value : row.location } : row
    ));
  };

  const updateRowStudents = (idx, selectedOptions) => {
    const selected = Array.from(selectedOptions).filter(o => o.selected).map(o => o.value);
    setRows(rows.map((row, i) =>
      i === idx ? { ...row, students: selected } : row
    ));
  };

  const removeRow = (idx) => {
    setRows(rows.filter((_, i) => i !== idx));
  };

  const saveTimetableToSupabase = async () => {
    if (rows.length === 0) {
      alert('No classes to save.');
      return;
    }

    try {
      // First, clear existing timetable data
      const { error: deleteError } = await supabase
        .from('timetables')
        .delete()
        .neq('id', 0); // Delete all records

      if (deleteError) throw deleteError;

      // Prepare data for insertion
      const timetableData = rows.map(row => ({
        day: row.day,
        time: row.time,
        class_name: row.className,
        location: row.location,
        instructor: row.instructor,
        type: row.type,
        students: row.students || []
      }));

      // Insert new timetable data
      const { data, error } = await supabase
        .from('timetables')
        .insert(timetableData);

      if (error) throw error;

      alert('Timetable saved successfully! Students can now view their schedules.');
    } catch (error) {
      console.error('Error saving timetable:', error);
      alert('Error saving timetable: ' + error.message);
    }
  };

  const exportTimetable = () => {
    if (rows.length === 0) {
      alert('No classes to export.');
      return;
    }
    const csvContent = [
      ['Students', 'Day', 'Time', 'Class', 'Location', 'Instructor', 'Type'],
      ...rows.map(row => [
        (row.students || []).join('; '),
        row.day,
        row.time,
        row.className,
        row.type === 'Virtual' || row.type === 'Physical' ? row.type : row.location,
        row.instructor,
        row.type
      ])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_timetable_manual.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Student Timetable Generator (Manual)</h2>
      <div className="mb-8 flex gap-4">
        <button
          onClick={addRow}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          Add Class Row
        </button>
        <button
          onClick={saveTimetableToSupabase}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium"
        >
          Save to Database
        </button>
        <button
          onClick={exportTimetable}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          Export CSV
        </button>
        {rows.length > 0 && !previewMode && (
          <button
            onClick={() => setPreviewMode(true)}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 font-medium"
          >
            Preview Timetable
          </button>
        )}
        {previewMode && (
          <button
            onClick={() => setPreviewMode(false)}
            className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 font-medium"
          >
            Back to Edit
          </button>
        )}
      </div>
      {rows.length === 0 ? (
        <div className="mb-8">
          <label className="block text-base font-semibold text-gray-800 mb-2">No Classes Message</label>
          <textarea
            value={noClassesText}
            onChange={e => setNoClassesText(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <div className="mt-4 text-gray-500 italic">This message will be shown if there are no classes scheduled.</div>
        </div>
      ) : previewMode ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student(s)</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Day</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Class</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Instructor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const students = row.students || [];
                return (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="px-6 py-4 min-w-[240px]">
                      <div className="text-base text-gray-800 whitespace-pre-line">
                        {students.length > 0 ? students.join(', ') : 'No students selected'}
                      </div>
                    </td>
                    <td className="px-6 py-4">{row.day}</td>
                    <td className="px-6 py-4">{row.time}</td>
                    <td className="px-6 py-4">{row.className}</td>
                    <td className="px-6 py-4">{row.location}</td>
                    <td className="px-6 py-4">{row.instructor}</td>
                    <td className="px-6 py-4">{row.type}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student(s)</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Day</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Class</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Instructor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Remove</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const students = row.students || [];
                return (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="px-6 py-4 min-w-[240px]">
                      <select
                        multiple
                        value={students}
                        onChange={e => updateRowStudents(idx, e.target.options)}
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full min-h-[120px] text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[220px]"
                        size={Math.max(5, mockStudents.length)}
                      >
                        {mockStudents.map(student => (
                          <option key={student} value={student} className="py-2 text-base">{student}</option>
                        ))}
                      </select>
                      <div className="text-xs text-gray-500 mt-1 truncate max-w-[220px]">
                        {students.length > 0 ? students.join(', ') : 'No students selected'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={row.day}
                        onChange={e => updateRow(idx, 'day', e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 w-full"
                      >
                        <option value="">Select Day</option>
                        {daysOfWeek.map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="time"
                        value={row.time}
                        onChange={e => updateRow(idx, 'time', e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={row.className}
                        onChange={e => updateRow(idx, 'className', e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 w-full"
                      >
                        <option value="">Select Class</option>
                        {availableClasses.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={row.location}
                        onChange={e => updateRow(idx, 'location', e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 w-full"
                        placeholder={
                          row.type === 'Virtual'
                            ? 'Enter meeting link (Google Meet, Teams, etc.)'
                            : row.type === 'Physical'
                            ? 'Enter physical location (Room, Building, etc.)'
                            : 'Enter location or meeting link'
                        }
                      />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={row.instructor}
                        onChange={e => updateRow(idx, 'instructor', e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 w-full"
                      >
                        <option value="">Select Instructor</option>
                        {availableInstructors.map(instr => (
                          <option key={instr} value={instr}>{instr}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={row.type}
                        onChange={e => updateRow(idx, 'type', e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 w-full"
                      >
                        <option value="">Select Type</option>
                        {classTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => removeRow(idx)}
                        className="text-red-600 hover:text-red-800 font-bold text-lg"
                        title="Remove Row"
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {rows.length === 0 && (
        <div className="mt-8 text-center text-gray-500 italic text-lg">{noClassesText}</div>
      )}
    </div>
  );
}

export default StudentTimetable; 