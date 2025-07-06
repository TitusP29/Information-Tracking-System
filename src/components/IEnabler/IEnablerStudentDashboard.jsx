import React, { useState } from 'react';
import {
  Home,
  CalendarDays,
  BookOpen,
  Bell,
  FileText,
  GraduationCap,
  Briefcase,
  Activity,
  User,
  Menu,
  Sun,
  Moon,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Route, Routes, Link, useLocation } from 'react-router-dom';

const features = [
  { path: 'timetable', icon: <CalendarDays className="text-blue-600" />, title: 'Class Timetable', desc: 'View your daily and weekly classes.' },
  { path: 'assignments', icon: <BookOpen className="text-green-600" />, title: 'Assignments', desc: 'Track your assignment deadlines.' },
  { path: 'exams', icon: <FileText className="text-purple-600" />, title: 'Exam Schedule', desc: 'Upcoming exam dates and venues.' },
  { path: 'grades', icon: <Activity className="text-orange-600" />, title: 'Grades', desc: 'Check your grades and academic progress.' },
  { path: 'notifications', icon: <Bell className="text-red-600" />, title: 'Notifications', desc: 'Important campus updates and alerts.' },
  { path: 'career', icon: <GraduationCap className="text-indigo-600" />, title: 'Career Hub', desc: 'Find internships, jobs, and skills training.' },
  { path: 'financial-aid', icon: <Briefcase className="text-yellow-600" />, title: 'Financial Aid', desc: 'View NSFAS and other funding status.' },
  { path: 'mentorship', icon: <User className="text-teal-600" />, title: 'Mentorship', desc: 'Connect with mentors and peer tutors.' },
];

function DummyPage({ title }) {
  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-500">This is a placeholder page for {title}.</p>
    </div>
  );
}

export default function IEnablerStudentDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900 dark:text-white">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-[#1e293b] text-white flex flex-col p-4 md:fixed md:h-full z-10">
          <div className="text-2xl font-bold mb-6 flex items-center justify-between md:justify-start">
            I-Enabler
            <button onClick={() => setDarkMode(!darkMode)} className="ml-4 md:ml-auto">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          
          {/* Back to Student Dashboard Link */}
          <Link to="/student" className="flex items-center gap-2 hover:text-blue-300 transition-all mb-4 p-2 rounded bg-gray-700 hover:bg-gray-600">
            <ArrowLeft size={18}/> Back to Student Dashboard
          </Link>
          
          <nav className="space-y-4">
            <Link to="/ienabler" className="flex items-center gap-2 hover:text-blue-300 transition-all"><Home size={18}/> Dashboard</Link>
            {features.map((f, i) => (
              <Link key={i} to={`/ienabler/${f.path}`} className="flex items-center gap-2 hover:text-blue-300 transition-all">
                {f.icon} {f.title}
              </Link>
            ))}
          </nav>
        </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 md:ml-64">
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <motion.h1
                      className="text-2xl font-semibold mb-4"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      Welcome, Student
                    </motion.h1>

                    <motion.div
                      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: {},
                        visible: {
                          transition: {
                            staggerChildren: 0.1
                          }
                        }
                      }}
                    >
                      {features.map((f, i) => (
                        <motion.div
                          key={i}
                          className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 flex items-start gap-4 hover:shadow-lg transition-transform hover:scale-[1.02]"
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">{f.icon}</div>
                          <div>
                            <Link to={`/ienabler/${f.path}`} className="font-semibold text-lg hover:underline">{f.title}</Link>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{f.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </>
                }
              />
              {features.map((f, i) => (
                <Route key={i} path={f.path} element={<DummyPage title={f.title} />} />
              ))}
            </Routes>
          </main>
        </div>
      </div>
  );
}
