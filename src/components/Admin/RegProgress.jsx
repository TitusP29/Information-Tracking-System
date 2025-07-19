import React, { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { toast, Toaster } from 'react-hot-toast';
import {
  ClipboardList,
  Eye,
  CheckCircle,
  Clock,
  X,
  AlertCircle,
  FileText,
  Download,
  ArrowRight,
  Calendar,
  User,
  GraduationCap,
  CheckSquare,
  Square
} from 'lucide-react';

const PDFViewer = ({ fileUrl }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  
  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
      <Viewer
        fileUrl={fileUrl}
        plugins={[defaultLayoutPluginInstance]}
        defaultScale={1}
      />
    </Worker>
  );
};

const RegProgress = () => {
  const [students, setStudents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    // Fetch all students with required fields from register table
    const { data, error } = await supabase
      .from('register')
      .select('*')
      .order('reg_date', { ascending: false });
    if (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      return;
    }
    // For each student, fetch their progress from progress_management table
    const studentsWithProgress = await Promise.all((data || []).map(async (student) => {
      const { data: progressData, error: progressError } = await supabase
        .from('progress_management')
        .select('*')
        .eq('student_number', student.national_id)
        .single();
      
      // If no progress record exists, create one
      if (!progressData && !progressError) {
        const { data: newProgress, error: createError } = await supabase
          .from('progress_management')
          .insert({
            student_number: student.national_id,
            application_submitted: 'pending',
            document_uploaded: 'pending',
            payment_verified: 'pending',
            application_review: 'pending'
          })
          .select()
          .single();
        
        return {
          ...student,
          progress: newProgress || {
            application_submitted: 'pending',
            document_uploaded: 'pending',
            payment_verified: 'pending',
            application_review: 'pending'
          }
        };
      }

      return {
        ...student,
        progress: progressData || {
          application_submitted: 'pending',
          document_uploaded: 'pending',
          payment_verified: 'pending',
          application_review: 'pending'
        }
      };
    }));
    setStudents(studentsWithProgress);
  };

  const updateProgress = async (studentNumber, field, status) => {
    try {
      // Define valid statuses based on the field
      const validStatuses = field === 'application_review' 
        ? ['pending', 'in_progress', 'approved', 'rejected']
        : ['pending', 'in_progress', 'complete', 'rejected'];

      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}. For ${field}, must be one of: ${validStatuses.join(', ')}`);
      }

      const { data, error } = await supabase
        .from('progress_management')
        .update({ [field]: status })
        .eq('student_number', studentNumber)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setStudents(prevStudents => 
        prevStudents.map(student => 
          student.national_id === studentNumber
            ? { ...student, progress: { ...student.progress, [field]: status } }
            : student
        )
      );

      // Update selected student if modal is open
      if (selectedStudent && selectedStudent.national_id === studentNumber) {
        setSelectedStudent(prev => ({
          ...prev,
          progress: { ...prev.progress, [field]: status }
        }));
      }

      return data;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  };

  const handleViewProgress = async (student) => {
    // Fetch all documents for this student
    const { data: docsData, error: docsError } = await supabase
      .from('documents')
      .select('*, attachments(*)')
      .eq('user_id', student.user_id);

    if (docsError) {
      console.error('Error fetching documents:', docsError);
      return;
    }

    // Process all attachments
    const allAttachments = await Promise.all(
      (docsData || []).flatMap(doc => doc.attachments || []).map(async (attachment) => {
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('documents')
          .createSignedUrl(attachment.file_path, 60 * 60); // 1 hour expiry

        return {
          ...attachment,
          file_url: signedUrlData?.signedUrl || null,
          file_type: attachment.file_type,
          document_id: attachment.document_id
        };
      })
    );

    setSelectedStudent({ ...student, attachments: allAttachments });
    setModalOpen(true);
  };
  



  return (
    <div className="space-y-8">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-700 dark:text-cyan-400 flex items-center gap-3">
          <ClipboardList className="text-blue-600 dark:text-cyan-300" size={32} />
          Registration Progress Management
        </h1>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-x-auto">
        <table className="min-w-[600px] md:min-w-full text-xs md:text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-2 md:px-8 py-2 md:py-4 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Student Number</th>
                <th className="px-2 md:px-8 py-2 md:py-4 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-2 md:px-8 py-2 md:py-4 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Course</th>
                <th className="px-2 md:px-8 py-2 md:py-4 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-2 md:px-8 py-2 md:py-4 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Registration Date</th>
                <th className="px-2 md:px-8 py-2 md:py-4 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {students.map(student => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {student.national_id}
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {student.first_name} {student.surname}
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {student.course}
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      student.progress?.application_review === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 
                      student.progress?.application_review === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                    }`}>
                      {student.progress?.application_review === 'approved' ? 'Approved' : 
                       student.progress?.application_review === 'rejected' ? 'Rejected' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {student.reg_date ? new Date(student.reg_date).toLocaleDateString() : ''}
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleViewProgress(student)} 
                      className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl shadow-lg transition-colors font-semibold flex items-center gap-2"
                    >
                      <Eye size={16} />
                      View Progress
                      <ArrowRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      {/* Progress Modal */}
      {modalOpen && selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-3 sm:p-8 w-full max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl bg-gray-100 dark:bg-gray-700 rounded-full w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            
            <h3 className="text-2xl font-bold text-blue-700 dark:text-cyan-400 mb-6 flex items-center gap-3">
              <User className="text-blue-600 dark:text-cyan-300" size={24} />
              Progress Management - {selectedStudent.first_name} {selectedStudent.surname}
            </h3>
            
            <div className="space-y-6">
              {/* Application Submitted Step */}
              <ProgressStep
                label="Application Submitted"
                required
                status={selectedStudent.progress?.application_submitted || 'pending'}
                lastUpdated={selectedStudent.progress?.updated_at}
                onUpdate={async (newStatus) => {
                  await updateProgress(selectedStudent.national_id, 'application_submitted', newStatus);
                }}
                previewDoc={previewDoc}
                setPreviewDoc={setPreviewDoc}
              />

              {/* Documents Uploaded Step */}
              <ProgressStep
                label="Documents Uploaded"
                required
                status={selectedStudent.progress?.document_uploaded || 'pending'}
                lastUpdated={selectedStudent.progress?.updated_at}
                onUpdate={async (newStatus) => {
                  await updateProgress(selectedStudent.national_id, 'document_uploaded', newStatus);
                }}
                showViewDocuments
                attachments={selectedStudent.attachments || []}
                previewDoc={previewDoc}
                setPreviewDoc={setPreviewDoc}
              />

              {/* Payment Verified Step */}
              <ProgressStep
                label="Payment Verified"
                required
                status={selectedStudent.progress?.payment_verified || 'pending'}
                lastUpdated={selectedStudent.progress?.updated_at}
                onUpdate={async (newStatus) => {
                  await updateProgress(selectedStudent.national_id, 'payment_verified', newStatus);
                }}
                previewDoc={previewDoc}
                setPreviewDoc={setPreviewDoc}
              />

              {/* Application Review Card */}
              <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`inline-block w-6 h-6 rounded-full ${
                      selectedStudent.progress?.application_review === 'approved' ? 'bg-emerald-500 border-2 border-emerald-700' :
                      selectedStudent.progress?.application_review === 'rejected' ? 'bg-red-500 border-2 border-red-700 flex items-center justify-center' :
                      'bg-amber-400 border-2 border-amber-600'
                    }`}>
                      {selectedStudent.progress?.application_review === 'rejected' ? <X size={12} className="text-white" /> : ''}
                    </span>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">Application Review</h4>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className={`px-6 py-2 rounded-xl font-semibold transition-colors ${
                        selectedStudent.progress?.application_review === 'approved' ? 'bg-emerald-600 text-white' :
                        'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                      }`}
                      onClick={async () => {
                        // Check if all other fields are complete
                        const progress = selectedStudent.progress;
                        const incompleteFields = [];
                        
                        if (progress.application_submitted !== 'complete') {
                          incompleteFields.push('Application Submission');
                        }
                        if (progress.document_uploaded !== 'complete') {
                          incompleteFields.push('Document Upload');
                        }
                        if (progress.payment_verified !== 'complete') {
                          incompleteFields.push('Payment Verification');
                        }

                        if (incompleteFields.length > 0) {
                          toast.error(`Cannot approve application. The following fields are not complete: ${incompleteFields.join(', ')}`);
                          return;
                        }

                        await updateProgress(selectedStudent.national_id, 'application_review', 'approved');
                        toast.success('Application approved successfully! Student is now enrolled.');
                        
                        // Refresh enrolled students list if the function exists
                        if (window.refreshEnrolledStudents) {
                          setTimeout(() => {
                            window.refreshEnrolledStudents();
                          }, 1000);
                        }
                      }}
                    >Approve</button>
                    <button
                      className={`px-6 py-2 rounded-xl font-semibold transition-colors ${
                        selectedStudent.progress?.application_review === 'in_progress' ? 'bg-blue-600 text-white' :
                        'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                      }`}
                      onClick={async () => {
                        await updateProgress(selectedStudent.national_id, 'application_review', 'in_progress');
                        toast.success('Application status updated to In Progress');
                      }}
                    >In Progress</button>
                    <button
                      className={`px-6 py-2 rounded-xl font-semibold transition-colors ${
                        selectedStudent.progress?.application_review === 'rejected' ? 'bg-red-600 text-white' :
                        'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                      }`}
                      onClick={async () => {
                        await updateProgress(selectedStudent.national_id, 'application_review', 'rejected');
                        toast.success('Application rejected');
                      }}
                    >Reject</button>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              className="mt-8 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-xl shadow-lg font-semibold transition-colors"
              onClick={() => setModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <FileText className="text-blue-600 dark:text-cyan-300" size={24} />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Preview: {previewDoc.type.charAt(0).toUpperCase() + previewDoc.type.slice(1)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">{previewDoc.file_type}</span>
            </div>
            <button 
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition-colors duration-200 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-xl"
              onClick={() => setPreviewDoc(null)}
            >
              <X size={20} />
              Close Preview
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <PDFViewer fileUrl={previewDoc.file_url} />
          </div>
        </div>
      )}
    </div>
  );
};

function ProgressStep({ label, required, status, lastUpdated, onUpdate, showViewDocuments, attachments, previewDoc, setPreviewDoc }) {
  const [showDocs, setShowDocs] = useState(false);
  const REQUIRED_TYPES = ['id', 'certificate', 'residence', 'payment'];

  let statusColor, icon, borderColor, bgColor;
  if (status === 'complete' || status === 'approved') {
    statusColor = 'bg-emerald-500';
    icon = <CheckCircle className="w-6 h-6 text-emerald-600" />;
    borderColor = 'border-emerald-200 dark:border-emerald-700';
    bgColor = 'bg-emerald-50 dark:bg-emerald-900/20';
  } else if (status === 'in_progress') {
    statusColor = 'bg-amber-500';
    icon = <Clock className="w-6 h-6 text-amber-600" />;
    borderColor = 'border-amber-200 dark:border-amber-700';
    bgColor = 'bg-blue-50 dark:bg-blue-900/20';
  } else if (status === 'rejected') {
    statusColor = 'bg-red-500';
    icon = <X className="w-6 h-6 text-red-600" />;
    borderColor = 'border-red-200 dark:border-red-700';
    bgColor = 'bg-red-50 dark:bg-red-900/20';
  } else {
    statusColor = 'bg-gray-500';
    icon = <Square className="w-6 h-6 text-gray-600" />;
    borderColor = 'border-gray-200 dark:border-gray-700';
    bgColor = 'bg-gray-100 dark:bg-gray-800';
  }

  const handleViewFile = (doc) => {
    if (doc.file_type === 'application/pdf') {
      setPreviewDoc(doc);
    } else {
      toast.error('This file is not a PDF. Only PDF files can be previewed.');
    }
  };

  return (
    <div className={`flex items-center justify-between p-6 rounded-2xl border-2 ${borderColor} ${bgColor} shadow-lg`}>
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <div className="font-bold text-lg text-gray-900 dark:text-white">
            {label} {required && <span className="text-red-500">*</span>}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
            <Calendar size={14} />
            Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Not started'}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
            status === 'complete' ? 'bg-emerald-600 text-white' : 
            'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
          }`}
          onClick={() => onUpdate('complete')}
        >Complete</button>
        <button
          className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
            status === 'in_progress' ? 'bg-blue-600 text-white' : 
            'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
          }`}
          onClick={() => onUpdate('in_progress')}
        >In Progress</button>
        {showViewDocuments ? (
          <button
            className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-semibold transition-colors hover:bg-cyan-700"
            onClick={() => setShowDocs(v => !v)}
          >{showDocs ? 'Hide Documents' : 'View Documents'}</button>
        ) : (
          <button
            className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
              status === 'rejected' ? 'bg-red-600 text-white' : 
              'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
            }`}
            onClick={() => onUpdate('rejected')}
          >Reject</button>
        )}
      </div>
      
      {showViewDocuments && showDocs && (
        <div className="w-full mt-6 bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl shadow-inner">
          <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="text-blue-600 dark:text-cyan-300" size={20} />
            Uploaded Documents
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REQUIRED_TYPES.map(type => {
              const docs = attachments.filter(a => a.type === type);
              return (
                <div key={type} className="p-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{docs.length} file(s)</span>
                  </div>
                  {docs.length > 0 ? (
                    <div className="space-y-2">
                      {docs.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="text-sm text-gray-600 dark:text-gray-300">File {index + 1}</span>
                          <button
                            className="text-cyan-600 hover:text-cyan-700 text-sm font-semibold flex items-center gap-1 transition-colors"
                            onClick={() => handleViewFile(doc)}
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-red-500 text-sm font-semibold">Not Uploaded</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default RegProgress;