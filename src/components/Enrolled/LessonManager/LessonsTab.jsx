import React from 'react';
import { Plus, BookOpen } from 'lucide-react';
import LessonCard from './LessonCard';

const LessonsTab = ({
  selectedCourse,
  lessons,
  selectedLesson,
  onLessonSelect,
  onLessonEdit,
  onLessonDelete,
  onAddLesson
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Lessons for {selectedCourse.name}</h2>
          <button
            onClick={onAddLesson}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Add Lesson
          </button>
        </div>
      </div>

      <div className="p-6">
        {lessons.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No lessons created yet.</p>
            <button
              onClick={onAddLesson}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create First Lesson
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isSelected={selectedLesson?.id === lesson.id}
                onSelect={onLessonSelect}
                onEdit={onLessonEdit}
                onDelete={onLessonDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonsTab; 