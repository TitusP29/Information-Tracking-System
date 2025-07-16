import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import AttendanceHeader from './AttendanceHeader';
import AttendanceFilters from './AttendanceFilters';
import AttendanceStats from './AttendanceStats';
import AttendanceRate from './AttendanceRate';
import AttendanceTable from './AttendanceTable';
import ExportButton from './ExportButton';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

function StudentAttendanceRegister() {
  const auth = useAuth();
  const user = auth?.user;
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Log when component mounts
  useEffect(() => {
    console.log('[StudentAttendanceRegister] Component mounted');
  }, []);

  useEffect(() => {
    console.log('[StudentAttendanceRegister] useEffect triggered. user:', user);
    if (user && user.id) {
      fetchAttendanceData();
    }
  }, [user?.id]);

  const fetchAttendanceData = async () => {
    console.log('[StudentAttendanceRegister] fetchAttendanceData called. user:', user);
    if (!user) {
      setLoading(false);
      console.log('[StudentAttendanceRegister] No user found, setLoading(false)');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('[StudentAttendanceRegister] Fetching register for user.id:', user.id);

      // Get the student's national_id from the register table
      const { data: registerData, error: registerError } = await supabase
        .from('register')
        .select('national_id')
        .eq('user_id', user.id)
        .single();

      if (registerError) throw registerError;
      if (!registerData) throw new Error('Student registration not found');

      console.log('[StudentAttendanceRegister] Student national_id:', registerData.national_id);

      // Fetch attendance records for this student from timetables table
      const { data, error: attendanceError } = await supabase
        .from('timetables')
        .select('*')
        .eq('student_number', registerData.national_id)
        .order('created_at', { ascending: false });

      if (attendanceError) {
        console.error('[StudentAttendanceRegister] Error fetching timetables:', attendanceError);
        throw attendanceError;
      }

      console.log('[StudentAttendanceRegister] Fetched timetables data:', data);

      // Transform the data to match the expected format
      const transformedData = (data || []).map((record, index) => {
        // Use class_date if available, otherwise fall back to created_at
        let dateValue = record.class_date || record.created_at?.split('T')[0] || new Date().toISOString().split('T')[0];
        
        // Use class_name for course
        let courseValue = record.class_name || 'Unknown Course';
        
        // Use time field
        let timeValue = record.time || 'No time specified';
        
        // Use location field
        let venueValue = record.location || 'No venue specified';
        
        // Use instructor field
        let instructorValue = record.instructor || 'No instructor specified';

        return {
          id: record.id || index + 1,
          date: dateValue,
          class: courseValue,
          status: record.attendance_status || 'Present',
          attendanceType: record.attendance_type || 'Physical',
          time: timeValue,
          venue: venueValue,
          instructor: instructorValue
        };
      });

      console.log('[StudentAttendanceRegister] Transformed data:', transformedData);
      setAttendanceData(transformedData);
    } catch (err) {
      console.error('[StudentAttendanceRegister] Error fetching attendance data:', err);
      setError(err.message);
      setAttendanceData([]);
    } finally {
      setLoading(false);
      console.log('[StudentAttendanceRegister] Loading set to false. error:', error, 'attendanceData:', attendanceData);
    }
  };

  // Filter attendance based on selected class and month
  const filteredAttendance = attendanceData.filter(record => {
    const classMatch = selectedClass === 'All' || record.class === selectedClass;
    // Only filter by month if we have a valid date and month is selected
    const monthMatch = !selectedMonth || (record.date && record.date.startsWith(selectedMonth));
    return classMatch && monthMatch;
  });

  // Calculate attendance statistics
  const totalSessions = filteredAttendance.length;
  const presentCount = filteredAttendance.filter(r => r.status === 'Present').length;
  const absentCount = filteredAttendance.filter(r => r.status === 'Absent').length;
  const lateCount = filteredAttendance.filter(r => r.status === 'Late').length;
  const attendanceRate = totalSessions > 0 ? ((presentCount + lateCount) / totalSessions * 100).toFixed(1) : 0;

  // Get unique months for filter (only if we have valid dates)
  const months = [...new Set(attendanceData
    .filter(r => r.date && r.date.length >= 7)
    .map(r => r.date.substring(0, 7))
  )].sort().reverse();

  if (loading) {
    console.log('[StudentAttendanceRegister] Loading...');
    return <LoadingState />;
  }

  if (error) {
    console.log('[StudentAttendanceRegister] Error state:', error);
    return <ErrorState error={error} />;
  }

  console.log('[StudentAttendanceRegister] Render main UI. filteredAttendance:', filteredAttendance);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6 md:p-8 overflow-x-auto">
      <div className="max-w-6xl mx-auto">
        <AttendanceHeader onRefresh={fetchAttendanceData} />
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6 mb-6">
          <AttendanceFilters 
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            months={months}
          />
        </div>

        <AttendanceStats 
          totalSessions={totalSessions}
          presentCount={presentCount}
          absentCount={absentCount}
          lateCount={lateCount}
        />

        <AttendanceRate 
          attendanceRate={attendanceRate}
          presentCount={presentCount}
          totalSessions={totalSessions}
          months={months}
          attendanceData={attendanceData}
        />

        <AttendanceTable filteredAttendance={filteredAttendance} />

        <ExportButton 
          filteredAttendance={filteredAttendance}
          selectedClass={selectedClass}
          selectedMonth={selectedMonth}
        />
      </div>
    </div>
  );
}

export default StudentAttendanceRegister; 