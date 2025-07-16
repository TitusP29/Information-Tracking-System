import React from "react";
import { Plus, Save, X, Loader2 } from 'lucide-react';

const GradeForm = ({ 
  selectedCourse, 
  studentName, 
  setStudentName, 
  studentId, 
  setStudentId, 
  grade, 
  setGrade, 
  comment, 
  setComment, 
  enrolledStudents, 
  isEditing, 
  saving, 
  onSubmit, 
  onCancel 
}) => {
  if (!selectedCourse) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700 mb-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
          <Plus className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {isEditing ? "Edit Grade" : "Add Grade"} for {selectedCourse}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">Enter student grade information</p>
        </div>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Select Student</label>
            <select
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                if (e.target.value) {
                  const student = enrolledStudents.find(s => s.national_id === e.target.value);
                  if (student) {
                    setStudentName(`${student.first_name} ${student.last_name}`);
                  }
                } else {
                  setStudentName("");
                }
              }}
              required
              className="w-full px-4 py-4 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white text-lg transition-all duration-200"
            >
              <option value="">Choose a student...</option>
              {enrolledStudents.map(student => (
                <option key={student.national_id} value={student.national_id}>
                  {student.first_name} {student.last_name} ({student.national_id})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Student Name</label>
            <input
              type="text"
              value={studentName}
              readOnly
              className="w-full px-4 py-4 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-100 dark:bg-slate-600 dark:text-white text-lg"
              placeholder="Will be auto-filled when student is selected"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Grade (0-100)</label>
          <input
            type="number"
            placeholder="Enter grade (0-100)"
            min={0}
            max={100}
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            required
            className="w-full px-4 py-4 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white text-lg transition-all duration-200"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Comment / Feedback</label>
          <textarea
            placeholder="Enter feedback or comments"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full px-4 py-4 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white text-lg transition-all duration-200 resize-none"
          />
        </div>
        
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center gap-3 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                {isEditing ? "Update Grade" : "Save Grade"}
              </>
            )}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 font-semibold flex items-center gap-3"
            >
              <X size={20} />
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default GradeForm; 