import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import {
  DollarSign,
  CreditCard,
  Calculator,
  FileText,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Building,
  Award,
  TrendingUp,
  TrendingDown,
  Calendar,
  Receipt
} from 'lucide-react';
import jsPDF from 'jspdf';

const StudentFinancialAid = () => {
  const auth = useAuth();
  const user = auth?.user;
  const [feeRecord, setFeeRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeeRecord = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get the student's national_id from the register table
        const { data: registerData, error: registerError } = await supabase
          .from('register')
          .select('national_id')
          .eq('user_id', user.id)
          .single();

        if (registerError) throw registerError;
        if (!registerData) throw new Error('Student registration not found');

        // Fetch fee record for this student
        const { data, error: feeError } = await supabase
          .from('student_fees')
          .select('*')
          .eq('student_number', registerData.national_id)
          .single();

        if (feeError && feeError.code !== 'PGRST116') throw feeError; // PGRST116 is "not found"
        setFeeRecord(data);
      } catch (err) {
        console.error('Error fetching fee record:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeRecord();
  }, [user]);

  const generatePDF = () => {
    if (!feeRecord) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text("Student Financial Statement", 20, 20);
    
    // Student Information
    doc.setFontSize(12);
    doc.text(`Name: ${feeRecord.student_name}`, 20, 40);
    doc.text(`Student ID: ${feeRecord.student_number}`, 20, 50);
    doc.text(`Email: ${feeRecord.student_email}`, 20, 60);
    
    // Financial Information
    doc.text(`Total Fees: R${feeRecord.total_fees.toFixed(2)}`, 20, 80);
    doc.text(`Amount Paid: R${feeRecord.amount_paid.toFixed(2)}`, 20, 90);
    doc.text(`Amount Owed: R${feeRecord.amount_owed.toFixed(2)}`, 20, 100);
    
    // Payment Details
    if (feeRecord.sponsor_name) {
      doc.text(`Sponsor: ${feeRecord.sponsor_name}`, 20, 120);
    }
    if (feeRecord.bursary_name) {
      doc.text(`Bursary: ${feeRecord.bursary_name}`, 20, 130);
    }
    
    doc.text(`Payment Date: ${new Date(feeRecord.payment_date).toLocaleDateString()}`, 20, 150);
    
    if (feeRecord.notes) {
      doc.text(`Notes: ${feeRecord.notes}`, 20, 170);
    }
    
    doc.save(`${feeRecord.student_name.replace(/\s/g, "_")}_financial_statement.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading your financial information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">Error loading financial information: {error}</p>
        </div>
      </div>
    );
  }

  if (!feeRecord) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            No Financial Record Found
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Your financial information will appear here once your fees are recorded by the administration.
          </p>
        </div>
      </div>
    );
  }

  const paymentStatus = feeRecord.amount_owed <= 0 ? 'paid' : 'outstanding';
  const paymentPercentage = (feeRecord.amount_paid / feeRecord.total_fees) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
              <DollarSign className="text-white" size={24} />
            </div>
            Financial Aid & Fees
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            View your fee structure, payments, and financial assistance
          </p>
        </div>
        
        <button
          onClick={generatePDF}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg"
        >
          <Download size={16} />
          Download Statement
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Fees */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
              <Receipt className="text-white" size={20} />
            </div>
            <TrendingUp className="text-blue-500" size={20} />
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Fees</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              R{feeRecord.total_fees.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Amount Paid */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
              <CreditCard className="text-white" size={20} />
            </div>
            <CheckCircle className="text-emerald-500" size={20} />
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Amount Paid</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              R{feeRecord.amount_paid.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Amount Owed */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg">
              <Calculator className="text-white" size={20} />
            </div>
            <TrendingDown className="text-red-500" size={20} />
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Amount Owed</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              R{feeRecord.amount_owed.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl shadow-lg ${
              paymentStatus === 'paid' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                : 'bg-gradient-to-r from-amber-500 to-orange-500'
            }`}>
              <FileText className="text-white" size={20} />
            </div>
            {paymentStatus === 'paid' ? (
              <CheckCircle className="text-emerald-500" size={20} />
            ) : (
              <XCircle className="text-amber-500" size={20} />
            )}
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Payment Status</p>
            <p className={`text-lg font-bold ${
              paymentStatus === 'paid' 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-amber-600 dark:text-amber-400'
            }`}>
              {paymentStatus === 'paid' ? 'Fully Paid' : 'Outstanding'}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Progress */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
            <TrendingUp className="text-white" size={20} />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Payment Progress</h3>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
            <span>Payment Progress</span>
            <span>{paymentPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                paymentPercentage >= 100 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}
              style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-slate-600 dark:text-slate-400">Paid: R{feeRecord.amount_paid.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-slate-600 dark:text-slate-400">Outstanding: R{feeRecord.amount_owed.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Financial Assistance Details */}
      {(feeRecord.sponsor_name || feeRecord.bursary_name) && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg">
              <Award className="text-white" size={20} />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Financial Assistance</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feeRecord.sponsor_name && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                    <Building className="text-white" size={16} />
                  </div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">Sponsor</h4>
                </div>
                <p className="text-blue-700 dark:text-blue-300 font-medium">{feeRecord.sponsor_name}</p>
                <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">Your educational sponsor</p>
              </div>
            )}
            
            {feeRecord.bursary_name && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Award className="text-white" size={16} />
                  </div>
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200">Bursary</h4>
                </div>
                <p className="text-purple-700 dark:text-purple-300 font-medium">{feeRecord.bursary_name}</p>
                <p className="text-purple-600 dark:text-purple-400 text-sm mt-1">Your bursary program</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Details */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-slate-500 to-gray-500 rounded-xl shadow-lg">
            <Calendar className="text-white" size={20} />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Payment Details</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">Payment Method</p>
            <p className="text-slate-800 dark:text-slate-100 font-semibold capitalize">
              {feeRecord.payment_method.replace('_', ' ')}
            </p>
          </div>
          
          <div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">Payment Date</p>
            <p className="text-slate-800 dark:text-slate-100 font-semibold">
              {new Date(feeRecord.payment_date).toLocaleDateString()}
            </p>
          </div>
          
          {feeRecord.notes && (
            <div className="md:col-span-2">
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">Notes</p>
              <p className="text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                {feeRecord.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentFinancialAid; 