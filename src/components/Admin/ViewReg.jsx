import React, { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import {
  Eye,
  User,
  GraduationCap,
  Calendar,
  FileText,
  CheckCircle,
  X,
  ArrowRight
} from 'lucide-react';

const ViewReg = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusMap, setStatusMap] = useState({}); // { studentId: 'pending' | 'approved' }

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase.from('register').select('*');
    if (error) {
      console.error('Error fetching students:', error);
    } else {
      setStudents(data);
      // Initialize statusMap with 'pending' for each student
      const initialStatus = {};
      data.forEach(s => { initialStatus[s.id] = 'pending'; });
      setStatusMap(initialStatus);
    }
  };

  const handleView = (student) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const handleApprove = (studentId) => {
    setStatusMap(prev => ({ ...prev, [studentId]: 'approved' }));
    setModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-700 dark:text-cyan-400 flex items-center gap-3">
          <FileText className="text-blue-600 dark:text-cyan-300" size={32} />
          Student Registrations
        </h1>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Course</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Registration Date</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {students.map(student => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {student.first_name} {student.surname}
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {student.course || student.course_name}
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {student.reg_date ? new Date(student.reg_date).toLocaleDateString() : ''}
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleView(student)} 
                      className="bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-xl shadow-lg transition-colors flex items-center gap-2"
                    >
                      <Eye size={16} />
                      View Details
                      <ArrowRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Modal */}
      {modalOpen && selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl bg-gray-100 dark:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center"
              onClick={() => setModalOpen(false)}
            >
              &times;
            </button>
            
            <h3 className="text-2xl font-bold text-blue-700 dark:text-cyan-400 mb-6 flex items-center gap-3">
              <User className="text-blue-600 dark:text-cyan-300" size={24} />
              Student Details
            </h3>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {Object.entries(selectedStudent)
                .filter(([key]) => key !== 'id' && key !== 'user_id')
                .map(([key, value]) => (
                  <div key={key} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-3 mb-2">
                      {key.includes('name') && <User size={16} className="text-blue-600 dark:text-cyan-300" />}
                      {key.includes('course') && <GraduationCap size={16} className="text-emerald-600 dark:text-emerald-400" />}
                      {key.includes('date') && <Calendar size={16} className="text-amber-600 dark:text-amber-400" />}
                      {!key.includes('name') && !key.includes('course') && !key.includes('date') && <FileText size={16} className="text-gray-600 dark:text-gray-400" />}
                      <span className="font-bold text-gray-900 dark:text-white capitalize">
                        {key.replace(/_/g, ' ')}:
                      </span>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 ml-7">
                      {key.includes('date') && value ? new Date(value).toLocaleDateString() : String(value)}
                    </div>
                  </div>
                ))}
            </div>
            
            <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold"
                onClick={() => setModalOpen(false)}
              >
                Close
              </button>
              <button
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-semibold flex items-center gap-2"
                onClick={() => handleApprove(selectedStudent.id)}
              >
                <CheckCircle size={18} />
                Approve Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewReg;
