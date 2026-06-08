import { useState, useEffect } from 'react';
import { Users, Library, BarChart, Settings, ArrowUpRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';

const QUICK_LINKS = [
  { title: 'Manage Courses', desc: 'Create courses and assign faculty map', path: '/admin/courses', icon: Library },
  { title: 'Manage Faculty', desc: 'Register or remove faculty members', path: '/admin/faculty', icon: Users },
  { title: 'Manage Students', desc: 'View student directory and metadata', path: '/admin/students', icon: Users },
  { title: 'Course Setup', desc: 'Configure feedback categories and questions', path: '/admin/course-setup', icon: Settings },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }
        
        const res = await axios.get('http://localhost:5000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setStats([
          { label: 'Total Students', value: res.data.totalStudents, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Active Faculty', value: res.data.activeFaculty, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Total Courses', value: res.data.totalCourses, icon: Library, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Feedback Submitted', value: res.data.feedbackSubmitted, icon: BarChart, color: 'text-sky-500', bg: 'bg-sky-500/10' },
        ]);
      } catch (error) {
        console.error('Failed to fetch stats', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [navigate]);

  return (
    <DashboardLayout role="ADMIN" title="Section Head Overview">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-semibold text-textBase tracking-tight">System Overview</h2>
        <p className="text-textMuted mt-1">Global statistics and management portal.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {loading ? (
           <div className="col-span-full flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
           </div>
        ) : (
          stats?.map((stat, i) => (
            <div key={i} className="card flex items-center gap-5 p-5 hover:border-surfaceHighlight transition-colors">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg}`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-textMuted uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-2xl font-display font-bold text-textBase leading-none">
                  {stat.value.toLocaleString()}
                </h3>
              </div>
            </div>
          ))
        )}
      </div>

      <h3 className="text-lg font-semibold text-textBase mb-4">Quick Management Links</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {QUICK_LINKS.map((link, i) => (
          <Link 
            to={link.path} 
            key={i} 
            className="card group hover:border-primary/50 transition-colors flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-surfaceHighlight flex items-center justify-center shrink-0 mt-1 group-hover:bg-primary/20 transition-colors">
              <link.icon className="w-6 h-6 text-textMuted group-hover:text-primary transition-colors" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-lg font-medium text-textBase group-hover:text-primary transition-colors">{link.title}</h4>
                <ArrowUpRight className="w-5 h-5 text-textMuted group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm text-textMuted leading-relaxed">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
