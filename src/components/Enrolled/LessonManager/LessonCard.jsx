import React from 'react';
import { Edit, Trash2, Clock, FileText, Video, CheckCircle, XCircle } from 'lucide-react';

const LessonCard = ({ lesson, isSelected, onSelect, onEdit, onDelete }) => {
  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect(lesson)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">{lesson.title}</h3>
            {lesson.is_published ? (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                <CheckCircle size={12} className="mr-1" />
                Published
              </span>
            ) : (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                <XCircle size={12} className="mr-1" />
                Draft
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-2">{lesson.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Clock size={14} className="mr-1" />
              {lesson.duration_minutes} min
            </span>
            <span className="flex items-center">
              <FileText size={14} className="mr-1" />
              Order: {lesson.order_index}
            </span>
            {lesson.video_url && (
              <span className="flex items-center">
                <Video size={14} className="mr-1" />
                Has Video
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(lesson);
            }}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(lesson.id);
            }}
            className="p-2 text-red-600 hover:bg-red-100 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonCard; 