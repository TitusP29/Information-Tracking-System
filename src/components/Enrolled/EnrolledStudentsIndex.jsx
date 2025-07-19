import React, { useContext } from 'react';
import EnrolledStudentsTable from './EnrolledStudentsTable';
import { EnrolledStudentsContext } from './EnrolledStudents';

export const useEnrolledStudents = () => {
  const context = useContext(EnrolledStudentsContext);
  if (!context) {
    throw new Error('useEnrolledStudents must be used within EnrolledStudentsProvider');
  }
  return context;
};

const EnrolledStudentsIndex = () => {
  const { students, loading, searchTerm, selectedCourse } = useEnrolledStudents();

  // Filter students based on search term and course
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'All' || student.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  return <EnrolledStudentsTable students={filteredStudents} loading={loading} />;
};

export default EnrolledStudentsIndex; 