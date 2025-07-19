import React from 'react';
import { Plus, FileText } from 'lucide-react';
import MaterialCard from './MaterialCard';

const MaterialsTab = ({
  selectedCourse,
  selectedLesson,
  studyMaterials,
  onMaterialEdit,
  onMaterialDelete,
  onAddMaterial
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Study Materials</h2>
          {selectedLesson && (
            <button
              onClick={onAddMaterial}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Add Material
            </button>
          )}
        </div>
        {selectedLesson && (
          <p className="text-gray-600 mt-2">For lesson: {selectedLesson.title}</p>
        )}
      </div>

      <div className="p-6">
        {!selectedLesson ? (
          <div className="text-center py-8 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Select a lesson to manage its study materials.</p>
          </div>
        ) : studyMaterials.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No study materials for this lesson.</p>
            <button
              onClick={onAddMaterial}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add First Material
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {studyMaterials.map(material => (
              <MaterialCard
                key={material.id}
                material={material}
                onEdit={onMaterialEdit}
                onDelete={onMaterialDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialsTab; 