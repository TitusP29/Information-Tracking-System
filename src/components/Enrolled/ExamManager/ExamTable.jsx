import React from 'react';
import { Edit, Trash2, UploadCloud } from 'lucide-react';

const ExamTable = ({
  exams,
  enrolledStudents,
  onEditExam,
  onDeleteExam,
  onPublishExam,
  onCreateNew
}) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Current Exams</h2>
        <button 
          onClick={onCreateNew} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <UploadCloud size={18} /> Create New Exam
        </button>
      </div>
      
      {exams.length === 0 ? (
        <div className="text-center text-slate-500 py-8">No exams found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Title</th>
                <th className="px-4 py-2 text-left font-semibold">Course</th>
                <th className="px-4 py-2 text-left font-semibold">Type</th>
                <th className="px-4 py-2 text-left font-semibold">Date</th>
                <th className="px-4 py-2 text-left font-semibold">Questions</th>
                <th className="px-4 py-2 text-left font-semibold">Total Marks</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-left font-semibold">Submission</th>
                <th className="px-4 py-2 text-left font-semibold">Assigned Students</th>
                <th className="px-4 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td className="px-4 py-2">{exam.title}</td>
                  <td className="px-4 py-2">{exam.course}</td>
                  <td className="px-4 py-2">{exam.examType}</td>
                  <td className="px-4 py-2">{exam.due_date}</td>
                  <td className="px-4 py-2">
                    {exam.sections ? exam.sections.reduce((sum, section) => sum + (section.questions ? section.questions.length : 0), 0) : 0}
                  </td>
                  <td className="px-4 py-2">{exam.max_score}</td>
                  <td className="px-4 py-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      exam.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {exam.status || 'draft'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      exam.submission_enabled !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {exam.submission_enabled !== false ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {exam.assigned_students && exam.assigned_students.length > 0 ? (
                      <span className="text-xs text-slate-700 dark:text-slate-200">
                        {exam.assigned_students.map(id => {
                          const s = enrolledStudents.find(stu => stu.id === id);
                          return s ? s.name : id;
                        }).join(', ')}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">None</span>
                    )}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button 
                      onClick={() => onEditExam(exam)} 
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button 
                      onClick={() => onDeleteExam(exam.id)} 
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                    {(exam.status === 'draft' || !exam.status) && (
                      <button 
                        onClick={() => onPublishExam(exam.id)} 
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded flex items-center gap-1"
                      >
                        <UploadCloud size={16} /> Publish
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExamTable; 