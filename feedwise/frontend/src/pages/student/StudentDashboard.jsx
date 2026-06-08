import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, ArrowRight, Clock, User as UserIcon, Loader2 } from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfileAndCourses();
  }, []);

  const fetchProfileAndCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const profileStr = localStorage.getItem('user'); // Wait, let's fetch from localStorage if available, or just fetch profile
      
      const profileRes = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(profileRes.data);

      const coursesRes = await axios.get('http://localhost:5000/api/student/courses', {
         headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(coursesRes.data);
    } catch (err) {
      console.error('Error fetching student courses:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="STUDENT" title="Scholastic Portal">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-textBase tracking-tight">Active Curriculum</h2>
          <p className="text-textMuted mt-1">Submit feedback for your automatically assigned courses.</p>
        </div>
        {profile && (
          <div className="bg-surfaceHighlight/50 border border-surfaceHighlight px-4 py-2 rounded-xl inline-flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">ID: {profile.enrollmentId || 'N/A'} • B.Tech {profile.branch || 'N/A'} • Semester {profile.semester || 'N/A'} • Section {profile.section || 'N/A'}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
           <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          {courses.length === 0 ? (
            <div className="card p-12 text-center text-textMuted flex flex-col items-center">
              <BookOpen className="w-12 h-12 mb-3 text-surfaceHighlight" />
              <p>No courses assigned for your current academic profile.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="card group hover:border-primary/30 transition-colors relative overflow-hidden flex flex-col shadow-lg shadow-black/20">
                  <div className="absolute top-0 right-0 p-4">
                    {course.hasSubmittedFeedback ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        {course.deadline && (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${new Date(course.deadline) < new Date() ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                            {new Date(course.deadline) < new Date() ? 'Expired' : `${Math.ceil((new Date(course.deadline) - new Date()) / (1000 * 60 * 60 * 24))} Days Left`}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20">
                          <Clock className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mb-6 mt-2 pr-24">
                    <span className="text-xs font-bold text-primary mb-2 block tracking-wider uppercase">{course.code}</span>
                    <h3 className="text-xl font-display font-semibold text-textBase group-hover:text-primary transition-colors">{course.name}</h3>
                  </div>

                  <div className="mt-auto pt-5 border-t border-surfaceHighlight/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-textMuted">
                      <UserIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{course.faculty ? course.faculty.name : 'Unassigned'}</span>
                    </div>
                    
                    {!course.hasSubmittedFeedback && (
                      course.deadline && new Date(course.deadline) < new Date() ? (
                        <button disabled className="btn-secondary py-2 px-4 text-xs flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                          Feedback Closed
                        </button>
                      ) : (
                        <Link 
                          to={`/feedback-form/${course.id}`}
                          className="btn-primary py-2 px-4 text-xs flex items-center justify-center gap-2 group/btn"
                        >
                          Start Feedback
                          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;
