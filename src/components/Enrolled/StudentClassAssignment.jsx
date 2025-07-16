import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';

// Available classes
const availableClasses = [
  'Project Management',
  'Renewable Energy Workshop Assistance', 
  'New Venture Creation',
  'Energy Efficiency Technician',
  'Solar Technician'
];

function StudentClassAssignment() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [classAssignments, setClassAssignments] = useState({
    'Project Management': [],
    'Renewable Energy Workshop Assistance': [],
    'New Venture Creation': [],
    'Energy Efficiency Technician': [],
    'Solar Technician': []
  });
  const [students, setStudents] = useState([]);

  // Fetch real students from Supabase
  React.useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from('register')
        .select('*')
        .eq('progress_management.application_review', 'approved')
        .order('first_name', { ascending: true });
      if (!error && data) {
        setStudents(data.map(student => ({
          id: student.national_id,
          name: `${student.first_name} ${student.surname}`,
          email: student.email
        })));
      }
    };
    fetchStudents();
  }, []);

  // Handle student selection
  const handleStudentSelect = (e) => {
    const options = Array.from(e.target.options);
    const selected = options.filter(o => o.selected).map(o => Number(o.value));
    setSelectedStudents(selected);
  };

  // Assign students to selected class
  const assignStudentsToClass = () => {
    if (!selectedClass || selectedStudents.length === 0) {
      alert('Please select a class and at least one student.');
      return;
    }
    const studentsToAssign = students.filter(student => 
      selectedStudents.includes(student.id)
    );

    setClassAssignments(prev => ({
      ...prev,
      [selectedClass]: [...prev[selectedClass], ...studentsToAssign]
    }));

    setSelectedStudents([]);
    alert(`${studentsToAssign.length} student(s) assigned to ${selectedClass}`);
  };

  // Remove student from class
  const removeStudentFromClass = (className, studentId) => {
    setClassAssignments(prev => ({
      ...prev,
      [className]: prev[className].filter(student => student.id !== studentId)
    }));
  };

  // Get students not yet assigned to any class
  const getUnassignedStudents = () => {
    const assignedStudentIds = Object.values(classAssignments)
      .flat()
      .map(student => student.id);
    
    return students.filter(student => !assignedStudentIds.includes(student.id));
  };

  const unassignedStudents = getUnassignedStudents();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Student Class Assignment</h1>

        {/* Assignment Section */}
        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">Assign Students to Classes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block font-medium mb-2">Select Class:</label>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Choose a class...</option>
                {availableClasses.map(className => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">Select Students:</label>
              <select 
                multiple 
                value={selectedStudents.map(String)} 
                onChange={handleStudentSelect}
                className="w-full border rounded px-3 py-2 min-h-32"
              >
                {unassignedStudents.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-600 mt-1">
                Hold Ctrl/Cmd to select multiple students
              </p>
            </div>

            <div className="flex items-end">
              <button
                onClick={assignStudentsToClass}
                disabled={!selectedClass || selectedStudents.length === 0}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Assign to Class
              </button>
            </div>
          </div>
        </div>

        {/* Current Assignments */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Current Class Assignments</h2>
          
          {availableClasses.map(className => (
            <div key={className} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-blue-800">{className}</h3>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {classAssignments[className].length} student(s)
                </span>
              </div>
              
              {classAssignments[className].length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {classAssignments[className].map(student => (
                    <div 
                      key={student.id} 
                      className="bg-gray-50 p-3 rounded border flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </div>
                      <button
                        onClick={() => removeStudentFromClass(className, student.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No students assigned to this class yet.</p>
              )}
            </div>
          ))}
        </div>

        {/* Unassigned Students Summary */}
        <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Unassigned Students</h3>
          {unassignedStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {unassignedStudents.map(student => (
                <div key={student.id} className="bg-white p-2 rounded border">
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-yellow-700">All students have been assigned to classes!</p>
          )}
        </div>

        {/* Export Assignments */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              const csvContent = [
                ['Class', 'Student Name', 'Email'],
                ...Object.entries(classAssignments).flatMap(([className, students]) =>
                  students.map(student => [className, student.name, student.email])
                )
              ].map(row => row.join(',')).join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'student_class_assignments.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Export Assignments
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentClassAssignment; 