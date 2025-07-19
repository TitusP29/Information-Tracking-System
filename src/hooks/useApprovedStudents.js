import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function useApprovedStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApprovedStudents();
    // eslint-disable-next-line
  }, []);

  const fetchApprovedStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch students who have been approved (application_review = 'approved')
      const { data: approvedStudents, error } = await supabase
        .from('register')
        .select(`*, progress_management!inner(application_review)`)
        .eq('progress_management.application_review', 'approved')
        .order('reg_date', { ascending: false });
      if (error) throw error;
      // Transform the data to match the expected format
      const transformedStudents = (approvedStudents || []).map(student => ({
        id: student.national_id,
        name: `${student.first_name} ${student.surname}`,
        dob: student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A',
        course: student.course,
        status: 'Active',
        email: student.email,
        phone: student.phone,
        reg_date: student.reg_date
      }));
      setStudents(transformedStudents);
    } catch (err) {
      setError(err.message || 'Failed to fetch approved students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  return { students, loading, error, refresh: fetchApprovedStudents };
} 