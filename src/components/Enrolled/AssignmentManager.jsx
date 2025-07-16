import React, { useState, useContext, useEffect } from 'react';
import { Plus, Edit, Trash2, UploadCloud, X, Loader2 } from 'lucide-react';
import { EnrolledStudentsContext } from './EnrolledStudents';
import { supabase } from '../../../supabaseClient';

const AssignmentManager = () => {
  // List of available courses
  const courses = [
    'Projects Manager',
    'New Venture Creation Skills Programme NQF Level 2 Credit 32',
    'Renewable Energy Workshop Assistant',
    'Energy Efficiency Technician',
    'Solar Technician'
  ];

  // State for assignments and form data
  const [assignments, setAssignments] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: courses[0],
    dueDate: '',
    maxScore: 100,
    submissionEnabled: true // NEW: default to enabled
  });
  const [editingId, setEditingId] = useState(null);
  const [sections, setSections] = useState([
    {
      heading: '',
      description: '',
      questions: [
        { title: '', description: '' }
      ]
    }
  ]);
  const { students: enrolledStudents } = useContext(EnrolledStudentsContext);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch assignments from database on component mount
  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAssignments(data || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      course: courses[0],
      dueDate: '',
      maxScore: 100,
      submissionEnabled: true
    });
    setSections([
      { heading: '', description: '', questions: [{ title: '', description: '' }] }
    ]);
    setSelectedStudentIds([]);
  };

  const handleEdit = (assignment) => {
    setEditingId(assignment.id);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      course: assignment.course,
      dueDate: assignment.due_date,
      maxScore: assignment.max_score,
      submissionEnabled: assignment.submission_enabled !== false // default to true if undefined
    });
    setSections(assignment.sections || [
      { heading: '', description: '', questions: [{ title: '', description: '' }] }
    ]);
    setSelectedStudentIds(assignment.assigned_students || []);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        const { error } = await supabase
          .from('assignments')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        // Refresh assignments list
        await fetchAssignments();
      } catch (err) {
        console.error('Error deleting assignment:', err);
        alert('Failed to delete assignment. Please try again.');
      }
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const assignmentData = {
        title: formData.title,
        description: formData.description,
        course: formData.course,
        due_date: formData.dueDate,
        max_score: formData.maxScore,
        submission_enabled: formData.submissionEnabled,
        status: 'draft',
        assigned_students: selectedStudentIds,
        sections: sections
      };

      if (editingId) {
        // Update existing assignment
        const { error } = await supabase
          .from('assignments')
          .update(assignmentData)
          .eq('id', editingId);
        
        if (error) throw error;
      } else {
        // Create new assignment
        const { error } = await supabase
          .from('assignments')
          .insert(assignmentData);
        
        if (error) throw error;
      }
      
      // Refresh assignments list
      await fetchAssignments();
      
      // Reset form
      handleCreate();
      setSections([
        { heading: '', description: '', questions: [{ title: '', description: '' }] }
      ]);
      setSelectedStudentIds([]);
    } catch (err) {
      console.error('Error saving assignment:', err);
      alert('Failed to save assignment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id) => {
    if (window.confirm('Are you sure you want to publish this assignment to students?')) {
      try {
        const { error } = await supabase
          .from('assignments')
          .update({ status: 'published' })
          .eq('id', id);
        
        if (error) throw error;
        
        // Refresh assignments list
        await fetchAssignments();
      } catch (err) {
        console.error('Error publishing assignment:', err);
        alert('Failed to publish assignment. Please try again.');
      }
    }
  };

  // Add section
  const handleAddSection = () => {
    setSections([
      ...sections,
      { heading: '', description: '', questions: [{ title: '', description: '' }] }
    ]);
  };
  // Remove section
  const handleRemoveSection = (sectionIdx) => {
    setSections(sections.filter((_, idx) => idx !== sectionIdx));
  };
  // Update section fields
  const handleSectionChange = (sectionIdx, field, value) => {
    setSections(sections.map((section, idx) =>
      idx === sectionIdx ? { ...section, [field]: value } : section
    ));
  };
  // Add question to section
  const handleAddQuestion = (sectionIdx) => {
    setSections(sections.map((section, idx) =>
      idx === sectionIdx
        ? { ...section, questions: [...section.questions, { title: '', description: '' }] }
        : section
    ));
  };
  // Remove question from section
  const handleRemoveQuestion = (sectionIdx, questionIdx) => {
    setSections(sections.map((section, idx) =>
      idx === sectionIdx
        ? { ...section, questions: section.questions.filter((_, qIdx) => qIdx !== questionIdx) }
        : section
    ));
  };
  // Update question fields
  const handleQuestionChange = (sectionIdx, questionIdx, field, value) => {
    setSections(sections.map((section, idx) =>
      idx === sectionIdx
        ? {
            ...section,
            questions: section.questions.map((q, qIdx) =>
              qIdx === questionIdx ? { ...q, [field]: value } : q
            )
          }
        : section
    ));
  };

  // Filter students by selected course
  const studentsForCourse = enrolledStudents.filter(s => s.course === formData.course);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100 flex items-center gap-3">
        <UploadCloud className="text-blue-500" size={32} />
        Assignment Management
      </h1>
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-slate-600 dark:text-slate-400">Loading assignments...</span>
        </div>
      )}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 mb-8 border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">{editingId ? 'Edit Assignment' : 'Create New Assignment'}</h2>
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Title:</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block font-medium mb-1">Description:</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} required className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[80px]" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Course:</label>
              <select name="course" value={formData.course} onChange={handleInputChange} required className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                {courses.map((course, index) => (
                  <option key={index} value={course}>{course}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">Due Date:</label>
              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} required className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">Maximum Score:</label>
              <input type="number" name="maxScore" value={formData.maxScore} onChange={handleInputChange} min="1" required className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">Assign to Students:</label>
              <select
                multiple
                value={selectedStudentIds}
                onChange={e => setSelectedStudentIds(Array.from(e.target.selectedOptions, o => o.value))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[80px]"
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
          {/* NEW: Submission Enabled Toggle */}
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="submissionEnabled"
              name="submissionEnabled"
              checked={formData.submissionEnabled}
              onChange={handleInputChange}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="submissionEnabled" className="font-medium text-slate-700 dark:text-slate-200">Enable Submission for Students</label>
          </div>
          {/* Sections UI */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Sections / Topics</h3>
              <button type="button" onClick={handleAddSection} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1"><Plus size={16} /> Add Section</button>
            </div>
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx} className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <input type="text" placeholder="Section Heading" value={section.heading} onChange={e => handleSectionChange(sectionIdx, 'heading', e.target.value)} className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                  <button type="button" onClick={() => handleRemoveSection(sectionIdx)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs"><X size={14} /> Remove</button>
                </div>
                <textarea placeholder="Section Description" value={section.description} onChange={e => handleSectionChange(sectionIdx, 'description', e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 mb-2 min-h-[40px]" />
                <div className="flex items-center justify-between mb-1 mt-2">
                  <span className="font-medium">Questions</span>
                  <button type="button" onClick={() => handleAddQuestion(sectionIdx)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs"><Plus size={14} /> Add Question</button>
                </div>
                {section.questions.map((q, questionIdx) => (
                  <div key={questionIdx} className="flex gap-2 mb-2">
                    <input type="text" placeholder="Question Title" value={q.title} onChange={e => handleQuestionChange(sectionIdx, questionIdx, 'title', e.target.value)} className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                    <input type="text" placeholder="Question Description" value={q.description} onChange={e => handleQuestionChange(sectionIdx, questionIdx, 'description', e.target.value)} className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                    <button type="button" onClick={() => handleRemoveQuestion(sectionIdx, questionIdx)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs"><X size={14} /> Remove</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4">
            <button 
              type="submit" 
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {editingId ? <Edit size={18} /> : <Plus size={18} />} 
                  {editingId ? 'Update' : 'Save'}
                </>
              )}
            </button>
            {editingId && (
              <button type="button" onClick={handleCreate} disabled={saving} className="bg-slate-300 hover:bg-slate-400 disabled:bg-slate-200 text-slate-800 font-semibold px-6 py-2 rounded-lg">Cancel</button>
            )}
          </div>
        </form>
      </div>
      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Current Assignments</h2>
          <button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={18} /> Create New Assignment
          </button>
        </div>
        {assignments.length === 0 ? (
          <div className="text-center text-slate-500 py-8">No assignments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Title</th>
                  <th className="px-4 py-2 text-left font-semibold">Course</th>
                  <th className="px-4 py-2 text-left font-semibold">Due Date</th>
                  <th className="px-4 py-2 text-left font-semibold">Max Score</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                  <th className="px-4 py-2 text-left font-semibold">Assigned Students</th>
                  <th className="px-4 py-2 text-left font-semibold">Submission</th>
                  <th className="px-4 py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-4 py-2">{assignment.title}</td>
                    <td className="px-4 py-2">{assignment.course}</td>
                    <td className="px-4 py-2">{assignment.due_date}</td>
                    <td className="px-4 py-2">{assignment.max_score}</td>
                    <td className="px-4 py-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${assignment.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{assignment.status}</span>
                    </td>
                    <td className="px-4 py-2">
                      {assignment.assigned_students && assignment.assigned_students.length > 0 ? (
                        <span className="text-xs text-slate-700 dark:text-slate-200">
                          {assignment.assigned_students.map(id => {
                            const s = enrolledStudents.find(stu => stu.id === id);
                            return s ? s.name : id;
                          }).join(', ')}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${assignment.submission_enabled !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {assignment.submission_enabled !== false ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button onClick={() => handleEdit(assignment)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1"><Edit size={16} /> Edit</button>
                      <button onClick={() => handleDelete(assignment.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1"><Trash2 size={16} /> Delete</button>
                      {assignment.status === 'draft' && (
                        <button onClick={() => handlePublish(assignment.id)} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded flex items-center gap-1"><UploadCloud size={16} /> Publish</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentManager;