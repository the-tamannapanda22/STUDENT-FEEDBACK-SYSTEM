import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Plus, Trash2, Search, Edit2, X, ChevronLeft, Loader2, GitBranch, Mail, Lock, AlertCircle, Check } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { BRANCHES } from '../../constants/options';

const api = (token) => axios.create({
  baseURL: 'http://localhost:5000/api/admin',
  headers: { Authorization: `Bearer ${token}` }
});

// ── Edit Faculty Modal ──────────────────────────────────────────────────────
const EditFacultyModal = ({ faculty, onClose, onSave }) => {
  const [name, setName] = useState(faculty.name);
  const [email, setEmail] = useState(faculty.email);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(faculty.id, { name, email });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-surfaceHighlight rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surfaceHighlight">
          <h3 className="text-lg font-semibold text-textBase">Edit Faculty Profile</h3>
          <button onClick={onClose} className="text-textMuted hover:text-textBase transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1.5">Full Name</label>
            <input
              type="text" required value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-background border border-surfaceHighlight rounded-xl px-4 py-2.5 text-textBase text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1.5 mt-2">Email Address</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-background border border-surfaceHighlight rounded-xl px-4 py-2.5 text-textBase text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary py-2 px-4 text-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Add Faculty Modal ───────────────────────────────────────────────────────
const AddFacultyModal = ({ onClose, onAdded }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api(token).post('/faculty', form);
      onAdded(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create faculty account');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-surfaceHighlight rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surfaceHighlight">
          <h3 className="text-lg font-semibold text-textBase">Add Faculty Member</h3>
          <button onClick={onClose} className="text-textMuted hover:text-textBase transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 px-4 py-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
          {[
            { label: 'Full Name', name: 'name', type: 'text', icon: Users, placeholder: 'Dr. John Smith' },
            { label: 'Email Address', name: 'email', type: 'email', icon: Mail, placeholder: 'faculty@university.edu' },
            { label: 'Temporary Password', name: 'password', type: 'password', icon: Lock, placeholder: 'At least 6 characters', min: 6 },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1.5">{field.label}</label>
              <div className="relative">
                <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                <input
                  type={field.type} required
                  value={form[field.name]}
                  onChange={e => setForm({ ...form, [field.name]: e.target.value })}
                  placeholder={field.placeholder}
                  minLength={field.min}
                  className="w-full pl-10 bg-background border border-surfaceHighlight rounded-xl px-4 py-2.5 text-textBase text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary py-2 px-4 text-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main ────────────────────────────────────────────────────────────────────
const ManageFaculty = () => {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null); // faculty object or null

  const token = localStorage.getItem('token');

  useEffect(() => { fetchFaculty(); }, []);

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const res = await api(token).get('/users?role=FACULTY');
      setFaculty(res.data);
    } catch (err) {
      console.error('Error fetching faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this faculty member? Their courses will become unassigned.')) return;
    try {
      await api(token).delete(`/users/${id}`);
      setFaculty(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      alert('Failed to delete faculty: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSaveEdit = async (id, data) => {
    try {
      const res = await api(token).put(`/faculty/${id}`, data);
      setFaculty(prev => prev.map(f => f.id === id ? { ...f, ...res.data } : f));
      setEditModal(null);
    } catch (err) {
      alert('Failed to update faculty: ' + (err.response?.data?.error || err.message));
    }
  };

  const filtered = faculty.filter(m => {
    const q = search.toLowerCase();
    return !q || m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout role="ADMIN" title="Professorial Senate">
      {addModal && <AddFacultyModal onClose={() => setAddModal(false)} onAdded={f => setFaculty(prev => [f, ...prev])} />}
      {editModal && <EditFacultyModal faculty={editModal} onClose={() => setEditModal(null)} onSave={handleSaveEdit} />}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button onClick={() => navigate('/admin')} className="flex items-center gap-1.5 text-textMuted hover:text-textBase text-sm mb-2 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-2xl font-display font-semibold text-textBase">Professorial Senate</h2>
          <p className="text-textMuted text-sm mt-0.5">Add and manage faculty accounts</p>
        </div>
        <button onClick={() => setAddModal(true)} className="btn-primary py-2 px-5 text-sm shrink-0">
          <Plus className="w-4 h-4" /> Add Faculty
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 bg-surface border border-surfaceHighlight rounded-xl py-2.5 pr-10 text-textBase text-sm placeholder-textMuted focus:outline-none focus:border-primary transition-colors"
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textBase"><X className="w-4 h-4" /></button>}
        </div>
      </div>

      {/* List */}
      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-7 h-7 text-primary animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-textMuted">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No faculty members found.</p>
            <p className="text-sm mt-1">Click "Add Faculty" to get started.</p>
          </div>
        ) : (
          <ul className="divide-y divide-surfaceHighlight">
            {filtered.map(member => (
              <li key={member.id} className="flex items-center justify-between px-5 py-4 hover:bg-surfaceHighlight/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-textBase">{member.name}</p>
                    <p className="text-sm text-textMuted flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3 h-3" /> {member.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Faculty</span>
                  <button
                    onClick={() => setEditModal(member)}
                    className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Edit faculty"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Remove faculty"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageFaculty;
