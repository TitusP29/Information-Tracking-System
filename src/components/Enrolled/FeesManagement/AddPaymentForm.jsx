import React from 'react';
import { Plus, Loader2 } from 'lucide-react';

const AddPaymentForm = ({
  newStudent,
  setNewStudent,
  enrolledStudents,
  students,
  onAddStudent,
  saving
}) => {
  const getStudentsNotInFees = () => {
    const studentsWithFees = students.map(s => s.student_number);
    return enrolledStudents.filter(student => !studentsWithFees.includes(student.national_id));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700 mb-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
          <Plus className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Add Student Payment</h2>
          <p className="text-slate-600 dark:text-slate-400">Record new student payment information</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Select Student</label>
          <select 
            value={newStudent.student_number} 
            onChange={(e) => setNewStudent({ ...newStudent, student_number: e.target.value })} 
            className="w-full px-4 py-4 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white text-lg transition-all duration-200"
          >
            <option value="">Choose a student...</option>
            {getStudentsNotInFees().map(student => (
              <option key={student.national_id} value={student.national_id}>
                {student.first_name} {student.last_name} ({student.national_id})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Amount Paid</label>
          <input 
            type="number" 
            value={newStudent.amount_paid} 
            onChange={(e) => setNewStudent({ ...newStudent, amount_paid: e.target.value })} 
            placeholder="Enter amount paid" 
            className="w-full px-4 py-4 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white text-lg transition-all duration-200" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Payment Method</label>
          <select 
            value={newStudent.payment_method} 
            onChange={(e) => setNewStudent({ ...newStudent, payment_method: e.target.value })} 
            className="w-full px-4 py-4 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white text-lg transition-all duration-200"
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="sponsor">Sponsor</option>
            <option value="bursary">Bursary</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Sponsor Name (if applicable)</label>
          <input 
            value={newStudent.sponsor_name} 
            onChange={(e) => setNewStudent({ ...newStudent, sponsor_name: e.target.value })} 
            placeholder="Enter sponsor name" 
            className="w-full px-4 py-4 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white text-lg transition-all duration-200" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Bursary Name (if applicable)</label>
          <input 
            value={newStudent.bursary_name} 
            onChange={(e) => setNewStudent({ ...newStudent, bursary_name: e.target.value })} 
            placeholder="Enter bursary name" 
            className="w-full px-4 py-4 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white text-lg transition-all duration-200" 
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Notes</label>
        <textarea 
          value={newStudent.notes} 
          onChange={(e) => setNewStudent({ ...newStudent, notes: e.target.value })} 
          placeholder="Additional notes about the payment..." 
          rows={3}
          className="w-full px-4 py-4 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white text-lg transition-all duration-200" 
        />
      </div>
      
      <button 
        onClick={onAddStudent}
        disabled={!newStudent.student_number || !newStudent.amount_paid || saving}
        className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center gap-3 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Plus size={20} />
            Add Student Payment
          </>
        )}
      </button>
    </div>
  );
};

export default AddPaymentForm; 