import React from 'react';
import { Plus, Edit, Loader2 } from 'lucide-react';
import ExamSections from './ExamSections';

const ExamForm = ({
  formData,
  setFormData,
  sections,
  setSections,
  selectedStudentIds,
  setSelectedStudentIds,
  enrolledStudents,
  editingId,
  saving,
  onSubmit,
  onCancel
}) => {
  const courses = [
    'Projects Manager',
    'New Venture Creation Skills Programme NQF Level 2 Credit 32',
    'Renewable Energy Workshop Assistant',
    'Energy Efficiency Technician',
    'Solar Technician'
  ];

  const examTypes = ['Quiz', 'Midterm', 'Final Exam', 'Practical Test'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Filter students by selected course
  const studentsForCourse = enrolledStudents.filter(s => s.course === formData.course);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 mb-8 border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
        {editingId ? 'Edit Exam' : 'Create New Exam'}
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium mb-1">Title:</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleInputChange} 
              required 
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500" 
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">Course:</label>
            <select 
              name="course" 
              value={formData.course} 
              onChange={handleInputChange} 
              required 
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            >
              {courses.map((course, index) => (
                <option key={index} value={course}>{course}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">Assign to Students:</label>
            <select
              multiple
              value={selectedStudentIds}
              onChange={e => setSelectedStudentIds(Array.from(e.target.selectedOptions, o => o.value))}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 min-h-[80px]"
            >
              {studentsForCourse.length === 0 ? (
                <option disabled>No students enrolled in this course</option>
              ) : (
                studentsForCourse.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.id})
                  </option>
                ))
              )}
            </select>
            <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple students</p>
          </div>
        </div>

        {/* Submission Enabled Toggle */}
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            id="submissionEnabled"
            name="submissionEnabled"
            checked={formData.submissionEnabled}
            onChange={handleInputChange}
            className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="submissionEnabled" className="font-medium text-slate-700 dark:text-slate-200">
            Enable Submission for Students
          </label>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium mb-1">Exam Type:</label>
            <select 
              name="examType" 
              value={formData.examType} 
              onChange={handleInputChange} 
              required 
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            >
              {examTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">Date:</label>
            <input 
              type="date" 
              name="date" 
              value={formData.date} 
              onChange={handleInputChange} 
              required 
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500" 
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">Duration (minutes):</label>
            <input 
              type="number" 
              name="duration" 
              value={formData.duration} 
              onChange={handleInputChange} 
              min="1" 
              required 
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500" 
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">Passing Score:</label>
            <input 
              type="number" 
              name="passingScore" 
              value={formData.passingScore} 
              onChange={handleInputChange} 
              min="1" 
              max={formData.totalMarks} 
              required 
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500" 
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Description:</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleInputChange} 
            rows="3" 
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 min-h-[60px]" 
          />
        </div>

        {/* Sections Component */}
        <ExamSections 
          sections={sections} 
          setSections={setSections} 
        />

        <div className="flex gap-4 mt-4">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {editingId ? <Edit size={18} /> : <Plus size={18} />} 
                {editingId ? 'Update Exam' : 'Save Exam'}
              </>
            )}
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={saving} 
            className="bg-slate-300 hover:bg-slate-400 disabled:bg-slate-200 text-slate-800 font-semibold px-6 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExamForm; 