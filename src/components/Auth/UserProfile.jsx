import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../../supabaseClient';
import { Button } from '../ui/button';

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
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Complete Your Profile</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="surname" className="block text-sm font-medium mb-1">Surname</label>
          <input
            type="text"
            id="surname"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        {/* Role is set automatically and not shown to the user */}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</Button>
      </form>
    </div>
  );
};

export default UserProfile; 