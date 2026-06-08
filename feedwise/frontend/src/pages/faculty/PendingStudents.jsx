import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, Users, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';

const PendingStudents = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingStudents();
  }, [courseId]);

  const fetchPendingStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/faculty/courses/${courseId}/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching pending students:', err);
      setError(err.response?.data?.error || 'Failed to load pending students');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!data || !data.pending) return;
    
    const headers = ['Enrollment ID', 'Student Name', 'Email Address', 'Status'];
    const rows = data.pending.map(s => 
      `"${s.enrollmentId || 'N/A'}","${s.name}","${s.email}","Pending"`
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Pending_Students_${data.course.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendReminder = async () => {
    if (!data || data.pending.length === 0) {
      alert("No pending students to remind.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/faculty/courses/${courseId}/reminders`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Actively dispatched reminder emails to ${data.pending.length} students.`);
    } catch (err) {
      console.error(err);
      alert('Failed to dispatch reminders.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="FACULTY" title="Evaluation Queue">
        <div className="flex justify-center p-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="FACULTY" title="Pending Students">
        <button onClick={() => navigate('/faculty')} className="flex items-center gap-2 text-textMuted hover:text-textBase transition-colors mb-6 text-sm font-medium">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="card p-12 text-center text-red-400 font-medium">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
          {error}
        </div>
      </DashboardLayout>
    );
  }

  const { course, totalEnrolled, submittedCount, pending } = data;

  return (
    <DashboardLayout role="FACULTY" title="Pending Students">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate('/faculty')} className="flex items-center gap-2 text-textMuted hover:text-textBase transition-colors mb-4 text-sm font-medium">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold bg-primary/20 text-primary px-3 py-1 rounded-full uppercase tracking-widest">
                {course.code}
              </span>
              <h2 className="text-3xl font-display font-bold text-textBase tracking-tight">{course.name}</h2>
            </div>
            <p className="text-textMuted font-medium text-lg">
              {course.branch} • Semester {course.semester} • Section {course.section}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-surface border border-surfaceHighlight px-5 py-3 rounded-2xl flex items-center gap-4">
              <div className="p-2.5 bg-blue-500/10 rounded-xl">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-textMuted uppercase tracking-wider font-semibold">Enrolled</p>
                <p className="text-2xl font-bold text-textBase leading-none mt-1">{totalEnrolled}</p>
              </div>
            </div>
            
            <div className="bg-surface border border-surfaceHighlight px-5 py-3 rounded-2xl flex items-center gap-4">
              <div className="p-2.5 bg-green-500/10 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-textMuted uppercase tracking-wider font-semibold">Submitted</p>
                <p className="text-2xl font-bold text-textBase leading-none mt-1 flex items-baseline">
                  {submittedCount}
                  {totalEnrolled > 0 && (
                    <span className="text-sm font-medium text-textMuted ml-2">
                      ({Math.round((submittedCount / totalEnrolled) * 100)}%)
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="bg-surface border border-primary/30 shadow-[0_0_20px_rgba(79,70,229,0.1)] px-5 py-3 rounded-2xl flex items-center gap-4">
              <div className="p-2.5 bg-primary/20 rounded-xl relative">
                <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full animate-ping"></span>
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-primary uppercase tracking-wider font-bold">Pending</p>
                <p className="text-2xl font-bold text-textBase leading-none mt-1">{pending.length}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleDownloadCSV}
                title="Download CSV"
                className="bg-surface hover:bg-surfaceHighlight border border-surfaceHighlight p-3 rounded-2xl transition-colors text-textMuted hover:text-textBase"
              >
                <AlertCircle className="w-6 h-6" />
              </button>
              
              <button 
                onClick={handleSendReminder}
                disabled={pending.length === 0}
                className="btn-primary py-3 px-5 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 whitespace-nowrap shadow-[0_0_20px_rgba(var(--color-primary),0.2)]"
              >
                Send Reminder
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card !p-0 overflow-hidden border border-surfaceHighlight shadow-xl">
        <div className="bg-surfaceHighlight/30 p-6 border-b border-surfaceHighlight">
          <h3 className="text-xl font-display font-semibold text-textBase">Pending Scholar Evaluations</h3>
          <p className="text-textMuted mt-1">These students have not completed the feedback form for this course.</p>
        </div>
        
        {pending.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-display font-bold text-textBase mb-2">Great news!</h3>
            <p className="text-textMuted text-lg max-w-md mx-auto">All enrolled students have successfully submitted their feedback for this course.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surfaceHighlight/50 text-textMuted border-b border-surfaceHighlight">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">#</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Enrollment ID</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Student Name</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Email Address</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surfaceHighlight/40">
                {pending.map((student, index) => (
                  <tr key={student.id} className="hover:bg-surfaceHighlight/20 transition-colors group">
                    <td className="px-6 py-4 font-medium text-textMuted group-hover:text-primary transition-colors">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-textMuted">
                      {student.enrollmentId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-textBase">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 text-textMuted">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PendingStudents;
