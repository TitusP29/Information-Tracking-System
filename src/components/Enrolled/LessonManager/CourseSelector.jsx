import React from 'react';

const CourseSelector = ({ courses, selectedCourse, onCourseSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
      <select
        value={selectedCourse?.id || ''}
        onChange={(e) => {
          const course = courses.find(c => c.id === e.target.value);
          onCourseSelect(course);
        }}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {courses.map(course => (
          <option key={course.id} value={course.id}>
            {course.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CourseSelector; 