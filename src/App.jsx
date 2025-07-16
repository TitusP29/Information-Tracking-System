import './App.css'
import AdminDashboard from './components/Admin/AdminDashboard'
import { AuthProvider } from './contexts/AuthContext'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Signup from './components/Auth/Signup'
import Login from './components/Auth/Login'

import StudentDashboard from './components/Student/StudentDashboard'
import ApplicationIntake from './components/Student/ApplicationIntake'
import Register from './components/Student/Register'
import RegistrationProgress from './components/Student/RegistrationProgress'
import Documents from './components/Student/Documents'
import IEnablerStudentDashboard from './components/IEnabler/IEnablerStudentDashboard'

import AboutUs from './components/Student/Aboutus'
import StudentLayout from './components/Student/StudentLayout'

import EnrolledStudents from './components/Enrolled/EnrolledStudents'
import Grades from './components/Enrolled/Grades'
import Attendance from './components/Enrolled/Attendance'
import FeesManagement from './components/Enrolled/FeesManagement'
import EnrolledStudentsIndex from './components/Enrolled/EnrolledStudentsIndex'
import AssignmentManager from './components/Enrolled/AssignmentManager';
import ExamManager from './components/Enrolled/ExamManager';
import LessonManager from './components/Enrolled/LessonManager';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          
          {/* I-Enabler Dashboard - Standalone */}
          <Route path="/ienabler/*" element={<IEnablerStudentDashboard />} />
          
          {/* Student Routes with Layout */}
          <Route element={<StudentLayout />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/application-intake" element={<ApplicationIntake />} />
            <Route path="/register" element={<Register />} />
            <Route path="/registration-progress" element={<RegistrationProgress />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/aboutus" element={<AboutUs />} />
          </Route>

          <Route path="/enrolled-students" element={<EnrolledStudents />}>
            <Route index element={<EnrolledStudentsIndex />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="grades" element={<Grades />} />
            <Route path="fees-management" element={<FeesManagement />} />
            <Route path="assignments" element={<AssignmentManager />} />
            <Route path="exams" element={<ExamManager />} />
            <Route path="lessons" element={<LessonManager />} />
          </Route>

          <Route path="/enrolled-students/feesmanagement" element={<Navigate to="/enrolled-students/fees-management" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
