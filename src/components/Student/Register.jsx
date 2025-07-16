import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../../supabaseClient';
import {
  User,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Heart,
  Clock,
  Save,
  ArrowLeft
} from 'lucide-react';

const RegistrationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    national_id: '',
    surname: '',
    first_name: '',
    title: '',
    dob: '',
    home_address: '',
    home_phone: '',
    postal_address: '',
    cell_phone: '',
    email: '',
    kin_name: '',
    kin_cell: '',
    course: '',
    disability: '',
    reg_date: ''
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        let autofill = {};
        if (user && user.id) {
          const { data, error } = await supabase
            .from('user_profile')
            .select('first_name, surname')
            .eq('id', user.id)
            .single();
          if (error) {
            console.error('Profile fetch error:', error);
          }
          if (data) {
            autofill = {
              first_name: data.first_name || '',
              surname: data.surname || '',
            };
          }
        }
        // Always set email from user object
        if (user && user.email) {
          autofill.email = user.email;
        }
        // Ensure course is autofilled from navigation state if present
        if (location.state && location.state.courseName) {
          autofill.course = location.state.courseName;
        }
        // Autofill registration date to today if not already set
        if (!formData.reg_date) {
          const today = new Date();
          autofill.reg_date = today.toISOString().split('T')[0];
        }
        setFormData(prev => ({ ...prev, ...autofill }));
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    }
    if (user && user.id) {
      fetchProfile();
    }
  }, [user, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Check if student already has a registration with this national_id
      const { data: existingRegistrations, error: checkError } = await supabase
        .from('register')
        .select('national_id')
        .eq('national_id', formData.national_id);

      if (checkError) throw checkError;

      // If this is the first registration, use the provided national_id
      // Otherwise, generate a new unique national_id by appending a suffix
      let nationalId = formData.national_id;
      if (existingRegistrations && existingRegistrations.length > 0) {
        const timestamp = new Date().getTime();
        nationalId = `${formData.national_id}_${timestamp}`;
      }

      // Compose registration data
      const registration = {
        ...formData,
        national_id: nationalId,
        user_id: user?.id,
        reg_date: formData.reg_date === '' ? null : formData.reg_date,
        dob: formData.dob === '' ? null : formData.dob,
      };

      // Insert into Supabase
      const { error: regError } = await supabase.from('register').insert([registration]);
      if (regError) throw regError;

      // Add student to progress_management table
      const progressManagementData = {
        student_number: nationalId,
        application_submitted: 'pending',
        document_uploaded: 'pending',
        payment_verified: 'pending',
        application_review: 'pending'
      };

      const { error: progressError } = await supabase
        .from('progress_management')
        .insert([progressManagementData]);

      if (progressError) throw progressError;

      // Create notification for admin about new application
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          type: 'info',
          title: 'New Student Application',
          message: `New application received from ${formData.first_name} ${formData.surname} for ${formData.course}`,
          recipient_role: 'admin', // Use recipient_role for admin-wide notifications
          read: false
        }]);

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

      setSuccess('Registration submitted successfully!');
      
      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/student');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed.');
      console.error('Registration failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
            <User className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-blue-800 dark:from-slate-100 dark:to-blue-100">
              Course Registration
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
              Complete your application for {formData.course || 'selected course'}
            </p>
          </div>
        </div>
      </div>

      <form className="max-w-6xl mx-auto space-y-8" onSubmit={handleSubmit}>
        {/* Error and Success Messages */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <XCircle size={24} />
              <span className="font-semibold text-lg">{error}</span>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-800/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <CheckCircle size={24} />
              <span className="font-semibold text-lg">{success}</span>
            </div>
          </div>
        )}

        {/* Fee Structure Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-lg">
              <DollarSign className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Fee Structure Summary</h3>
              <p className="text-slate-600 dark:text-slate-400">Complete breakdown of course fees</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Registration Fee:</span>
                <span className="text-slate-800 dark:text-slate-100 font-bold">R2,799.84</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Skills Programme Fee:</span>
                <span className="text-slate-800 dark:text-slate-100 font-bold">R5,598.72</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Assessment & Moderation:</span>
                <span className="text-slate-800 dark:text-slate-100 font-bold">R300 each</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Certification:</span>
                <span className="text-slate-800 dark:text-slate-100 font-bold">R125.04</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Statement of Results:</span>
                <span className="text-slate-800 dark:text-slate-100 font-bold">R125.04</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Final Assessment:</span>
                <span className="text-slate-800 dark:text-slate-100 font-bold">R936.00</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <span className="font-semibold text-slate-700 dark:text-slate-300">PPE:</span>
                <span className="text-slate-800 dark:text-slate-100 font-bold">TBD</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Optional Extras:</span>
                <span className="text-slate-800 dark:text-slate-100 font-bold">TBD</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-700 rounded-2xl">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertTriangle size={20} />
              <p className="font-semibold">
                IMPORTANT: Kindly upload a certified copy of your ID, Proof of Residence and Latest Certificates when submitting your Application.
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
              <User className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Personal Information</h3>
              <p className="text-slate-600 dark:text-slate-400">Your basic personal details</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">National ID Number</label>
              <input 
                type="text" 
                name="national_id" 
                value={formData.national_id} 
                onChange={handleChange} 
                placeholder="Enter your national ID" 
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white transition-all duration-200" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Surname</label>
              <input 
                type="text" 
                name="surname" 
                value={formData.surname} 
                onChange={handleChange} 
                placeholder="Enter your surname" 
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white transition-all duration-200" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">First Name</label>
              <input 
                type="text" 
                name="first_name" 
                value={formData.first_name} 
                onChange={handleChange} 
                placeholder="Enter your first name" 
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white transition-all duration-200" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Title</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                placeholder="Mr, Mrs, Dr, etc." 
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white transition-all duration-200" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date of Birth</label>
              <input 
                type="date" 
                name="dob" 
                value={formData.dob} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white transition-all duration-200" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Course</label>
              <input 
                type="text" 
                name="course" 
                value={formData.course} 
                onChange={handleChange} 
                placeholder="Selected course" 
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-100 dark:bg-slate-600 dark:text-white transition-all duration-200" 
                required 
                readOnly 
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
              <Phone className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Contact Information</h3>
              <p className="text-slate-600 dark:text-slate-400">Your contact details and addresses</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Home Address</label>
              <input 
                type="text" 
                name="home_address" 
                value={formData.home_address} 
                onChange={handleChange} 
                placeholder="Enter your home address" 
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white transition-all duration-200" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Postal Address</label>
              <input 
                type="text" 
                name="postal_address" 
                value={formData.postal_address} 
                onChange={handleChange} 
                placeholder="Enter your postal address" 
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white transition-all duration-200" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Home Phone</label>
              <input 
                type="text" 
                name="home_phone" 
                value={formData.home_phone} 
                onChange={handleChange} 
                placeholder="Enter home phone number" 
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white transition-all duration-200" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Cell Phone</label>
              <input 
                type="text" 
                name="cell_phone" 
                value={formData.cell_phone} 
                onChange={handleChange} 
                placeholder="Enter cell phone number" 
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white transition-all duration-200" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Enter your email address" 
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white transition-all duration-200" 
                required 
              />
            </div>
          </div>
        </div>

        {/* Next of Kin Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg">
              <Heart className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Next of Kin</h3>
              <p className="text-slate-600 dark:text-slate-400">Emergency contact information</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Next of Kin Name</label>
              <input 
                type="text" 
                name="kin_name" 
                value={formData.kin_name} 
                onChange={handleChange} 
                placeholder="Enter next of kin name" 
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white transition-all duration-200" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Next of Kin Cell</label>
              <input 
                type="text" 
                name="kin_cell" 
                value={formData.kin_cell} 
                onChange={handleChange} 
                placeholder="Enter next of kin cell number" 
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white transition-all duration-200" 
                required 
              />
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-slate-500 to-slate-600 rounded-2xl shadow-lg">
              <FileText className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Additional Information</h3>
              <p className="text-slate-600 dark:text-slate-400">Any additional details or special requirements</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Disability Information</label>
              <textarea 
                name="disability" 
                value={formData.disability} 
                onChange={handleChange} 
                placeholder="Specify any disability or special requirements if applicable" 
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white transition-all duration-200 resize-none" 
                rows={3} 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Registration Date</label>
              <input 
                type="date" 
                name="reg_date" 
                value={formData.reg_date} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 dark:text-white transition-all duration-200" 
                required 
              />
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="flex items-center justify-between">
          <button 
            type="button"
            onClick={() => navigate('/student')}
            className="flex items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 font-semibold"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          
          <button 
            type="submit" 
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-4 px-8 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <Save size={20} />
                Submit Registration
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
