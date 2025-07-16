import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../../supabaseClient';
import { Download, UploadCloud, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';

const StudentAssignments = () => {
  const auth = useAuth();
  const user = auth?.user;
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchAssignments();
      fetchSubmissions();
    }
    // eslint-disable-next-line
  }, [user]);

  // Fetch assignments assigned to this student and published
  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get student's national_id
      const { data: regData, error: regError } = await supabase
        .from('register')
        .select('national_id')
        .eq('user_id', user.id)
        .single();
      if (regError) throw regError;
      const studentId = regData.national_id;
      // Fetch assignments assigned to this student
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('status', 'published');
      if (error) throw error;
      // Filter assignments assigned to this student
      const filteredAssignments = (data || []).filter(assignment => {
        const assignedStudents = assignment.assigned_students || [];
        return assignedStudents.includes(studentId) || assignedStudents.includes('all');
      });
      setAssignments(filteredAssignments);
    } catch (err) {
      setError('Failed to fetch assignments.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch submissions for this student
  const fetchSubmissions = async () => {
    try {
      const { data: regData, error: regError } = await supabase
        .from('register')
        .select('national_id')
        .eq('user_id', user.id)
        .single();
      if (regError) throw regError;
      const studentId = regData.national_id;
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', studentId);
      if (error) throw error;
      // Map by assignment_id
      const map = {};
      (data || []).forEach(sub => { map[sub.assignment_id] = sub; });
      setSubmissions(map);
    } catch (err) {
      // ignore
    }
  };

  // Download assignment as PDF
  const handleDownloadPDF = (assignment) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(assignment.title, 20, 20);
    doc.setFontSize(12);
    doc.text(`Course: ${assignment.course}`, 20, 35);
    doc.text(`Due Date: ${assignment.due_date}`, 20, 45);
    doc.text('Description:', 20, 60);
    doc.text(assignment.description, 20, 70, { maxWidth: 170 });
    // Sections
    if (assignment.sections && assignment.sections.length > 0) {
      let y = 85;
      assignment.sections.forEach((section, idx) => {
        doc.setFontSize(13);
        doc.text(`Section ${idx + 1}: ${section.heading}`, 20, y);
        y += 8;
        doc.setFontSize(11);
        doc.text(section.description, 25, y, { maxWidth: 160 });
        y += 8;
        if (section.questions && section.questions.length > 0) {
          section.questions.forEach((q, qIdx) => {
            doc.text(`Q${qIdx + 1}: ${q.title} - ${q.description}`, 30, y, { maxWidth: 150 });
            y += 7;
          });
        }
        y += 4;
      });
    }
    doc.save(`${assignment.title.replace(/\s/g, '_')}.pdf`);
  };

  // Handle PDF upload
  const handleFileChange = async (e, assignment) => {
    setUploading(true);
    setError(null);
    setSuccess(null);
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      setUploading(false);
      return;
    }
    try {
      // Get student's national_id
      const { data: regData, error: regError } = await supabase
        .from('register')
        .select('national_id')
        .eq('user_id', user.id)
        .single();
      if (regError) throw regError;
      const studentId = regData.national_id;
      // Upload to Supabase Storage
      const filePath = `assignments/${assignment.id}/${studentId}_${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assignment_submissions')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('assignment_submissions')
        .getPublicUrl(filePath);
      // Upsert submission record
      const { error: upsertError } = await supabase
        .from('assignment_submissions')
        .upsert({
          assignment_id: assignment.id,
          student_id: studentId,
          file_url: publicUrlData.publicUrl,
          submitted_at: new Date().toISOString()
        }, { onConflict: ['assignment_id', 'student_id'] });
      if (upsertError) throw upsertError;
      setSuccess('Assignment submitted successfully!');
      fetchSubmissions();
    } catch (err) {
      setError('Failed to submit assignment.');
    } finally {
      setUploading(false);
    }
  };

  const now = new Date();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-slate-800 dark:text-slate-100">
        <FileText className="text-blue-500" size={32} />
        My Assignments
      </h1>
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 rounded-xl p-4 mb-4 flex items-center gap-3">
          <XCircle size={20} />
          {error}
        </div>
      ) : (
        <div className="space-y-8">
          {assignments.length === 0 ? (
            <div className="text-center text-slate-500 py-12">No assignments assigned to you.</div>
          ) : (
            assignments.map(assignment => {
              const due = new Date(assignment.due_date);
              const isPastDue = now > due;
              const canSubmit = assignment.submission_enabled !== false && !isPastDue;
              const submission = submissions[assignment.id];
              return (
                <div key={assignment.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{assignment.title}</h2>
                      <div className="text-slate-500 dark:text-slate-400 text-sm">Course: {assignment.course}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">Due: {due.toLocaleDateString()}</span>
                      {isPastDue && <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Closed</span>}
                      {!isPastDue && <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Open</span>}
                    </div>
                  </div>
                  <div className="mb-4 text-slate-700 dark:text-slate-200">{assignment.description}</div>
                  <button
                    onClick={() => handleDownloadPDF(assignment)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 mb-4"
                  >
                    <Download size={18} /> Download as PDF
                  </button>
                  {submission && (
                    <div className="mb-2 flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle size={18} />
                      <a href={submission.file_url} target="_blank" rel="noopener noreferrer" className="underline">View your submitted PDF</a>
                      <span className="text-xs">({new Date(submission.submitted_at).toLocaleString()})</span>
                    </div>
                  )}
                  {canSubmit ? (
                    <div className="mt-2">
                      <label className="block font-medium mb-1">Submit your assignment (PDF only):</label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={e => handleFileChange(e, assignment)}
                        disabled={uploading}
                        className="mb-2"
                      />
                      {uploading && <Loader2 className="w-5 h-5 animate-spin text-blue-500 inline ml-2" />}
                      {success && <span className="ml-2 text-emerald-600 font-medium">{success}</span>}
                    </div>
                  ) : (
                    <div className="mt-2 text-slate-500 text-sm italic">Submission is closed for this assignment.</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default StudentAssignments; 