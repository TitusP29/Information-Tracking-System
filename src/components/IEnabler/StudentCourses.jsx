import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import {
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Download,
  Play,
  Video,
  Award,
  Eye,
  File,
  Music,
  Image
} from 'lucide-react';

export default function StudentCourses() {
  const [activeTab, setActiveTab] = useState('my-courses');
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchStudentCourses();
    }
  }, [user]);

  const fetchStudentCourses = async () => {
    setLoading(true);
    try {
      // Get student's national_id from register
      const { data: regData, error: regError } = await supabase
        .from('register')
        .select('course, national_id')
        .eq('user_id', user.id);
      
      if (regError) throw regError;
      
      if (!regData || regData.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }

      // Get all courses student is enrolled in
      const enrolledCourseNames = regData.map(r => r.course);
      
      // Fetch course details from courses table
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .in('name', enrolledCourseNames);
      
      if (courseError) throw courseError;

      // Fetch lessons for each course
      const coursesWithLessons = await Promise.all(
        (courseData || []).map(async (course) => {
          const { data: lessonData, error: lessonError } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', course.id)
            .eq('is_published', true)
            .order('order_index');

          if (lessonError) throw lessonError;

          return {
            ...course,
            lessons: lessonData || [],
            progress: 0 // TODO: Calculate real progress
          };
        })
      );

      setCourses(coursesWithLessons);
      
      if (coursesWithLessons.length > 0) {
        setSelectedCourse(coursesWithLessons[0]);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setCourses([]);
    } finally {
      setLoading(false);
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
    } catch (err) {
      console.error('Error fetching study materials:', err);
      setStudyMaterials([]);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedLesson(null);
    setStudyMaterials([]);
  };

  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
    fetchStudyMaterials(lesson.id);
  };

  const getCourseProgress = (course) => {
    if (!course.lessons || course.lessons.length === 0) return 0;
    
    // TODO: Calculate based on actual lesson progress
    const completedLessons = course.lessons.filter(lesson => 
      lesson.status === 'completed'
    ).length;
    
    return Math.round((completedLessons / course.lessons.length) * 100);
  };

  const getTotalProgress = () => {
    if (courses.length === 0) return 0;
    
    const totalProgress = courses.reduce((sum, course) => {
      return sum + getCourseProgress(course);
    }, 0);
    
    return Math.round(totalProgress / courses.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 inline-block mb-4"></span>
          <p className="text-slate-600 dark:text-slate-400">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'my-courses' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500'
          }`}
          onClick={() => setActiveTab('my-courses')}
        >
          My Courses
        </button>
        <button
          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'library' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500'
          }`}
          onClick={() => setActiveTab('library')}
        >
          Course Library
        </button>
      </div>

      {/* Progress Summary */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="font-bold text-lg mb-2 md:mb-0">My Progress</div>
        <div className="flex gap-8">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-blue-700">{getTotalProgress()}%</span>
            <span className="text-xs text-gray-500">Overall Progress</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-blue-700">{courses.length}</span>
            <span className="text-xs text-gray-500">Courses enrolled</span>
          </div>
        </div>
      </div>

      {/* Course Selection */}
      {courses.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">Select Course</h3>
          <div className="flex flex-wrap gap-3">
            {courses.map(course => (
              <button
                key={course.id}
                onClick={() => handleCourseSelect(course)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedCourse?.id === course.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {course.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Course Content */}
      {selectedCourse && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Lessons for {selectedCourse.name}</h3>
          <div className="flex flex-wrap gap-3 mb-4">
            {selectedCourse.lessons.map(lesson => (
              <button
                key={lesson.id}
                onClick={() => handleLessonSelect(lesson)}
                className={`px-3 py-2 rounded-lg border transition-colors ${
                  selectedLesson?.id === lesson.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {lesson.title}
              </button>
            ))}
          </div>

          {/* Study Materials */}
          {selectedLesson && (
            <div className="mt-4">
              <h4 className="font-semibold text-md mb-2">Study Materials for {selectedLesson.title}</h4>
              {studyMaterials.length === 0 ? (
                <p className="text-gray-500">No study materials available.</p>
              ) : (
                <ul className="list-disc pl-6">
                  {studyMaterials.map(material => (
                    <li key={material.id} className="mb-2">
                      <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {material.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 