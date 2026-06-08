import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, BookOpen, Layers, Settings, LogOut, ClipboardList, BarChart3, PlusCircle, UploadCloud, PieChart } from 'lucide-react';

const Sidebar = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const menuItems = {
    ADMIN: [
      { path: '/admin', icon: Home, label: 'Overview' },
      { path: '/admin/courses', icon: BookOpen, label: 'Manage Courses' },
      { path: '/admin/faculty', icon: Users, label: 'Manage Faculty' },
      { path: '/admin/students', icon: Layers, label: 'Manage Students' },
      { path: '/admin/course-setup', icon: Settings, label: 'Course Setup' },
      { path: '/admin/upload-feedback', icon: UploadCloud, label: 'Upload Feedback' },
      { path: '/admin/manual-analytics', icon: PieChart, label: 'Manual Analytics' },
      { path: '/admin/action-plans', icon: ClipboardList, label: 'Action Plans' },
    ],
    FACULTY: [
      { path: '/faculty', icon: Home, label: 'My Courses' },
      { action: 'OPEN_ADD_COURSE', icon: PlusCircle, label: 'Add Course' },
      { path: '/faculty/historical', icon: BarChart3, label: 'View Analytics' },
      { path: '/faculty/manual-analytics', icon: PieChart, label: 'Manual Analytics' },
      { path: '/faculty/action-plans', icon: ClipboardList, label: 'Action Plans' },
    ],
    STUDENT: [
      { path: '/student', icon: Home, label: 'Student Dashboard' },
    ]
  };

  const links = menuItems[role] || [];

  return (
    <aside className="w-64 bg-surface border-r border-surfaceHighlight hidden md:flex flex-col flex-shrink-0 relative h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-surfaceHighlight">
        <h2 className="text-xl font-display font-semibold text-textBase tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" /> Revora
        </h2>
      </div>

      <nav className="flex-1 py-6 px-4 flex flex-col gap-2">
        {links.map((link) => {
          if (link.action) {
            return (
              <button
                key={link.action}
                onClick={() => {
                  if (location.pathname === '/faculty') {
                    window.dispatchEvent(new Event('openAddCourseModal'));
                  } else {
                    navigate('/faculty', { state: { openAddCourse: true } });
                  }
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium text-textMuted hover:bg-surfaceHighlight hover:text-textBase w-full text-left"
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </button>
            );
          }

          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
                ${isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20' 
                  : 'text-textMuted hover:bg-surfaceHighlight hover:text-textBase'
                }
              `}
            >
              <link.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-surfaceHighlight">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-textMuted hover:text-danger hover:bg-danger/10 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
