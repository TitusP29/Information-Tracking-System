import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  BookOpen,
  Monitor,
  DoorOpen,
  Laptop2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const StudentTimetable = () => {
  const [timetableData, setTimetableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = useAuth();
  const user = auth?.user;

  useEffect(() => {
    fetchTimetableData();
    // eslint-disable-next-line
  }, [user]);

  const fetchTimetableData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user) throw new Error('Not logged in');
      // Get the student's national_id from the register table
      const { data: registerData, error: registerError } = await supabase
        .from('register')
        .select('national_id')
        .eq('user_id', user.id)
        .single();
      if (registerError) throw registerError;
      if (!registerData) throw new Error('Student registration not found');
      // Fetch timetable data for this student
      const { data, error } = await supabase
        .from('timetables')
        .select('*')
        .eq('student_number', registerData.national_id)
        .order('day', { ascending: true })
        .order('time', { ascending: true });
      if (error) throw error;
      setTimetableData(data || []);
    } catch (err) {
      console.error('Error fetching timetable:', err);
      setError(err.message);
      setTimetableData([]);
    } finally {
      setLoading(false);
    }
  };

  const getTimetableForDay = (day) => {
    return timetableData.filter(item => item.day === day);
  };

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getAttendanceTypeIcon = (type) => {
    return type === 'Virtual' ? <Laptop2 size={16} /> : <DoorOpen size={16} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading timetable...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">Error loading timetable: {error}</p>
        </div>
      </div>
    );
  }

  if (timetableData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <CalendarDays className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            No Classes Scheduled
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Your timetable will appear here once classes are scheduled by your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <CalendarDays className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            My Class Timetable
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            View your daily and weekly class schedule
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span className="font-medium">Total Classes:</span>
          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-bold">
            {timetableData.length}
          </span>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="grid gap-6">
        {daysOfWeek.map((day) => {
          const dayClasses = getTimetableForDay(day);
          
          if (dayClasses.length === 0) return null;

          return (
            <div key={day} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-4">
                <h3 className="text-lg font-semibold">{day}</h3>
                <p className="text-blue-100 text-sm">
                  {dayClasses.length} class{dayClasses.length !== 1 ? 'es' : ''} scheduled
                </p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {dayClasses.map((classItem, index) => (
                    <div
                      key={index}
                      className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <BookOpen className="text-blue-600 dark:text-blue-400" size={18} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                                {classItem.class_name}
                              </h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {classItem.instructor}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="text-slate-500 dark:text-slate-400" size={16} />
                              <span className="text-slate-700 dark:text-slate-300">
                                {formatTime(classItem.time)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="text-slate-500 dark:text-slate-400" size={16} />
                              <span className="text-slate-700 dark:text-slate-300">
                                {classItem.location || 'TBD'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              {getAttendanceTypeIcon(classItem.type)}
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                classItem.type === 'Virtual'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                              }`}>
                                {classItem.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-slate-200 dark:border-slate-600">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Monitor className="text-blue-600 dark:text-blue-400" size={20} />
          Timetable Summary
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {timetableData.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Classes</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {timetableData.filter(item => item.type === 'Virtual').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Virtual Classes</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {timetableData.filter(item => item.type === 'Physical').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Physical Classes</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {new Set(timetableData.map(item => item.instructor)).size}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Instructors</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable; 