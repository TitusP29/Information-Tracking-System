import React, { useState, useEffect } from "react";
import { supabase } from '../../../supabaseClient';
import useApprovedStudents from '../../hooks/useApprovedStudents';
import {
  Users,
  CalendarDays,
  Filter,
  CheckCircle,
  X,
  Clock,
  User,
  BookOpen,
  Monitor,
  DoorOpen,
  Laptop2,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Attendance = () => {
  const [timetableData, setTimetableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    student_number: '',
    class_name: '',
    day: '',
    time: '',
    location: '',
    type: 'Physical',
    instructor: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch approved students for the dropdown
  const { students: approvedStudents, loading: studentsLoading } = useApprovedStudents();

  useEffect(() => {
    fetchTimetableData();
  }, []);

  const fetchTimetableData = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('timetables')
      .select('*')
      .order('day', { ascending: true })
      .order('time', { ascending: true });
    if (error) setError(error.message);
    setTimetableData(data || []);
    setLoading(false);
  };

  const handleAddTimetable = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('timetables').insert([form]);
    setSaving(false);
    if (error) {
      setError(error.message);
    } else {
      setShowAddModal(false);
      setForm({
        student_number: '',
        class_name: '',
        day: '',
        time: '',
        location: '',
        type: 'Physical',
        instructor: ''
      });
      fetchTimetableData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8">
          <h1 className="text-3xl font-bold text-blue-700 dark:text-cyan-400 flex items-center gap-3">
            <CalendarDays className="text-blue-600 dark:text-cyan-300" size={32} />
            Timetable Management
          </h1>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <button
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={18} />
              Add Timetable Entry
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading timetable...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <Users className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
                Error loading timetable
              </h3>
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-left">
                <tr>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Student</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Class</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Day</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Time</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Location</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Instructor</th>
                </tr>
              </thead>
              <tbody>
                {timetableData.map((entry, idx) => (
                  <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                      {approvedStudents.find(s => s.id === entry.student_number)?.name || entry.student_number}
                    </td>
                    <td className="p-4 text-gray-900 dark:text-white">{entry.class_name}</td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">{entry.day}</td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">{entry.time}</td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">{entry.location}</td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">{entry.type}</td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">{entry.instructor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Timetable Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl bg-gray-100 dark:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center"
              onClick={() => setShowAddModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Add Timetable Entry</h2>
            <form onSubmit={handleAddTimetable} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Student</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={form.student_number}
                  onChange={e => setForm({ ...form, student_number: e.target.value })}
                  required
                  disabled={studentsLoading}
                >
                  <option value="">Select Student</option>
                  {approvedStudents.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Class Name</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={form.class_name}
                  onChange={e => setForm({ ...form, class_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Day</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={form.day}
                  onChange={e => setForm({ ...form, day: e.target.value })}
                  required
                >
                  <option value="">Select Day</option>
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Time</label>
                <input
                  type="time"
                  className="w-full border rounded px-3 py-2"
                  value={form.time}
                  onChange={e => setForm({ ...form, time: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Location</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Type</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  required
                >
                  <option value="Physical">Physical</option>
                  <option value="Virtual">Virtual</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Instructor</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={form.instructor}
                  onChange={e => setForm({ ...form, instructor: e.target.value })}
                  required
                />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold w-full"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Add Entry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
