import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Users, BarChart3, Loader2, TableProperties, Clock, Settings, TrendingUp } from 'lucide-react';
import { BRANCHES } from '../../constants/options';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';

const FacultyDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deadlineEditId, setDeadlineEditId] = useState(null);
  const [deadlineValue, setDeadlineValue] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', code: '', branch: '', semester: 1, section: '', deadline: '' });
  const [addingCourse, setAddingCourse] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();

    const handleOpenModal = () => setShowAddModal(true);
    window.addEventListener('openAddCourseModal', handleOpenModal);
    
    if (location.state?.openAddCourse) {
      setShowAddModal(true);
      navigate('/faculty', { replace: true, state: {} });
    }

    return () => {
      window.removeEventListener('openAddCourseModal', handleOpenModal);
    };
  }, [location.state, navigate]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/faculty/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data);
    } catch (err) {
      console.error('Error fetching faculty courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDeadline = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/faculty/courses/${courseId}/deadline`, 
        { deadline: deadlineValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourses(courses.map(c => c.id === courseId ? { ...c, deadline: deadlineValue } : c));
      setDeadlineEditId(null);
    } catch (err) {
      console.error('Failed to save deadline:', err);
      alert('Failed to save deadline');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setAddingCourse(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/faculty/courses', newCourse, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses([...courses, res.data]);
      setShowAddModal(false);
      setNewCourse({ name: '', code: '', branch: '', semester: 1, section: '', deadline: '' });
    } catch (err) {
      console.error('Failed to add course:', err);
      alert(err.response?.data?.error || 'Failed to add course');
    } finally {
      setAddingCourse(false);
    }
  };

  return (
    <DashboardLayout role="FACULTY" title="Lectern & Syllabi">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-textBase tracking-tight">Academic Courses</h2>
          <p className="text-textMuted mt-1">Monitor feedback analytics and overall performance.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary py-2 px-4 shadow-lg text-sm flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Course
          </button>
          <Link 
            to="/faculty/historical"
            className="btn-secondary py-2 px-4 shadow-lg text-sm flex items-center justify-center gap-2 hover:bg-surfaceHighlight whitespace-nowrap"
          >
            <TrendingUp className="w-4 h-4" /> Historical Tracking
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="card p-12 text-center text-textMuted flex flex-col items-center">
          <BookOpen className="w-12 h-12 mb-3 text-surfaceHighlight" />
          <p>No courses assigned to you yet. Contact the administrator.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course) => {
            const totalResponses = course.totalResponses ?? 0;

            return (
              <div key={course.id} className="card group hover:border-primary/30 transition-all duration-300 relative overflow-hidden flex flex-col pt-8">

                {/* Visual decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors" />

                <div className="absolute top-4 left-6 flex items-center gap-2">
                  <span className="text-xs font-bold bg-surfaceHighlight/50 text-textBase px-2 py-0.5 rounded uppercase tracking-wider">
                    {course.code}
                  </span>
                  <span className="text-xs font-medium text-textMuted">
                    {course.branch} • Sem {course.semester}
                  </span>
                </div>

                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  {deadlineEditId === course.id ? (
                    <div className="flex items-center gap-1 bg-surface border border-surfaceHighlight rounded-lg px-2 py-1 shadow-lg">
                      <input 
                        type="date" 
                        value={deadlineValue}
                        onChange={(e) => setDeadlineValue(e.target.value)}
                        onClick={e => {
                          try {
                            e.target.showPicker();
                          } catch (err) {}
                        }}
                        className="bg-transparent text-xs text-textBase outline-none cursor-pointer"
                      />
                      <button onClick={() => handleSaveDeadline(course.id)} className="text-emerald-500 hover:text-emerald-400 p-1">✓</button>
                      <button onClick={() => setDeadlineEditId(null)} className="text-red-500 hover:text-red-400 p-1">✕</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {course.deadline && <span className="text-xs text-textMuted font-medium mr-1" title="Submission Deadline">Due: {new Date(course.deadline).toLocaleDateString()}</span>}
                      <button 
                        onClick={() => {
                          setDeadlineEditId(course.id);
                          setDeadlineValue(course.deadline ? course.deadline.substring(0, 10) : '');
                        }}
                        className="p-1.5 text-textMuted hover:text-textBase hover:bg-surfaceHighlight rounded-lg transition-all border border-transparent hover:border-surfaceHighlight bg-background/50 backdrop-blur-sm"
                        title="Set Deadline"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <Link 
                    to={`/faculty/course-setup/${course.id}`}
                    className="p-1.5 text-textMuted hover:text-primary hover:bg-primary/10 rounded-lg transition-all flex items-center justify-center bg-background/50 backdrop-blur-sm border border-surfaceHighlight"
                    title="Configure Questionnaire"
                  >
                    <Settings className="w-4 h-4" />
                  </Link>
                </div>

                <div className="mb-6 z-10 w-[85%]">
                  <h3 className="text-2xl font-display font-semibold text-textBase group-hover:text-primary transition-colors">{course.name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 z-10">
                  <div className="bg-background rounded-xl p-4 border border-surfaceHighlight">
                    <div className="flex items-center gap-2 text-textMuted mb-2">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">Responses</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold text-textBase leading-none">{totalResponses}</span>
                      <span className="text-sm text-textMuted leading-none mb-0.5">submitted</span>
                    </div>
                    <div className="w-full bg-surfaceHighlight h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${totalResponses > 0 ? 'bg-primary' : 'bg-surfaceHighlight'}`}
                        style={{ width: totalResponses > 0 ? '100%' : '0%' }}
                      />
                    </div>
                  </div>

                  <div className="bg-background rounded-xl p-4 border border-surfaceHighlight flex flex-col justify-center items-center text-center">
                    <span className="text-sm font-medium text-textMuted mb-1">Sec {course.section}</span>
                    <span className="text-3xl font-display font-bold text-accent">{course.branch}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-surfaceHighlight flex flex-col sm:flex-row items-stretch gap-2 z-10 font-bold tracking-tight">
                  <Link
                    to={`/analytics/${course.id}`}
                    className="btn-primary py-2 px-3 text-xs flex-1 flex items-center justify-center gap-2 transition-transform active:scale-95 whitespace-nowrap"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </Link>
                  <Link
                    to={`/pending/${course.id}`}
                    className="btn-secondary py-2 px-3 text-xs flex-1 flex items-center justify-center gap-2 transition-transform active:scale-95 whitespace-nowrap"
                  >
                    <Clock className="w-4 h-4" />
                    Pending
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-surfaceHighlight rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-surfaceHighlight flex justify-between items-center">
              <h3 className="text-xl font-display font-semibold text-textBase">Add New Course</h3>
            </div>
            <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1.5">Course Code</label>
                <input required className="input-field" placeholder="e.g. CS301" value={newCourse.code} onChange={e => setNewCourse({...newCourse, code: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1.5">Course Name</label>
                <input required className="input-field" placeholder="e.g. Data Structures" value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1.5">Branch</label>
                  <select required className="input-field" value={newCourse.branch} onChange={e => setNewCourse({...newCourse, branch: e.target.value})}>
                    <option value="">Select branch...</option>
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1.5">Semester</label>
                  <input required type="number" className="input-field" placeholder="6" value={newCourse.semester} onChange={e => setNewCourse({...newCourse, semester: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1.5">Section</label>
                  <input required className="input-field" placeholder="A" value={newCourse.section} onChange={e => setNewCourse({...newCourse, section: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-surfaceHighlight mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={addingCourse} className="btn-primary">{addingCourse ? 'Adding...' : 'Add Course'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default FacultyDashboard;

// Trigger HMR
