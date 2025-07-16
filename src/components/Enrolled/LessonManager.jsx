import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import CourseSelector from './LessonManager/CourseSelector';
import TabNavigation from './LessonManager/TabNavigation';
import LessonsTab from './LessonManager/LessonsTab';
import MaterialsTab from './LessonManager/MaterialsTab';
import LessonForm from './LessonManager/LessonForm';
import MaterialForm from './LessonManager/MaterialForm';

const LessonManager = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lessons');

  // Form states
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    content: '',
    video_url: '',
    duration_minutes: 60,
    order_index: 0,
    is_published: false
  });

  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: '',
    file_url: '',
    file_type: '',
    is_required: true
  });

  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editingMaterial, setEditingMaterial] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons(selectedCourse.id);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedLesson) {
      fetchStudyMaterials(selectedLesson.id);
    }
  }, [selectedLesson]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCourses(data || []);
      if (data && data.length > 0) {
        setSelectedCourse(data[0]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (courseId) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');
      
      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const fetchStudyMaterials = async (lessonId) => {
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at');
      
      if (error) throw error;
      setStudyMaterials(data || []);
    } catch (error) {
      console.error('Error fetching study materials:', error);
    }
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      const lessonData = {
        ...lessonForm,
        course_id: selectedCourse.id,
        created_by: user.id
      };

      if (editingLesson) {
        const { error } = await supabase
          .from('lessons')
          .update(lessonData)
          .eq('id', editingLesson.id);
        
        if (error) throw error;
        setLessons(lessons.map(l => l.id === editingLesson.id ? { ...l, ...lessonData } : l));
      } else {
        const { data, error } = await supabase
          .from('lessons')
          .insert([lessonData])
          .select();
        
        if (error) throw error;
        setLessons([...lessons, data[0]]);
      }

      resetLessonForm();
    } catch (error) {
      console.error('Error saving lesson:', error);
    }
  };

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLesson) return;

    try {
      const materialData = {
        ...materialForm,
        lesson_id: selectedLesson.id,
        created_by: user.id
      };

      if (editingMaterial) {
        const { error } = await supabase
          .from('study_materials')
          .update(materialData)
          .eq('id', editingMaterial.id);
        
        if (error) throw error;
        setStudyMaterials(studyMaterials.map(m => m.id === editingMaterial.id ? { ...m, ...materialData } : m));
      } else {
        const { data, error } = await supabase
          .from('study_materials')
          .insert([materialData])
          .select();
        
        if (error) throw error;
        setStudyMaterials([...studyMaterials, data[0]]);
      }

      resetMaterialForm();
    } catch (error) {
      console.error('Error saving study material:', error);
    }
  };

  const deleteLesson = async (lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);
      
      if (error) throw error;
      setLessons(lessons.filter(l => l.id !== lessonId));
      if (selectedLesson?.id === lessonId) {
        setSelectedLesson(null);
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const deleteMaterial = async (materialId) => {
    if (!confirm('Are you sure you want to delete this study material?')) return;

    try {
      const { error } = await supabase
        .from('study_materials')
        .delete()
        .eq('id', materialId);
      
      if (error) throw error;
      setStudyMaterials(studyMaterials.filter(m => m.id !== materialId));
    } catch (error) {
      console.error('Error deleting study material:', error);
    }
  };

  const resetLessonForm = () => {
    setLessonForm({
      title: '',
      description: '',
      content: '',
      video_url: '',
      duration_minutes: 60,
      order_index: 0,
      is_published: false
    });
    setShowLessonForm(false);
    setEditingLesson(null);
  };

  const resetMaterialForm = () => {
    setMaterialForm({
      title: '',
      description: '',
      file_url: '',
      file_type: '',
      is_required: true
    });
    setShowMaterialForm(false);
    setEditingMaterial(null);
  };

  const editLesson = (lesson) => {
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      content: lesson.content || '',
      video_url: lesson.video_url || '',
      duration_minutes: lesson.duration_minutes,
      order_index: lesson.order_index,
      is_published: lesson.is_published
    });
    setEditingLesson(lesson);
    setShowLessonForm(true);
  };

  const editMaterial = (material) => {
    setMaterialForm({
      title: material.title,
      description: material.description || '',
      file_url: material.file_url || '',
      file_type: material.file_type || '',
      is_required: material.is_required
    });
    setEditingMaterial(material);
    setShowMaterialForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lesson Management</h1>
          <p className="text-gray-600">Create and manage lessons, study materials, and certificates</p>
        </div>

        {/* Course Selection */}
        <CourseSelector
          courses={courses}
          selectedCourse={selectedCourse}
          onCourseSelect={(course) => {
            setSelectedCourse(course);
            setSelectedLesson(null);
          }}
        />

        {selectedCourse && (
          <>
            {/* Tabs */}
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Tab Content */}
            {activeTab === 'lessons' && (
              <LessonsTab
                selectedCourse={selectedCourse}
                lessons={lessons}
                selectedLesson={selectedLesson}
                onLessonSelect={setSelectedLesson}
                onLessonEdit={editLesson}
                onLessonDelete={deleteLesson}
                onAddLesson={() => setShowLessonForm(true)}
              />
            )}

            {activeTab === 'materials' && (
              <MaterialsTab
                selectedCourse={selectedCourse}
                selectedLesson={selectedLesson}
                studyMaterials={studyMaterials}
                onMaterialEdit={editMaterial}
                onMaterialDelete={deleteMaterial}
                onAddMaterial={() => setShowMaterialForm(true)}
              />
            )}
          </>
        )}

        {/* Forms */}
        <LessonForm
          isOpen={showLessonForm}
          lesson={editingLesson}
          onSubmit={handleLessonSubmit}
          onCancel={resetLessonForm}
          formData={lessonForm}
          setFormData={setLessonForm}
        />

        <MaterialForm
          isOpen={showMaterialForm}
          material={editingMaterial}
          onSubmit={handleMaterialSubmit}
          onCancel={resetMaterialForm}
          formData={materialForm}
          setFormData={setMaterialForm}
        />
      </div>
    </div>
  );
};

export default LessonManager; 