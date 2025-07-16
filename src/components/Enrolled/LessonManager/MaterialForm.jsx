import React, { useState } from 'react';
import { Save, X, Upload, File, Video, Music, FileText, Image, Loader2 } from 'lucide-react';
import { supabase } from '../../../../supabaseClient';

const MaterialForm = ({ 
  isOpen, 
  material, 
  onSubmit, 
  onCancel, 
  formData, 
  setFormData 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Auto-detect file type based on extension
      const extension = file.name.split('.').pop().toLowerCase();
      let fileType = 'other';
      
      if (['pdf'].includes(extension)) fileType = 'pdf';
      else if (['doc', 'docx'].includes(extension)) fileType = 'doc';
      else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) fileType = 'video';
      else if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(extension)) fileType = 'audio';
      else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) fileType = 'image';
      
      setFormData({ ...formData, file_type: fileType });
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      // Create a unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `study-materials/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('study-materials')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(percent);
          }
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('study-materials')
        .getPublicUrl(filePath);

      // Update form data with the uploaded file URL
      setFormData({
        ...formData,
        file_url: publicUrl,
        file_size: selectedFile.size
      });

      setSelectedFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'video': return <Video size={20} className="text-red-500" />;
      case 'audio': return <Music size={20} className="text-purple-500" />;
      case 'pdf': return <FileText size={20} className="text-red-500" />;
      case 'image': return <Image size={20} className="text-green-500" />;
      case 'doc': return <FileText size={20} className="text-blue-500" />;
      default: return <File size={20} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            {material ? 'Edit Study Material' : 'Add Study Material'}
          </h3>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              required
              placeholder="Enter material title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              rows={3}
              placeholder="Enter material description"
            />
          </div>

          {/* File Upload Section */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Upload File</label>
            
            {/* File Input */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.mp4,.avi,.mov,.wmv,.flv,.webm,.mp3,.wav,.ogg,.aac,.flac,.jpg,.jpeg,.png,.gif,.bmp,.webp"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <div className="text-slate-600 dark:text-slate-400">
                  <span className="font-medium">Click to upload</span> or drag and drop
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                  PDF, Documents, Videos, Audio, Images (Max 100MB)
                </div>
              </label>
            </div>

            {/* Selected File Display */}
            {selectedFile && (
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  {getFileIcon(formData.file_type)}
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{selectedFile.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {formatFileSize(selectedFile.size)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleFileUpload}
                    disabled={uploading}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Upload
                      </>
                    )}
                  </button>
                </div>
                
                {/* Upload Progress */}
                {uploading && (
                  <div className="mt-3">
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {Math.round(uploadProgress)}% uploaded
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Current File URL (if editing) */}
            {formData.file_url && !selectedFile && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  {getFileIcon(formData.file_type)}
                  <div className="flex-1">
                    <div className="font-medium text-emerald-800 dark:text-emerald-200">File uploaded</div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400 truncate">
                      {formData.file_url}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">File Type</label>
            <select
              value={formData.file_type}
              onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
              className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="">Select file type</option>
              <option value="pdf">PDF Document</option>
              <option value="doc">Word Document</option>
              <option value="video">Video File</option>
              <option value="audio">Audio File</option>
              <option value="image">Image File</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_required"
              checked={formData.is_required}
              onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
              className="mr-3 w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
            />
            <label htmlFor="is_required" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Required material for students
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Save size={16} />
              {material ? 'Update Material' : 'Add Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialForm; 