import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../../supabaseClient'
import { Button } from '../ui/button'
import { LogIn } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      console.log('Starting login process...')
      
      // Test Supabase connection first
      try {
        const { data: testData, error: testError } = await supabase
          .from('user_profile')
          .select('count')
          .limit(1)
        
        console.log('Connection test result:', { testData, testError })
        
        if (testError) {
          console.error('Supabase connection test failed:', testError)
          setError('Database connection failed. Please try again later.')
          return
        }
      } catch (connectionErr) {
        console.error('Connection test exception:', connectionErr)
        setError('Unable to connect to the database. Please check your internet connection.')
        return
      }
      
      // Authenticate user
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })
      
      if (authError) {
        console.error('Authentication error:', authError)
        throw authError
      }
      
      console.log('Authentication successful:', data.user)

      // Fetch user profile - try different possible column names
      let profile = null;
      let profileError = null;
      
      try {
        // Try to get the profile with role column
        const { data: profileData, error: error1 } = await supabase
          .from('user_profile')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle()
        
        console.log('Profile query result:', { profileData, error1 })
        
        if (error1) {
          console.warn('Profile fetch error:', error1)
          // Default to student role if profile fetch fails
          navigate('/student')
          return
        }
        
        profile = profileData;
      } catch (profileErr) {
        console.error('Profile fetch exception:', profileErr)
        // Default to student role if profile fetch fails
        navigate('/student')
        return
      }
      
      // Determine role based on available columns
      let userRole = 'student'; // default
      
      if (profile) {
        console.log('Profile found:', profile)
        // Check for role column (case insensitive)
        if (profile.role) {
          userRole = profile.role;
        } else if (profile.user_role) {
          userRole = profile.user_role;
        } else if (profile.type) {
          userRole = profile.type;
        } else if (profile.user_type) {
          userRole = profile.user_type;
        } else {
          // If no role column found, determine by email domain
          userRole = data.user.email.endsWith('@graceartisanschool.education') ? 'admin' : 'student';
        }
      } else {
        console.log('No profile found, using email domain for role')
        // No profile found, determine by email domain
        userRole = data.user.email.endsWith('@graceartisanschool.education') ? 'admin' : 'student';
      }

      console.log('Determined user role:', userRole)

      // Navigate based on role
      if (userRole === 'student') {
        navigate('/student')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-screen min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg mx-2 sm:mx-4 p-0 border border-gray-200 dark:border-gray-700 flex flex-col justify-center min-h-[420px]">
        <div className="flex flex-col items-center pt-8 pb-4 px-4 sm:px-8">
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mb-2 shadow-sm">
            <LogIn className="text-blue-700 dark:text-blue-300" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1 tracking-tight">Sign In</h2>
          <p className="text-gray-500 dark:text-gray-300 text-sm mb-2">Access your account</p>
        </div>
        <div className="px-4 sm:px-8 pb-8 w-full">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-2 mb-4 rounded text-center shadow-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all duration-200" disabled={loading}>
              {loading ? 'Logging in...' : (<><LogIn size={18} /> Login</>)}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <span className="text-gray-600 dark:text-gray-300">Don't have an account? </span>
            <Link to="/signup" className="text-blue-700 hover:underline dark:text-blue-300 dark:hover:text-blue-200 font-semibold">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login