import React, { useState } from 'react';

// Updated class list
const mockClasses = [
  { id: 1, name: 'Project Management' },
  { id: 2, name: 'Renewable Energy Workshop Assistance' },
  { id: 3, name: 'New Venture Creation' },
  { id: 4, name: 'Energy Efficiency Technician' },
  { id: 5, name: 'Solar Technician' },
];

// Mock student list (expand as needed)
const mockStudents = [
  { id: 101, name: 'Alice Johnson' },
  { id: 102, name: 'Bob Smith' },
  { id: 103, name: 'Charlie Lee' },
  { id: 104, name: 'David Kim' },
  { id: 105, name: 'Eva Brown' },
];

const attendanceStatuses = ['Present', 'Absent', 'Late', 'Excused'];

function AttendanceRegister() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [attendance, setAttendance] = useState({});
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Handle attendance change
  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Handle student selection
  const handleStudentSelect = (e) => {
    const options = Array.from(e.target.options);
    const selected = options.filter(o => o.selected).map(o => Number(o.value));
    setSelectedStudents(selected);
    // Remove attendance for unselected students
    setAttendance(prev => {
      const filtered = {};
      selected.forEach(id => {
        if (prev[id]) filtered[id] = prev[id];
      });
      return filtered;
    });
  };

  // Save handler (just a placeholder)
  const handleSave = () => {
    alert('Attendance saved locally!');
  };

  // Export to CSV
  const handleExport = () => {
    if (!selectedClass || !selectedDate) {
      alert('Please select class and date.');
      return;
    }
    const rows = [
      ['Student Name', 'Status', 'Date', 'Class'],
      ...selectedStudents.map((studentId) => {
        const student = mockStudents.find(s => s.id === studentId);
        return [
          student ? student.name : '',
          attendance[studentId] || 'Not Marked',
          selectedDate,
          mockClasses.find((c) => c.id === Number(selectedClass)).name,
        ];
      }),
    ];
    const csvContent = rows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedClass}_${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Attendance summary
  const summary = attendanceStatuses.reduce((acc, status) => {
    acc[status] = selectedStudents.filter((id) => attendance[id] === status).length;
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2>Attendance Register</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <label>Class:&nbsp;
            <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setAttendance({}); setSelectedStudents([]); }}>
              <option value="">Select Class</option>
              {mockClasses.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>Date:&nbsp;
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </label>
        </div>
        <div>
          <label>Students:&nbsp;
            <select multiple value={selectedStudents.map(String)} onChange={handleStudentSelect} style={{ minWidth: 180, minHeight: 80 }}>
              {mockStudents.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </label>
        </div>
        <button onClick={handleSave} disabled={!selectedClass || !selectedDate || selectedStudents.length === 0}>
          Save
        </button>
        <button onClick={handleExport} disabled={!selectedClass || !selectedDate || selectedStudents.length === 0}>
          Export CSV
        </button>
      </div>
      {selectedStudents.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Student Name</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Attendance</th>
            </tr>
          </thead>
          <tbody>
            {selectedStudents.map(studentId => {
              const student = mockStudents.find(s => s.id === studentId);
              return (
                <tr key={studentId}>
                  <td style={{ border: '1px solid #ddd', padding: 8 }}>{student ? student.name : ''}</td>
                  <td style={{ border: '1px solid #ddd', padding: 8 }}>
                    <select
                      value={attendance[studentId] || ''}
                      onChange={e => handleAttendanceChange(studentId, e.target.value)}
                    >
                      <option value="">Select</option>
                      {attendanceStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : selectedClass ? (
        <p>Please select students for this class.</p>
      ) : null}
      {selectedStudents.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>Attendance Summary</h4>
          <ul>
            {attendanceStatuses.map(status => (
              <li key={status}>{status}: {summary[status]}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AttendanceRegister; 