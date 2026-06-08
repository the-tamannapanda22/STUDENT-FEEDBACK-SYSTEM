import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/student/StudentDashboard';
import FeedbackForm from './pages/student/FeedbackForm';
import SuccessPage from './pages/student/SuccessPage';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import CourseAnalytics from './pages/faculty/CourseAnalytics';
import FacultyHistoricalAnalytics from './pages/faculty/FacultyHistoricalAnalytics';

import PendingStudents from './pages/faculty/PendingStudents';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCourses from './pages/admin/ManageCourses';
import ManageFaculty from './pages/admin/ManageFaculty';
import ManageStudents from './pages/admin/ManageStudents';
import CourseSetup from './pages/admin/CourseSetup';
import FacultyCourseSetup from './pages/faculty/FacultyCourseSetup';
import Profile from './pages/Profile';
import FacultyActionPlans from './pages/faculty/FacultyActionPlans';
import AdminActionPlans from './pages/admin/AdminActionPlans';
import UploadFeedback from './pages/admin/UploadFeedback';
import ManualAnalytics from './components/ManualAnalytics';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-textBase font-sans selection:bg-primary selection:text-textBase">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />

          {/* Student */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/feedback-form/:courseId" element={<FeedbackForm />} />
          <Route path="/success" element={<SuccessPage />} />

          {/* Faculty */}
          <Route path="/faculty" element={<FacultyDashboard />} />
          <Route path="/faculty/historical" element={<FacultyHistoricalAnalytics />} />
          <Route path="/analytics/:courseId" element={<CourseAnalytics />} />
          <Route path="/pending/:courseId" element={<PendingStudents />} />
          <Route path="/faculty/course-setup/:courseId" element={<FacultyCourseSetup />} />
          <Route path="/faculty/action-plans" element={<FacultyActionPlans />} />
          <Route path="/faculty/manual-analytics" element={<ManualAnalytics role="FACULTY" />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/courses" element={<ManageCourses />} />
          <Route path="/admin/faculty" element={<ManageFaculty />} />
          <Route path="/admin/students" element={<ManageStudents />} />
          <Route path="/admin/course-setup" element={<CourseSetup />} />
          <Route path="/admin/analytics/:courseId" element={<CourseAnalytics />} />
          <Route path="/admin/action-plans" element={<AdminActionPlans />} />
          <Route path="/admin/upload-feedback" element={<UploadFeedback />} />
          <Route path="/admin/manual-analytics" element={<ManualAnalytics role="ADMIN" />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
