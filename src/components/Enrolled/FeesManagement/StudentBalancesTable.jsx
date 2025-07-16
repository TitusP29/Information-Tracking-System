import React from 'react';
import { Users, FileText, DollarSign, Calculator, CreditCard, Download } from 'lucide-react';

const StudentBalancesTable = ({ students, filter, calculateTotal, generatePDF }) => {
  const filteredStudents = students.filter((s) => 
    s.student_name.toLowerCase().includes(filter.toLowerCase()) || 
    s.student_number.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-700 dark:to-slate-800 px-8 py-6 border-b border-slate-200 dark:border-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
              <CreditCard className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Student Balances</h2>
              <p className="text-slate-600 dark:text-slate-400">View and manage student payment records</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium">Total Fees:</span>
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-bold">
              R{calculateTotal().toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
            <tr>
              <th className="px-8 py-6 text-left">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-semibold">
                  <Users size={18} />
                  <span className="text-sm uppercase tracking-wider">Name</span>
                </div>
              </th>
              <th className="px-8 py-6 text-left">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-semibold">
                  <FileText size={18} />
                  <span className="text-sm uppercase tracking-wider">Student ID</span>
                </div>
              </th>
              <th className="px-8 py-6 text-left">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-semibold">
                  <DollarSign size={18} />
                  <span className="text-sm uppercase tracking-wider">Amount Paid</span>
                </div>
              </th>
              <th className="px-8 py-6 text-left">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-semibold">
                  <Calculator size={18} />
                  <span className="text-sm uppercase tracking-wider">Amount Owed</span>
                </div>
              </th>
              <th className="px-8 py-6 text-left">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-semibold">
                  <span className="text-sm uppercase tracking-wider">Sponsor/Bursary</span>
                </div>
              </th>
              <th className="px-8 py-6 text-left">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-semibold">
                  <Download size={18} />
                  <span className="text-sm uppercase tracking-wider">Actions</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {filteredStudents.map((student, index) => (
              <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all duration-200 group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {student.student_name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                        {student.student_name}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-sm">
                        {student.student_email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">{student.student_number.slice(-4)}</span>
                    </div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {student.student_number}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                      <DollarSign className="text-emerald-600 dark:text-emerald-400" size={18} />
                    </div>
                    <div className="font-semibold text-emerald-600 dark:text-emerald-400 text-lg">
                      R{student.amount_paid.toFixed(2)}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                      <Calculator className="text-red-600 dark:text-red-400" size={18} />
                    </div>
                    <div className="font-semibold text-red-600 dark:text-red-400 text-lg">
                      R{student.amount_owed.toFixed(2)}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    {student.sponsor_name && (
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        <span className="font-medium">Sponsor:</span> {student.sponsor_name}
                      </div>
                    )}
                    {student.bursary_name && (
                      <div className="text-sm text-purple-600 dark:text-purple-400">
                        <span className="font-medium">Bursary:</span> {student.bursary_name}
                      </div>
                    )}
                    {!student.sponsor_name && !student.bursary_name && (
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Self-funded
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <button 
                    onClick={() => generatePDF(student)} 
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl group-hover:scale-105"
                  >
                    <Download size={16} />
                    Download PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="bg-slate-50 dark:bg-slate-700/50 px-8 py-4 border-t border-slate-200 dark:border-slate-600">
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span>Showing {filteredStudents.length} of {students.length} students</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentBalancesTable; 