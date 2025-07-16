import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Plus,
  BookOpen,
  Clock,
  Users,
  Target,
  FileText,
  Calendar,
  CheckCircle,
  X,
  AlertCircle,
  History,
  Edit
} from 'lucide-react';

const initialForm = {
  name: '',
  duration: '',
  mode: 'Full-time',
  level: 'Beginner',
  description: '',
  status: 'Open',
  opening_date: '',
  closing_date: '',
};

const ManageCourse = () => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [editCourseId, setEditCourseId] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase.from('courses').select('*').order('id', { ascending: false });
    if (!error) setCourses(data || []);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.from('courses').insert([form]).select();
    setLoading(false);
    if (error) {
      toast.error('Failed to create course: ' + error.message);
    } else {
      toast.success('Course created successfully!');
      setCourses([data[0], ...courses]);
      setShowModal(false);
      setForm(initialForm);
    }
  };

  // Edit course handler
  const handleEditCourse = (course) => {
    setEditCourseId(course.id);
    setForm({
      name: course.name,
      duration: course.duration,
      mode: course.mode,
      level: course.level,
      description: course.description,
      status: course.status,
      opening_date: course.opening_date,
      closing_date: course.closing_date,
    });
    setShowModal(true);
  };
  // Edit selected course from header
  const handleEditSelectedCourse = () => {
    const course = courses.find(c => c.id === selectedCourseId);
    if (course) handleEditCourse(course);
  };
  // Delete selected course from header
  const handleDeleteSelectedCourse = async () => {
    if (!selectedCourseId) return;
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    setLoading(true);
    const { error } = await supabase.from('courses').delete().eq('id', selectedCourseId);
    setLoading(false);
    if (error) {
      toast.error('Failed to delete course: ' + error.message);
    } else {
      toast.success('Course deleted successfully!');
      setCourses(courses.filter(c => c.id !== selectedCourseId));
      setSelectedCourseId(null);
    }
  };

  // Update course handler
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.from('courses').update(form).eq('id', editCourseId).select();
    setLoading(false);
    if (error) {
      toast.error('Failed to update course: ' + error.message);
    } else {
      toast.success('Course updated successfully!');
      setCourses(courses.map(c => c.id === editCourseId ? data[0] : c));
      setShowModal(false);
      setForm(initialForm);
      setEditCourseId(null);
    }
  };

  // Delete course handler
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    setLoading(true);
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    setLoading(false);
    if (error) {
      toast.error('Failed to delete course: ' + error.message);
    } else {
      toast.success('Course deleted successfully!');
      setCourses(courses.filter(c => c.id !== courseId));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-700 dark:text-cyan-400 flex items-center gap-3">
          <BookOpen className="text-blue-600 dark:text-cyan-300" size={32} />
          Manage Course Applications
          {selectedCourseId && (
            <span className="ml-4 text-lg font-semibold text-blue-900 dark:text-cyan-200">Selected: {courses.find(c => c.id === selectedCourseId)?.name}</span>
          )}
        </h1>
        <div className="flex items-center gap-2">
          <button
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg"
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} />
            Create Course
          </button>
          <button
            className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-xl px-3 py-2 font-semibold flex items-center gap-1 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"
            onClick={handleEditSelectedCourse}
            disabled={!selectedCourseId}
            title="Edit Selected Course"
          >
            <Edit size={16} /> Edit
          </button>
          <button
            className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border border-red-200 dark:border-red-700 rounded-xl px-3 py-2 font-semibold flex items-center gap-1 hover:bg-red-200 dark:hover:bg-red-800 transition-colors disabled:opacity-50"
            onClick={handleDeleteSelectedCourse}
            disabled={!selectedCourseId}
            title="Delete Selected Course"
          >
            <X size={16} /> Delete
          </button>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            onStatusChange={async (newStatus) => {
              // Update course status
              const { error } = await supabase.from('courses').update({ status: newStatus }).eq('id', course.id);
              if (error) {
                toast.error('Failed to update status: ' + error.message);
                return;
              }
              // Insert status history
              const admin = 'Admin'; // Replace with real admin if available
              const action = newStatus === 'Open' ? 'Reopened' : 'Closed';
              const note = `The application has been ${action.toLowerCase()}`;
              const date = new Date().toISOString().split('T')[0];
              await supabase.from('status_history').insert([
                {
                  course_id: course.id,
                  date,
                  action: action,
                  admin,
                  note
                }
              ]);
              toast.success(`Course ${action.toLowerCase()} successfully!`);
              fetchCourses();
            }}
            onEdit={() => handleEditCourse(course)}
            onDelete={() => handleDeleteCourse(course.id)}
            selected={selectedCourseId === course.id}
            onSelect={() => setSelectedCourseId(course.id)}
          />
        ))}
      </div>

      {/* Create/Edit Course Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl bg-gray-100 dark:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center"
              onClick={() => { setShowModal(false); setEditCourseId(null); setForm(initialForm); }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-blue-700 dark:text-cyan-400 mb-6 flex items-center gap-3">
              <Plus className="text-blue-600 dark:text-cyan-300" size={24} />
              {editCourseId ? 'Edit Course' : 'Create New Course'}
            </h2>
            <form onSubmit={editCourseId ? handleUpdateCourse : handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <BookOpen size={16} className="text-blue-600 dark:text-cyan-300" />
                  Course Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="border border-gray-300 dark:border-gray-600 rounded-xl w-full p-4 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Clock size={16} className="text-amber-600 dark:text-amber-400" />
                  Duration
                </label>
                <input
                  id="duration"
                  type="text"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="e.g. 3 months"
                  className="border border-gray-300 dark:border-gray-600 rounded-xl w-full p-4 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="mode" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
                    Mode
                  </label>
                  <select
                    id="mode"
                    name="mode"
                    value={form.mode}
                    onChange={handleChange}
                    className="border border-gray-300 dark:border-gray-600 rounded-xl w-full p-4 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="level" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Target size={16} className="text-purple-600 dark:text-purple-400" />
                    Level
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={form.level}
                    onChange={handleChange}
                    className="border border-gray-300 dark:border-gray-600 rounded-xl w-full p-4 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-gray-600 dark:text-gray-400" />
                  Course Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  className="border border-gray-300 dark:border-gray-600 rounded-xl w-full p-4 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="border border-gray-300 dark:border-gray-600 rounded-xl w-full p-4 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
                  Course Dates
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="opening_date" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Opening Date</label>
                    <input
                      id="opening_date"
                      type="date"
                      name="opening_date"
                      value={form.opening_date}
                      onChange={handleChange}
                      className="border border-gray-300 dark:border-gray-600 rounded-xl w-full p-4 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="closing_date" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Closing Date</label>
                    <input
                      id="closing_date"
                      type="date"
                      name="closing_date"
                      value={form.closing_date}
                      onChange={handleChange}
                      className="border border-gray-300 dark:border-gray-600 rounded-xl w-full p-4 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl w-full font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {editCourseId ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    {editCourseId ? 'Update Course' : 'Create Course'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

// --- CourseCard Component ---

function formatDate(dateStr) {
  if (!dateStr) return 'Invalid Date';
  const d = new Date(dateStr);
  if (isNaN(d)) return 'Invalid Date';
  return d.toLocaleDateString();
}

const CourseCard = ({ course, onStatusChange, onEdit, onDelete, selected, onSelect }) => {
  const [history, setHistory] = useState([]);
  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, [course.id, course.status]);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('status_history')
      .select('*')
      .eq('course_id', course.id)
      .order('timestamp', { ascending: false });
    setHistory(data || []);
  };

  const isClosed = course.status === 'Closed';
  const badgeClass = isClosed
    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border border-red-200 dark:border-red-700'
    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700';
  const badgeText = isClosed ? 'Closed' : 'Open';
  const badgeDate = isClosed ? course.closing_date : course.opening_date;

  return (
    <div
      className={`bg-white dark:bg-gray-800 border rounded-2xl shadow-lg p-6 transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer ${selected ? 'border-blue-500 dark:border-cyan-400 ring-2 ring-blue-300 dark:ring-cyan-300' : 'border-gray-200 dark:border-gray-700'}`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="text-blue-600 dark:text-cyan-300" size={20} />
          <span className="text-xl font-bold text-gray-900 dark:text-white">{course.name}</span>
        </div>
        <div className={`rounded-xl px-4 py-2 text-center text-sm font-semibold ${badgeClass}`} style={{minWidth:100}}>
          {badgeText}<br/>
          <span className="font-normal italic text-xs">Since<br/>{formatDate(badgeDate)}</span>
        </div>
      </div>
      
      <div className="space-y-3 text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-amber-600 dark:text-amber-400" />
          <span className="font-semibold">Duration:</span> {course.duration}
        </div>
        <div className="flex items-center gap-2">
          <Target size={16} className="text-purple-600 dark:text-purple-400" />
          <span className="font-semibold">Level:</span> {course.level}
        </div>
        <div className="flex items-center gap-2">
          <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold">Mode:</span> {course.mode}
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
          <span className="font-semibold">Last Opened:</span> {formatDate(course.opening_date)}
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-red-600 dark:text-red-400" />
          <span className="font-semibold">Closed Since:</span> {formatDate(course.closing_date)}
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <History size={16} className="text-gray-600 dark:text-gray-400" />
          <span className="font-semibold text-gray-900 dark:text-white">Status History:</span>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-xs">
          {history.length === 0 && <div className="text-gray-500 dark:text-gray-400">No history available.</div>}
          {history.map((h, idx) => (
            <div key={h.id || idx} className="mb-2 last:mb-0 text-gray-600 dark:text-gray-300">
              {formatDate(h.date)} - {h.action} by {h.admin}: <i>{h.note}</i>
            </div>
          ))}
        </div>
      </div>
      
      <button
        className={`mt-4 px-4 py-3 rounded-xl w-full font-semibold transition-colors flex items-center justify-center gap-2 ${
          isClosed 
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-800' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-800'
        }`}
        onClick={() => onStatusChange(isClosed ? 'Open' : 'Closed')}
      >
        {isClosed ? (
          <>
            <CheckCircle size={16} />
            Reopen Applications
          </>
        ) : (
          <>
            <X size={16} />
            Close Applications
          </>
        )}
      </button>
    </div>
  );
};

export default ManageCourse;