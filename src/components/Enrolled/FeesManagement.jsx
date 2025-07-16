import React, { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import { supabase } from '../../../supabaseClient';
import FeesHeader from './FeesManagement/FeesHeader';
import SearchBar from './FeesManagement/SearchBar';
import AddPaymentForm from './FeesManagement/AddPaymentForm';
import StudentBalancesTable from './FeesManagement/StudentBalancesTable';
import FeesUpdateModal from './FeesManagement/FeesUpdateModal';
import LoadingState from './FeesManagement/LoadingState';
import ErrorState from './FeesManagement/ErrorState';

const defaultFees = {
  registration: { label: "Registration Fee", amount: 2799.84 },
  skills: { label: "Skills Program", amount: 5598.72 },
  assessment: { label: "PoEs Assessment", amount: 300.00 },
  internal: { label: "Internal Moderation", amount: 300.00 },
  external: { label: "External Moderation", amount: 300.00 },
  certification: { label: "Certification", amount: 124.80 },
  results: { label: "Statement of Results", amount: 124.80 },
  final: { label: "Final Assessment", amount: 936.00 },
};

const FeesManagement = () => {
  const [fees, setFees] = useState(defaultFees);
  const [students, setStudents] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [newStudent, setNewStudent] = useState({ 
    student_number: "", 
    amount_paid: "", 
    payment_method: "cash",
    sponsor_name: "",
    bursary_name: "",
    notes: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch enrolled students and existing fee records
  useEffect(() => {
    fetchEnrolledStudents();
    fetchFeeRecords();
  }, []);

  const fetchEnrolledStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch approved students from register table
      const { data, error: fetchError } = await supabase
        .from('register')
        .select('*')
        .eq('status', 'approved')
        .order('first_name', { ascending: true });

      if (fetchError) throw fetchError;
      setEnrolledStudents(data || []);
    } catch (err) {
      console.error('Error fetching enrolled students:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeRecords = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('student_fees')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        // If table doesn't exist, just set empty array
        if (fetchError.code === 'PGRST116' || fetchError.message.includes('relation "student_fees" does not exist')) {
          console.log('student_fees table does not exist yet. Please run the SQL script to create it.');
          setStudents([]);
          return;
        }
        throw fetchError;
      }
      setStudents(data || []);
    } catch (err) {
      console.error('Error fetching fee records:', err);
      console.error('Error details:', {
        message: err.message,
        details: err.details,
        hint: err.hint,
        code: err.code
      });
      // Don't set error here as it's not critical for the main functionality
      setStudents([]);
    }
  };

  const calculateTotal = () =>
    Object.values(fees).reduce((total, fee) => total + fee.amount, 0);

  const handleAddStudent = async () => {
    if (!newStudent.student_number || !newStudent.amount_paid) {
      alert('Please select a student and enter the amount paid.');
      return;
    }

    try {
      setSaving(true);

      const total = calculateTotal();
      const paid = parseFloat(newStudent.amount_paid);
      const owed = total - paid;

      // Find the student details
      const student = enrolledStudents.find(s => s.national_id === newStudent.student_number);
      if (!student) {
        alert('Selected student not found.');
        return;
      }

      // Insert fee record into database
      const feeRecord = {
        student_number: newStudent.student_number,
        student_name: `${student.first_name} ${student.last_name}`,
        student_email: student.email,
        total_fees: total,
        amount_paid: paid,
        amount_owed: owed,
        payment_method: newStudent.payment_method,
        sponsor_name: newStudent.sponsor_name || null,
        bursary_name: newStudent.bursary_name || null,
        notes: newStudent.notes || null,
        payment_date: new Date().toISOString()
      };

      const { data, error: insertError } = await supabase
        .from('student_fees')
        .insert(feeRecord)
        .select();

      if (insertError) throw insertError;

      // Update local state
      setStudents(prev => [data[0], ...prev]);
      
      // Reset form
      setNewStudent({ 
        student_number: "", 
        amount_paid: "", 
        payment_method: "cash",
        sponsor_name: "",
        bursary_name: "",
        notes: ""
      });

      alert('Student payment recorded successfully!');
    } catch (err) {
      console.error('Error adding student payment:', err);
      alert('Error recording payment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const generatePDF = (student) => {
    const doc = new jsPDF();
    doc.text("Student Fee Invoice", 20, 20);
    doc.text(`Name: ${student.student_name}`, 20, 30);
    doc.text(`Student ID: ${student.student_number}`, 20, 40);
    doc.text(`Email: ${student.student_email}`, 20, 50);
    doc.text(`Total Fee: R${student.total_fees.toFixed(2)}`, 20, 60);
    doc.text(`Amount Paid: R${student.amount_paid.toFixed(2)}`, 20, 70);
    doc.text(`Amount Owed: R${student.amount_owed.toFixed(2)}`, 20, 80);
    if (student.sponsor_name) {
      doc.text(`Sponsor: ${student.sponsor_name}`, 20, 90);
    }
    if (student.bursary_name) {
      doc.text(`Bursary: ${student.bursary_name}`, 20, 100);
    }
    doc.text(`Payment Date: ${new Date(student.payment_date).toLocaleDateString()}`, 20, 110);
    doc.save(`${student.student_name.replace(/\s/g, "_")}_invoice.pdf`);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 min-h-screen">
      {/* Header Component */}
      <FeesHeader 
        onRefresh={fetchFeeRecords}
        onUpdateFees={() => setModalOpen(true)}
      />

      {/* Search Bar Component */}
      <SearchBar 
        filter={filter}
        setFilter={setFilter}
        totalStudents={students.length}
      />

      {/* Add Payment Form Component */}
      <AddPaymentForm
        newStudent={newStudent}
        setNewStudent={setNewStudent}
        enrolledStudents={enrolledStudents}
        students={students}
        onAddStudent={handleAddStudent}
        saving={saving}
      />

      {/* Student Balances Table Component */}
      <StudentBalancesTable
        students={students}
        filter={filter}
        calculateTotal={calculateTotal}
        generatePDF={generatePDF}
      />

      {/* Fees Update Modal Component */}
      <FeesUpdateModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        fees={fees}
        setFees={setFees}
      />
    </div>
  );
};

export default FeesManagement; 