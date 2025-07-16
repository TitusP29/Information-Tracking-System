import React, { useState } from 'react';
import { Edit, Trash2, File, Download, Video, Music, FileText, Image, Play, Pause, Volume2 } from 'lucide-react';

const MaterialCard = ({ material, onEdit, onDelete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
    if (!bytes) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    if (material.file_url) {
      const link = document.createElement('a');
      link.href = material.file_url;
      link.download = material.title || 'study-material';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderMediaPreview = () => {
    if (!material.file_url) return null;

    switch (material.file_type) {
      case 'video':
        return (
          <div className="mt-3">
            <video
              controls
              className="w-full rounded-lg"
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={material.file_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      
      case 'audio':
        return (
          <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <audio
              controls
              className="w-full"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={material.file_url} type="audio/mpeg" />
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      
      case 'image':
        return (
          <div className="mt-3">
            <img
              src={material.file_url}
              alt={material.title}
              className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setShowPreview(true)}
            />
          </div>
        );
      
      case 'pdf':
        return (
          <div className="mt-3">
            <iframe
              src={`${material.file_url}#toolbar=0`}
              className="w-full h-64 rounded-lg border border-slate-200 dark:border-slate-600"
              title={material.title}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {getFileIcon(material.file_type)}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">{material.title}</h3>
                {material.is_required && (
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs px-2 py-1 rounded-full font-medium">
                    Required
                  </span>
                )}
              </div>
            </div>
            
            {material.description && (
              <p className="text-slate-600 dark:text-slate-400 mb-4">{material.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
              <span className="flex items-center gap-1">
                <File size={14} />
                {material.file_type ? material.file_type.toUpperCase() : 'Document'}
              </span>
              {material.file_size && (
                <span>{formatFileSize(material.file_size)}</span>
              )}
              {material.file_url && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
                >
                  <Download size={14} />
                  Download
                </button>
              )}
            </div>

            {/* Media Preview */}
            {renderMediaPreview()}
          </div>
          
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => onEdit(material)}
              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title="Edit material"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(material.id)}
              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="Delete material"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showPreview && material.file_type === 'image' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              <Edit size={20} />
            </button>
            <img
              src={material.file_url}
              alt={material.title}
              className="max-w-full max-h-full rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MaterialCard; 