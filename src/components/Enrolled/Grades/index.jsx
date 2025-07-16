import React, { useState, useEffect } from "react";
import { supabase } from '../../../../supabaseClient';
import GradesHeader from './GradesHeader';
import SearchFilterBar from './SearchFilterBar';
import CourseCard from './CourseCard';
import GradeForm from './GradeForm';
import GradeTable from './GradeTable';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

const courses = [
  "Project Manager",
  "Renewable Energy Workshop Assistance",
  "New Venture Creation",
  "Energy Efficiency Technician",
  "Solar Technician",
];

const CourseGrades = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [grade, setGrade] = useState("");
  const [comment, setComment] = useState("");
  const [courseData, setCourseData] = useState({});
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch enrolled students and existing grades on component mount
  useEffect(() => {
    fetchEnrolledStudents();
    fetchGrades();
  }, []);

  const fetchEnrolledStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch approved students from register table
      const { data, error: fetchError } = await supabase
        .from('register')
        .select('*')
        .eq('status', 'approved')
        .order('first_name', { ascending: true });

      if (fetchError) throw fetchError;
      setEnrolledStudents(data || []);
    } catch (err) {
      console.error('Error fetching enrolled students:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('grades')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        // If table doesn't exist, just set empty object
        if (fetchError.code === 'PGRST116' || fetchError.message.includes('relation "grades" does not exist')) {
          console.log('grades table does not exist yet. Please run the SQL script to create it.');
          setCourseData({});
          return;
        }
        throw fetchError;
      }

      // Group grades by course
      const groupedGrades = {};
      if (data) {
        data.forEach(gradeRecord => {
          if (!groupedGrades[gradeRecord.course]) {
            groupedGrades[gradeRecord.course] = [];
          }
          groupedGrades[gradeRecord.course].push({
            name: gradeRecord.student_name,
            studentId: gradeRecord.student_number,
            grade: gradeRecord.grade,
            comment: gradeRecord.comment || "",
            id: gradeRecord.id
          });
        });
      }
      setCourseData(groupedGrades);
    } catch (err) {
      console.error('Error fetching grades:', err);
      console.error('Error details:', {
        message: err.message,
        details: err.details,
        hint: err.hint,
        code: err.code
      });
      setCourseData({});
    }
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    clearForm();
  };

  const clearForm = () => {
    setStudentName("");
    setStudentId("");
    setGrade("");
    setComment("");
    setIsEditing(false);
    setEditIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCourse || !studentId || !grade) {
      alert('Please select a course, student, and enter a grade.');
      return;
    }

    try {
      setSaving(true);

      const gradeValue = parseInt(grade, 10);
      if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 100) {
        alert('Please enter a valid grade between 0 and 100.');
        return;
      }

      // Find the student details
      const student = enrolledStudents.find(s => s.national_id === studentId);
      if (!student) {
        alert('Selected student not found.');
        return;
      }

      const gradeRecord = {
        student_number: studentId,
        student_name: `${student.first_name} ${student.last_name}`,
        course: selectedCourse,
        grade: gradeValue,
        comment: comment.trim() || null
      };

      if (isEditing) {
        // Update existing grade
        const existingGrade = courseData[selectedCourse][editIndex];
        const { error: updateError } = await supabase
          .from('grades')
          .update(gradeRecord)
          .eq('id', existingGrade.id);

        if (updateError) throw updateError;
      } else {
        // Insert new grade
        const { data, error: insertError } = await supabase
          .from('grades')
          .insert(gradeRecord)
          .select();

        if (insertError) throw insertError;
      }

      // Refresh grades data
      await fetchGrades();
      clearForm();
      alert(isEditing ? 'Grade updated successfully!' : 'Grade saved successfully!');
    } catch (err) {
      console.error('Error saving grade:', err);
      alert('Error saving grade. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (index, student) => {
    setIsEditing(true);
    setEditIndex(index);
    setStudentName(student.name);
    setStudentId(student.studentId);
    setGrade(student.grade.toString());
    setComment(student.comment);
  };

  const handleDelete = async (index) => {
    if (!confirm('Are you sure you want to delete this grade?')) {
      return;
    }

    try {
      const existingGrade = courseData[selectedCourse][index];
      
      const { error: deleteError } = await supabase
        .from('grades')
        .delete()
        .eq('id', existingGrade.id);

      if (deleteError) throw deleteError;

      // Refresh grades data
      await fetchGrades();
      clearForm();
      alert('Grade deleted successfully!');
    } catch (err) {
      console.error('Error deleting grade:', err);
      alert('Error deleting grade. Please try again.');
    }
  };

  const applyFilters = (students) => {
    return students.filter((student) => {
      const matchesName = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        gradeFilter === "All"
          ? true
          : gradeFilter === "Pass"
          ? student.grade >= 50
          : student.grade < 50;
      return matchesName && matchesFilter;
    });
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 min-h-screen overflow-x-auto">
      <GradesHeader onRefresh={fetchGrades} />
      
      <SearchFilterBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        gradeFilter={gradeFilter}
        setGradeFilter={setGradeFilter}
        hasData={Object.keys(courseData).length > 0}
      />

      {/* Course Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
        {courses.map((course) => (
          <CourseCard
            key={course}
            course={course}
            selectedCourse={selectedCourse}
            courseData={courseData}
            enrolledStudents={enrolledStudents}
            onCourseClick={handleCourseClick}
          />
        ))}
      </div>

      <GradeForm
        selectedCourse={selectedCourse}
        studentName={studentName}
        setStudentName={setStudentName}
        studentId={studentId}
        setStudentId={setStudentId}
        grade={grade}
        setGrade={setGrade}
        comment={comment}
        setComment={setComment}
        enrolledStudents={enrolledStudents}
        isEditing={isEditing}
        saving={saving}
        onSubmit={handleSubmit}
        onCancel={clearForm}
      />

      {/* Grade Tables */}
      {Object.entries(courseData).map(([course, students]) => {
        const filteredStudents = applyFilters(students);
        
        return (
          <GradeTable
            key={course}
            course={course}
            students={students}
            filteredStudents={filteredStudents}
            courseData={courseData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            setSelectedCourse={setSelectedCourse}
          />
        );
      })}
    </div>
  );
};

export default CourseGrades; 