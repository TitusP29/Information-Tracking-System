import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileCheck,
  FileX,
  CloudUpload,
  IdCard,
  CreditCard,
  Home,
  Award
} from 'lucide-react';

const REQUIRED_DOCUMENTS = [
  { 
    id: 'id', 
    label: 'ID Document',
    description: 'Upload your valid identification document',
    icon: IdCard,
    color: 'blue'
  },
  { 
    id: 'certificate', 
    label: 'Latest Certificate',
    description: 'Upload your most recent academic certificate',
    icon: Award,
    color: 'emerald'
  },
  { 
    id: 'residence', 
    label: 'Proof of Residence',
    description: 'Upload proof of your current residence',
    icon: Home,
    color: 'purple'
  },
  { 
    id: 'payment', 
    label: 'Proof of Payment',
    description: 'Upload proof of your course payment',
    icon: CreditCard,
    color: 'amber'
  }
];

function Documents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRefs = useRef({});

  useEffect(() => {
    fetchUserDocuments();
  }, [user]);

  const fetchUserDocuments = async () => {
    if (!user) return;
  

    const { data: docsData, error: docsError } = await supabase
      .from('documents')
      .select('*, attachments(*)')
      .eq('user_id', user.id);
    
    if (docsError) {
      console.error('Error fetching user documents:', docsError);
      setDocuments({});
      return;
    }
    
    if (docsData?.length) {
      const allAttachments = docsData.flatMap(doc => doc.attachments || []);
      const updatedAttachments = await Promise.all(
        allAttachments.map(async (attachment) => {
          const { data, error } = await supabase.storage
            .from('documents')
            .createSignedUrl(attachment.file_path, 3600); // 1 hour expiry
          
          if (error) {
            console.error('Signed URL error:', error);
            return { ...attachment, signedUrl: null };
          }
  
          return { ...attachment, signedUrl: data.signedUrl };
        })
      );
  
      docsData.attachments = updatedAttachments;
    }
  
    setDocuments(docsData || {});
  };
  

  

  const handleFileChange = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Only allow PDF files
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed. Please upload a PDF document.');
      e.target.value = ''; // Clear the file input
      return;
    }

    // Size validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size: 5MB');
      e.target.value = ''; // Clear the file input
      return;
    }

    setSelectedDocType(docType);
    await uploadDocument(file, docType);
  };

  const uploadDocument = async (file, docType) => {
    if (!user) return;
  
    setUploading(true);
    setMessage('Uploading...');
  
    try {
      const fileName = `${user.id}/${docType}_${Date.now()}_${file.name}`;
      
      // Ensure proper content type for PDFs
      const contentType = file.type === 'application/pdf' ? 'application/pdf' : file.type;
      
      console.log('Uploading file:', {
        name: file.name,
        type: contentType,
        size: file.size
      });

      const { data: fileData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });
  
      if (uploadError) throw uploadError;
  
      // Get or create document record
      let docData;
      const { data: existingDoc, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw fetchError;
      }

      if (existingDoc) {
        docData = existingDoc;
      } else {
        const { data: newDoc, error: createError } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            status: 'UPLOADED'
          })
          .select()
          .single();

        if (createError) throw createError;
        docData = newDoc;
      }
  
      const { error: attachError } = await supabase
        .from('attachments')
        .insert({
          document_id: docData.id,
          file_path: fileName,
          file_type: contentType,
          type: docType,
          uploaded_at: new Date().toISOString()
        });
  
      if (attachError) throw attachError;
  
      const booleanField = {
        id: 'id_uploaded',
        certificate: 'certificate_uploaded',
        residence: 'residence_uploaded',
        payment: 'payment_uploaded'
      }[docType];
  
      if (booleanField) {
        await supabase
          .from('documents')
          .update({ [booleanField]: true })
          .eq('id', docData.id);

        const { data: docStatus } = await supabase
          .from('documents')
          .select('id_uploaded,certificate_uploaded,residence_uploaded,payment_uploaded')
          .eq('id', docData.id)
          .single();

        if (
          docStatus?.id_uploaded &&
          docStatus?.certificate_uploaded &&
          docStatus?.residence_uploaded &&
          docStatus?.payment_uploaded
        ) {
          await supabase
            .from('documents')
            .update({ status: 'approved' })
            .eq('id', docData.id);

          // Create a notification for the student
          await supabase
            .from('notifications')
            .insert({
              type: 'success',
              title: 'Documents Complete',
              message: 'All required documents have been uploaded successfully.',
              recipient_id: user.id,
              read: false
            });
        } else {
          // Create a notification for the specific document upload
          await supabase
            .from('notifications')
            .insert({
              type: 'info',
              title: 'Document Uploaded',
              message: `${getDocumentLabel(docType)} has been uploaded successfully.`,
              recipient_id: user.id,
              read: false
            });
        }
      }
  
      setMessage('Document uploaded successfully');
      fetchUserDocuments();
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      setMessage('Failed to upload document');
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
      setSelectedDocType('');
    }
  };

  const getDocumentLabel = (docType) => {
    const labels = {
      id: 'ID Document',
      certificate: 'Latest Certificate',
      residence: 'Proof of Residence',
      payment: 'Proof of Payment'
    };
    return labels[docType] || docType;
  };

  const removeDocument = async (docId) => {
    if (!user) return;

    setUploading(true);
    setMessage('Removing...');

    try {
      const doc = documents.find(d => d.id === docId);
      if (!doc?.attachments?.[0]) throw new Error('Document not found');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.attachments[0].file_url]);

      if (storageError) throw storageError;

      // Delete from attachments table
      const { error: attachError } = await supabase
        .from('attachments')
        .delete()
        .eq('document_id', doc.id);

      if (attachError) throw attachError;

      // Delete from documents table
      const { error: docError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (docError) throw docError;

      setMessage('Document removed successfully');
      fetchUserDocuments();
    } catch (error) {
      console.error('Error removing document:', error);
      setMessage('Failed to remove document');
    } finally {
      setUploading(false);
    }
  };

  const getDocumentStatus = (docType) => {
    return documents && documents[`${docType}_uploaded`];
  };

  const handleUploadClick = (docId) => {
    fileInputRefs.current[docId]?.click();
  };

  const getUploadedCount = () => {
    return REQUIRED_DOCUMENTS.filter(doc => getDocumentStatus(doc.id)).length;
  };

  const getStatusBadge = (isUploaded) => {
    if (isUploaded) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl font-semibold text-sm shadow-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <CheckCircle size={14} />
          Uploaded
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl font-semibold text-sm shadow-lg bg-gradient-to-r from-slate-400 to-slate-500 text-white">
        <Clock size={14} />
        Pending
      </div>
    );
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 min-h-screen">
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
      
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-lg">
            <FileText className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-amber-800 dark:from-slate-100 dark:to-amber-100">
              Upload Application Documents
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
              Complete your application by uploading all required documents
            </p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <FileCheck className="text-emerald-600 dark:text-emerald-400" size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Documents Uploaded</p>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-xl">
                    {getUploadedCount()} of {REQUIRED_DOCUMENTS.length}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <FileText className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Progress</p>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-xl">
                    {Math.round((getUploadedCount() / REQUIRED_DOCUMENTS.length) * 100)}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="w-32 h-32 relative">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeDasharray={`${(getUploadedCount() / REQUIRED_DOCUMENTS.length) * 339.292} 339.292`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {Math.round((getUploadedCount() / REQUIRED_DOCUMENTS.length) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="mb-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-blue-600 dark:text-blue-400" size={20} />
            <span className="text-blue-700 dark:text-blue-300 font-medium">{message}</span>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {REQUIRED_DOCUMENTS.map((doc) => {
          const existingDoc = documents && documents[doc.id];
          const attachment = existingDoc?.attachments?.[0];
          const isUploaded = getDocumentStatus(doc.id);
          const IconComponent = doc.icon;

          return (
            <div key={doc.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-200">
              {/* Document Header */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 p-6 border-b border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 bg-gradient-to-r from-${doc.color}-500 to-${doc.color}-600 rounded-2xl shadow-lg`}>
                      <IconComponent className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{doc.label}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{doc.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(isUploaded)}
                </div>
                
                {attachment && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <FileText size={16} />
                    <span className="truncate">{attachment.file_url}</span>
                  </div>
                )}
              </div>

              {/* Document Content */}
              <div className="p-6">
                {isUploaded ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-700">
                      <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle size={20} />
                        <span className="font-semibold">Document uploaded successfully</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <a
                        href={attachment?.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <Download size={18} />
                        Download
                      </a>

                      <button
                        onClick={() => removeDocument(existingDoc.id)}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        disabled={uploading}
                      >
                        <Trash2 size={18} />
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-700">
                      <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                        <Clock size={20} />
                        <span className="font-semibold">Document required for application</span>
                      </div>
                    </div>
                    
                    <div className="w-full">
                      <input
                        type="file"
                        ref={el => fileInputRefs.current[doc.id] = el}
                        className="hidden"
                        onChange={(e) => handleFileChange(e, doc.id)}
                        accept=".pdf"
                        disabled={uploading}
                      />
                      <button
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        disabled={uploading}
                        onClick={() => handleUploadClick(doc.id)}
                      >
                        {uploading && selectedDocType === doc.id ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <CloudUpload size={18} />
                            Upload Document
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Documents;
