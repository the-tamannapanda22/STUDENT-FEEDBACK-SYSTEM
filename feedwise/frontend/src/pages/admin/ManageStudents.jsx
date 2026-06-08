import { useState, useEffect, useCallback, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users, Trash2, Search, Edit2, X, ChevronLeft, Loader2, GitBranch,
  BookOpen, CheckCircle, Clock, AlertCircle, TrendingUp, RefreshCw,
  AlertTriangle, Shield, ToggleLeft, ToggleRight, Download, Mail, ChevronDown, ChevronUp
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { BRANCHES, SEMESTERS } from '../../constants/options';

const api = (token) => axios.create({
  baseURL: 'http://localhost:5000/api/admin',
  headers: { Authorization: `Bearer ${token}` }
});

// ── Warning Modal ──────────────────────────────────────────────────────────
const WarningModal = ({ isOpen, onClose, onConfirm, title, children, confirmLabel = 'Confirm', color = 'red', isLoading = false }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isOpen) return;
    setCountdown(5);
    const t = setInterval(() => setCountdown(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, [isOpen]);

  if (!isOpen) return null;

  const btnClass = color === 'red'
    ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-600/50'
    : 'bg-amber-600 hover:bg-amber-700 disabled:bg-amber-600/50';
  const headerClass = color === 'red' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-surfaceHighlight rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className={`flex items-start gap-3 px-5 py-4 ${headerClass}`}>
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <h3 className="text-base font-bold text-textBase">{title}</h3>
          <button onClick={onClose} className="ml-auto text-textMuted hover:text-textBase"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-5 py-4 text-sm text-textBase space-y-3">{children}</div>
        <div className="px-5 py-4 flex justify-end gap-3 border-t border-surfaceHighlight bg-background/50">
          <button onClick={onClose} disabled={isLoading} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={isLoading || countdown > 0}
            className={`flex items-center gap-2 py-2 px-4 text-sm text-textBase rounded-xl font-medium transition-colors ${btnClass}`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {countdown > 0 ? `${confirmLabel} (${countdown}s)` : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Edit Student Modal ──────────────────────────────────────────────────────
const EditStudentModal = ({ student, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: student.name || '',
    enrollmentId: student.enrollmentId || '',
    branch: student.branch || '',
    semester: student.semester || 1,
    section: student.section || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(student.id, form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-surfaceHighlight rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surfaceHighlight">
          <h3 className="text-lg font-semibold text-textBase">Edit Student Profile</h3>
          <button onClick={onClose} className="text-textMuted hover:text-textBase"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1.5">Full Name</label>
            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-background border border-surfaceHighlight rounded-xl px-4 py-2.5 text-textBase text-sm focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1.5">Enrollment ID</label>
            <input type="text" required value={form.enrollmentId} onChange={e => setForm({ ...form, enrollmentId: e.target.value })}
              className="w-full bg-background border border-surfaceHighlight rounded-xl px-4 py-2.5 text-textBase text-sm focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1.5">Branch</label>
              <select value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })}
                className="w-full bg-background border border-surfaceHighlight rounded-xl px-3 py-2.5 text-textBase text-sm focus:outline-none focus:border-primary transition-colors">
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1.5">Semester</label>
              <select value={form.semester} onChange={e => setForm({ ...form, semester: parseInt(e.target.value) })}
                className="w-full bg-background border border-surfaceHighlight rounded-xl px-3 py-2.5 text-textBase text-sm focus:outline-none focus:border-primary transition-colors">
                {SEMESTERS.map(s => <option key={s} value={s}>Sem {s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1.5">Section</label>
            <input type="text" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}
              className="w-full bg-background border border-surfaceHighlight rounded-xl px-4 py-2.5 text-textBase text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="e.g. A" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary py-2 px-4 text-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Feedback Status Badge ──────────────────────────────────────────────────
const FeedbackBadge = ({ submitted, total }) => {
  if (total === 0) return <span className="text-xs text-textMuted">No courses</span>;
  if (submitted === total) return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      <CheckCircle className="w-3 h-3" /> Submitted ({submitted}/{total})
    </span>
  );
  if (submitted > 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
      <Clock className="w-3 h-3" /> Pending ({submitted}/{total})
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
      <AlertCircle className="w-3 h-3" /> Not Started ({submitted}/{total})
    </span>
  );
};

// ── Main ────────────────────────────────────────────────────────────────────
const ManageStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterFeedback, setFilterFeedback] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({});
  const [studentPending, setStudentPending] = useState({});
  const PER_PAGE = 10;

  const handleGlobalNudge = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/admin/students/reminders', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Global reminders dispatched to all pending students via server logic.');
    } catch (err) {
      alert('Failed to dispatch reminders.');
      console.error(err);
    }
  };

  const handleExpand = async (studentId) => {
    setExpandedRows(prev => ({ ...prev, [studentId]: !prev[studentId] }));
    
    if (!studentPending[studentId]) {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/admin/students/${studentId}/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudentPending(prev => ({ ...prev, [studentId]: res.data.pending }));
      } catch (err) {
        console.error('Failed to fetch pending subjects', err);
      }
    }
  };

  // Modal states
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [promoteModal, setPromoteModal] = useState(false);
  const [semToPromote, setSemToPromote] = useState('');
  const [isPromoting, setIsPromoting] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [deleteSemModal, setDeleteSemModal] = useState(false);
  const [semToDelete, setSemToDelete] = useState('');
  const [isDeletingSem, setIsDeletingSem] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const token = localStorage.getItem('token');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, feedbackRes, coursesRes] = await Promise.all([
        api(token).get('/users?role=STUDENT'),
        axios.get('http://localhost:5000/api/admin/feedback-summary', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
        api(token).get('/courses')
      ]);

      const studentList = studentsRes.data;
      setStudents(studentList);

      // Build course count per branch+semester
      const courseCountMap = {};
      coursesRes.data.forEach(c => {
        const key = `${c.branch}_${c.semester}`;
        courseCountMap[key] = (courseCountMap[key] || 0) + 1;
      });

      // Build submission count per student from feedback summary
      // We'll derive this from a separate call
      const fbRes = await api(token).get('/feedback-count').catch(() => ({ data: {} }));
      const submissionCountMap = fbRes.data || {};

      const map = {};
      studentList.forEach(s => {
        const key = `${s.branch}_${s.semester}`;
        map[s.id] = {
          submitted: submissionCountMap[s.id] || 0,
          total: courseCountMap[key] || 0
        };
      });
      setFeedbackMap(map);
    } catch (err) {
      console.error('Fetch students error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setCurrentPage(1); }, [search, filterBranch, filterSemester, filterFeedback]);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
    const matchBranch = !filterBranch || s.branch === filterBranch;
    const matchSem = !filterSemester || String(s.semester) === filterSemester;

    const stats = feedbackMap[s.id] || { submitted: 0, total: 0 };
    let matchFeedback = true;
    if (filterFeedback === 'completed') matchFeedback = stats.total > 0 && stats.submitted === stats.total;
    else if (filterFeedback === 'pending') matchFeedback = stats.submitted > 0 && stats.submitted < stats.total;
    else if (filterFeedback === 'not_started') matchFeedback = stats.total > 0 && stats.submitted === 0;

    return matchSearch && matchBranch && matchSem && matchFeedback;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // Actions
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api(token).delete(`/users/${deleteModal.id}`);
      setStudents(prev => prev.filter(s => s.id !== deleteModal.id));
      setDeleteModal({ open: false, id: null });
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateStudent = async (id, data) => {
    try {
      const res = await api(token).put(`/students/${id}`, data);
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...res.data } : s));
      setEditModal(null);
    } catch (err) {
      alert('Failed to update: ' + (err.response?.data?.error || err.message));
    }
  };

  const handlePromote = async () => {
    if (!semToPromote) return;
    setIsPromoting(true);
    try {
      await api(token).post('/students/promote', { semester: semToPromote });
      setPromoteModal(false);
      setSemToPromote('');
      await fetchData();
    } catch (err) {
      alert('Failed to promote: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsPromoting(false);
    }
  };

  const handleResetFeedback = async () => {
    setIsResetting(true);
    try {
      await api(token).post('/feedback/reset');
      setResetModal(false);
      await fetchData();
    } catch (err) {
      alert('Failed to reset feedback: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteBySemester = async () => {
    if (!semToDelete) return;
    setIsDeletingSem(true);
    try {
      await api(token).post('/students/delete-by-semester', { semester: semToDelete });
      setDeleteSemModal(false);
      setSemToDelete('');
      await fetchData();
    } catch (err) {
      alert('Failed to delete students: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsDeletingSem(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!filtered || filtered.length === 0) return;
    
    const headers = ['Name', 'Enrollment ID', 'Email', 'Branch', 'Semester', 'Section', 'Feedback Status'];
    const rows = filtered.map(s => {
      const stats = feedbackMap[s.id] || { submitted: 0, total: 0 };
      let status = 'Not Started';
      if (stats.total > 0 && stats.submitted === stats.total) status = 'Completed';
      else if (stats.submitted > 0) status = 'Pending';
      else if (stats.total === 0) status = 'No Courses';

      return `"${s.name}","${s.enrollmentId || ''}","${s.email}","${s.branch || ''}","${s.semester || ''}","${s.section || ''}","${status}"`;
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Students_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const studentsInPromoteSem = semToPromote ? students.filter(s => String(s.semester) === semToPromote).length : 0;
  const studentsInDeleteSem = semToDelete ? students.filter(s => String(s.semester) === semToDelete).length : 0;

  return (
    <DashboardLayout role="ADMIN" title="Scholarly Roster">
      {/* ── Modals ── */}
      {editModal && <EditStudentModal student={editModal} onClose={() => setEditModal(null)} onSave={handleUpdateStudent} />}

      <WarningModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete} title="Delete Student Account" confirmLabel="Delete Student" isLoading={isDeleting}>
        <p>You are about to <strong>permanently delete</strong> this student account and all their feedback history.</p>
        <p className="text-red-400 font-medium">This action cannot be undone.</p>
      </WarningModal>

      <WarningModal isOpen={promoteModal} onClose={() => { if (!isPromoting) { setPromoteModal(false); setSemToPromote(''); } }}
        onConfirm={handlePromote} title="Promote Students to Next Semester"
        confirmLabel={semToPromote ? `Promote Sem ${semToPromote} → Sem ${parseInt(semToPromote) + 1} (${studentsInPromoteSem} students)` : 'Select a semester first'}
        color="amber" isLoading={isPromoting}>
        <div className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 px-4 py-3 rounded-xl mb-2">
          <p className="font-semibold flex items-center gap-1.5 mb-1"><AlertTriangle className="w-3.5 h-3.5" /> Perform only at end of semester</p>
          <p>This increments the semester number by 1 for all students in the selected semester.</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-textMuted mb-1.5">Select Semester to Promote</label>
          <select value={semToPromote} onChange={e => setSemToPromote(e.target.value)}
            className="w-full bg-background border border-surfaceHighlight rounded-xl px-3 py-2 text-textBase text-sm focus:outline-none focus:border-primary">
            <option value="">— Choose a semester —</option>
            {SEMESTERS.slice(0, 7).map(s => {
              const count = students.filter(st => String(st.semester) === String(s)).length;
              return <option key={s} value={s}>Semester {s} ({count} student{count !== 1 ? 's' : ''})</option>;
            })}
          </select>
        </div>
        {semToPromote && studentsInPromoteSem === 0 && <p className="text-amber-400 text-xs">No students in semester {semToPromote}.</p>}
      </WarningModal>

      <WarningModal isOpen={resetModal} onClose={() => !isResetting && setResetModal(false)}
        onConfirm={handleResetFeedback} title="Reset All Feedback Data"
        confirmLabel="Yes, Reset All Feedback" isLoading={isResetting}>
        <div className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 px-4 py-3 rounded-xl mb-2">
          <p className="font-semibold mb-1">⚠ Recommended only at end of a semester</p>
          <p>All student submissions, ratings, and answers will be permanently deleted from every course.</p>
        </div>
        <p>Student accounts and course questions will <em>not</em> be affected.</p>
        <p className="text-red-400 font-medium">This cannot be undone. Download reports first.</p>
      </WarningModal>

      <WarningModal isOpen={deleteSemModal}
        onClose={() => { if (!isDeletingSem) { setDeleteSemModal(false); setSemToDelete(''); } }}
        onConfirm={handleDeleteBySemester} title="Delete Students by Semester"
        confirmLabel={semToDelete ? `Delete Sem ${semToDelete} Students (${studentsInDeleteSem})` : 'Select a semester first'}
        isLoading={isDeletingSem}>
        <div className="text-xs bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl mb-2">
          <p className="font-semibold mb-1">⚠ Typically done after a semester ends</p>
          <p>Deletes student accounts, profiles, and all associated feedback history permanently.</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-textMuted mb-1.5">Select Semester to Delete</label>
          <select value={semToDelete} onChange={e => setSemToDelete(e.target.value)}
            className="w-full bg-background border border-surfaceHighlight rounded-xl px-3 py-2 text-textBase text-sm focus:outline-none focus:border-red-500">
            <option value="">— Choose a semester —</option>
            {SEMESTERS.map(s => {
              const count = students.filter(st => String(st.semester) === String(s)).length;
              return <option key={s} value={s}>Semester {s} ({count} student{count !== 1 ? 's' : ''})</option>;
            })}
          </select>
        </div>
        {semToDelete && studentsInDeleteSem > 0 && (
          <p className="text-red-400 font-medium text-sm">{studentsInDeleteSem} student{studentsInDeleteSem !== 1 ? 's' : ''} will be permanently deleted.</p>
        )}
      </WarningModal>

      {/* ── Header ── */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button onClick={() => navigate('/admin')} className="flex items-center gap-1.5 text-textMuted hover:text-textBase text-sm mb-2 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-2xl font-display font-semibold text-textBase">Scholarly Roster</h2>
          <p className="text-textMuted text-sm mt-0.5">View, search, and manage registered student accounts</p>
        </div>
        {/* Stats card */}
        <div className="flex items-center gap-3 bg-surface border border-surfaceHighlight px-4 py-2.5 rounded-xl text-sm shrink-0">
          <Shield className="w-4 h-4 text-emerald-400" />
          <div>
            <p className="font-semibold text-textBase">{students.length} Students</p>
            <p className="text-xs text-emerald-400">Registered</p>
          </div>
        </div>
      </div>

      {/* ── Bulk Action Buttons ── */}
      <div className="flex flex-wrap gap-3 mb-5">
        <button onClick={() => setPromoteModal(true)} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 disabled:opacity-50 transition-colors">
          <TrendingUp className="w-4 h-4" /> Promote Semesters
        </button>
        <button onClick={() => setResetModal(true)} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 disabled:opacity-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Reset All Feedback
        </button>
        <button onClick={() => setDeleteSemModal(true)} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50 transition-colors">
          <Trash2 className="w-4 h-4" /> Delete Students by Semester
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col gap-3 mb-4">
        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-textMuted uppercase mr-2">Quick Filters:</span>
          <button onClick={() => setFilterFeedback('all')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filterFeedback === 'all' ? 'bg-primary text-white shadow-md' : 'bg-surfaceHighlight text-textMuted hover:text-textBase hover:bg-surfaceHighlight/80'}`}>All Students</button>
          <button onClick={() => setFilterFeedback('pending')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filterFeedback === 'pending' ? 'bg-amber-500 text-white shadow-md' : 'bg-surfaceHighlight text-textMuted hover:text-textBase hover:bg-surfaceHighlight/80'}`}>Incomplete Forms</button>
          <button onClick={() => setFilterFeedback('completed')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filterFeedback === 'completed' ? 'bg-emerald-500 text-white shadow-md' : 'bg-surfaceHighlight text-textMuted hover:text-textBase hover:bg-surfaceHighlight/80'}`}>Completed All</button>
          <button onClick={() => setFilterFeedback('not_started')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filterFeedback === 'not_started' ? 'bg-orange-500 text-white shadow-md' : 'bg-surfaceHighlight text-textMuted hover:text-textBase hover:bg-surfaceHighlight/80'}`}>Not Started</button>
          
          <button onClick={handleDownloadCSV} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20">
            <Download className="w-3.5 h-3.5" /> Export Filtered to CSV
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 bg-surface border border-surfaceHighlight rounded-xl py-2.5 pr-10 text-textBase text-sm placeholder-textMuted focus:outline-none focus:border-primary transition-colors" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textBase"><X className="w-4 h-4" /></button>}
          </div>
          <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)}
            className="bg-surface border border-surfaceHighlight rounded-xl px-3 py-2.5 text-textBase text-sm focus:outline-none focus:border-primary sm:w-48">
            <option value="">All Branches</option>
            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)}
            className="bg-surface border border-surfaceHighlight rounded-xl px-3 py-2.5 text-textBase text-sm focus:outline-none focus:border-primary sm:w-36">
            <option value="">All Sems</option>
            {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-7 h-7 text-primary animate-spin" /></div>
        ) : paginated.length === 0 ? (
          <div className="p-12 text-center text-textMuted">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No students found matching your filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-surfaceHighlight/50 text-textMuted border-b border-surfaceHighlight">
                  <tr>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Student</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Branch</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-center">Sem</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Feedback</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surfaceHighlight">
                  {paginated.map((student) => {
                    const stats = feedbackMap[student.id] || { submitted: 0, total: 0 };
                    return (
                      <Fragment key={student.id}>
                        <tr className="hover:bg-surfaceHighlight/20 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleExpand(student.id)} className="p-1 text-textMuted hover:text-textBase transition-colors focus:outline-none">
                              {expandedRows[student.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            <div className="w-9 h-9 rounded-full bg-surfaceHighlight flex items-center justify-center text-sm font-bold text-textBase shrink-0">
                              {student.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-textBase">
                                {student.name} {student.enrollmentId && <span className="text-textMuted font-normal">({student.enrollmentId})</span>}
                              </p>
                              <p className="text-xs text-textMuted">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-textBase">{student.branch || '—'}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="font-medium text-textBase">{student.semester || '—'}</span>
                        </td>
                        <td className="px-5 py-4">
                          <FeedbackBadge submitted={stats.submitted} total={stats.total} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setEditModal(student)}
                              className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit student">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteModal({ open: true, id: student.id })}
                              className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete student">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRows[student.id] && (
                        <tr key={`${student.id}-expanded`}>
                          <td colSpan="5" className="px-5 py-3 bg-surfaceHighlight/30 border-b border-surfaceHighlight">
                            <div className="text-sm pl-10">
                              <span className="font-medium text-textMuted">Pending Subjects: </span>
                              {studentPending[student.id] ? (
                                studentPending[student.id].length > 0 ? (
                                  <span className="text-orange-400 font-medium ml-1">
                                    {studentPending[student.id].map(c => c.code).join(', ')}
                                  </span>
                                ) : (
                                  <span className="text-emerald-500 font-medium ml-1">None. All forms completed!</span>
                                )
                              ) : (
                                <Loader2 className="w-3 h-3 animate-spin inline-block ml-2 text-textMuted" />
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                      </Fragment>
                    );
                })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-surfaceHighlight bg-background/30">
                <p className="text-xs text-textMuted">
                  Showing {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === currentPage ? 'bg-primary text-textBase' : 'text-textMuted hover:bg-surfaceHighlight hover:text-textBase'}`}>
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="px-5 py-4 border-t border-surfaceHighlight bg-surfaceHighlight/10 flex justify-end">
              <button 
                onClick={handleGlobalNudge} 
                disabled={loading}
                className="btn-primary py-2.5 px-6 shadow-[0_0_20px_rgba(var(--color-primary),0.3)] transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Mail className="w-5 h-5" /> Nudge All Pending Students
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageStudents;
