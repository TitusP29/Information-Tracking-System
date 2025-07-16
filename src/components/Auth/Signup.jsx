import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../../supabaseClient'
import { Button } from '../ui/button'
import { UserPlus } from 'lucide-react';

function Signup() {
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    // Determine role
    const role = formData.email.endsWith('@graceartisanschool.education') ? 'admin' : 'student'

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await signUp(formData.email, formData.password)
      if (authError) throw authError

      // Create user profile in existing table
      const { error: profileError } = await supabase
        .from('user_profile')
        .insert([
          {
            id: authData.user.id,
            first_name: formData.firstName,
            surname: formData.surname,
            role: role
          }
        ])

      if (profileError) {
        console.warn('Profile creation error:', profileError)
        // Don't throw error, profile might already exist or have different structure
      }

      // Success: prompt user to check email and log in
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-screen min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg mx-2 sm:mx-4 p-0 border border-gray-200 dark:border-gray-700 flex flex-col justify-center min-h-[480px]">
        <div className="flex flex-col items-center pt-8 pb-4 px-4 sm:px-8">
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mb-2 shadow-sm">
            <UserPlus className="text-blue-700 dark:text-blue-300" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1 tracking-tight">Sign Up</h2>
          <p className="text-gray-500 dark:text-gray-300 text-sm mb-2">Create your account</p>
        </div>
        <div className="px-4 sm:px-8 pb-8 w-full">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-2 mb-4 rounded text-center shadow-sm">{error}</div>}
          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded text-center shadow-sm">
              Signup successful! Please check your email for verification and then log in.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition"
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
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition"
                  autoComplete="username"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition"
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all duration-200" disabled={loading}>
                {loading ? 'Signing up...' : (<><UserPlus size={18} /> Sign Up</>)}
              </Button>
            </form>
          )}
          <div className="mt-6 text-center">
            <span className="text-gray-600 dark:text-gray-300">Already have an account? </span>
            <Link to="/login" className="text-blue-700 hover:underline dark:text-blue-300 dark:hover:text-blue-200 font-semibold">Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup;