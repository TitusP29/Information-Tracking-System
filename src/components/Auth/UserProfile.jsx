import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../../supabaseClient';
import { Button } from '../ui/button';
import { User } from 'lucide-react';

const UserProfile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    surname: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.email) {
      // Set role to 'admin' if email starts with 'admin', else 'student'
      const isAdmin = user.email.toLowerCase().startsWith('admin');
      setFormData((prev) => ({ ...prev, role: isAdmin ? 'admin' : 'student' }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: insertError } = await supabase
        .from('user_profile')
        .insert([
          {
            id: user.id,
            first_name: formData.first_name,
            surname: formData.surname,
            role: formData.role,
          },
        ]);
      if (insertError) throw insertError;
      // Redirect based on role
      if (formData.role === 'student') {
        navigate('/student');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg mx-2 sm:mx-4 p-0 border border-gray-200 dark:border-gray-700 flex flex-col justify-center min-h-[420px]">
        <div className="flex flex-col items-center pt-8 pb-4 px-4 sm:px-8">
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mb-2 shadow-sm">
            <User className="text-blue-700 dark:text-blue-300" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1 tracking-tight">Complete Your Profile</h2>
          <p className="text-gray-500 dark:text-gray-300 text-sm mb-2">Enter your details to continue</p>
        </div>
        <div className="px-4 sm:px-8 pb-8 w-full">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-2 mb-4 rounded text-center shadow-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition"
                autoComplete="given-name"
              />
            </div>
            <div>
              <label htmlFor="surname" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Surname</label>
              <input
                type="text"
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition"
                autoComplete="family-name"
              />
            </div>
            {/* Role is set automatically and not shown to the user */}
            <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all duration-200" disabled={loading}>
              {loading ? 'Saving...' : (<><User size={18} /> Save Profile</>)}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 