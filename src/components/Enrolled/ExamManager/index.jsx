import React, { useState, useContext, useEffect } from 'react';
import { FileQuestion, Loader2 } from 'lucide-react';
import { EnrolledStudentsContext } from '../EnrolledStudents';
import { supabase } from '../../../../supabaseClient';
import ExamForm from './ExamForm';
import ExamTable from './ExamTable';

const ExamManager = () => {
  // State for exams and form data
  const [exams, setExams] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: 'Projects Manager',
    examType: 'Quiz',
    date: '',
    duration: 60, // in minutes
    totalMarks: 100,
    passingScore: 50,
    questions: [],
    submissionEnabled: true
  });
  const [sections, setSections] = useState([
    {
      heading: '',
      description: '',
      questions: [
        {
          text: '',
          options: ['', '', '', ''],
          correctOption: 0,
          marks: 1
        }
      ]
    }
  ]);
  const [editingId, setEditingId] = useState(null);
  const { students: enrolledStudents } = useContext(EnrolledStudentsContext);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch exams from database on component mount
  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setExams(data || []);
    } catch (err) {
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset form to create new exam
  const handleCreateExam = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      course: 'Projects Manager',
      examType: 'Quiz',
      date: '',
      duration: 60,
      totalMarks: 100,
      passingScore: 50,
      questions: [],
      submissionEnabled: true
    });
    setSections([
      {
        heading: '',
        description: '',
        questions: [
          { text: '', options: ['', '', '', ''], correctOption: 0, marks: 1 }
        ]
      }
    ]);
    setSelectedStudentIds([]);
  };

  // Edit existing exam
  const handleEditExam = (exam) => {
    setEditingId(exam.id);
    setFormData({
      title: exam.title,
      description: exam.description,
      course: exam.course,
      examType: exam.examType || 'Quiz',
      date: exam.due_date,
      duration: exam.duration || 60,
      totalMarks: exam.max_score,
      passingScore: exam.passingScore || 50,
      questions: [], // not used with sections
      submissionEnabled: exam.submission_enabled !== false // default to true if undefined
    });
    setSections(exam.sections || [
      {
        heading: '',
        description: '',
        questions: [
          { text: '', options: ['', '', '', ''], correctOption: 0, marks: 1 }
        ]
      }
    ]);
    setSelectedStudentIds(exam.assigned_students || []);
  };

  // Delete exam
  const handleDeleteExam = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        const { error } = await supabase
          .from('exams')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        // Refresh exams list
        await fetchExams();
      } catch (err) {
        console.error('Error deleting exam:', err);
        alert('Failed to delete exam. Please try again.');
      }
    }
  };

  // Publish exam to students
  const handlePublishExam = async (id) => {
    if (window.confirm('Are you sure you want to publish this exam to students?')) {
      try {
        const { error } = await supabase
          .from('exams')
          .update({ status: 'published' })
          .eq('id', id);
        
        if (error) throw error;
        
        // Refresh exams list
        await fetchExams();
      } catch (err) {
        console.error('Error publishing exam:', err);
        alert('Failed to publish exam. Please try again.');
      }
    }
  };

  // Submit exam form (create or update)
  const handleSubmitExam = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    if (sections.length === 0) {
      alert('Please add at least one section to the exam');
      setSaving(false);
      return;
    }

    try {
      // Calculate total marks from all sections/questions
      const calculatedTotalMarks = sections.reduce(
        (sum, section) => sum + section.questions.reduce((s, q) => s + parseInt(q.marks), 0),
        0
      );

      const examData = {
        title: formData.title,
        description: formData.description,
        course: formData.course,
        due_date: formData.date,
        max_score: calculatedTotalMarks,
        submission_enabled: formData.submissionEnabled,
        status: 'draft',
        assigned_students: selectedStudentIds,
        sections: sections
      };

      if (editingId) {
        // Update existing exam
        const { error } = await supabase
          .from('exams')
          .update(examData)
          .eq('id', editingId);
        
        if (error) throw error;
      } else {
        // Create new exam
        const { error } = await supabase
          .from('exams')
          .insert(examData);
        
        if (error) throw error;
      }
      
      // Refresh exams list
      await fetchExams();
      
      // Reset form
      handleCreateExam();
    } catch (err) {
      console.error('Error saving exam:', err);
      alert('Failed to save exam. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 max-w-5xl mx-auto mt-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className="ml-2 text-slate-600 dark:text-slate-400">Loading exams...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 max-w-5xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100 flex items-center gap-3">
        <FileQuestion className="text-purple-500" size={32} />
        Exam Management
      </h1>

      {/* Exam Form Component */}
      <ExamForm
        formData={formData}
        setFormData={setFormData}
        sections={sections}
        setSections={setSections}
        selectedStudentIds={selectedStudentIds}
        setSelectedStudentIds={setSelectedStudentIds}
        enrolledStudents={enrolledStudents}
        editingId={editingId}
        saving={saving}
        onSubmit={handleSubmitExam}
        onCancel={handleCreateExam}
      />

      {/* Exam Table Component */}
      <ExamTable
        exams={exams}
        enrolledStudents={enrolledStudents}
        onEditExam={handleEditExam}
        onDeleteExam={handleDeleteExam}
        onPublishExam={handlePublishExam}
        onCreateNew={handleCreateExam}
      />
    </div>
  );
};

export default ExamManager; 