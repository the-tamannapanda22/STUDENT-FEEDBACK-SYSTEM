import { useState, useEffect } from 'react';
import { Pencil, Save, X, Plus, BookOpen, Trash2, Users, Loader2, BarChart3, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { BRANCHES } from '../../constants/options';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', code: '', branch: '', semester: 1, section: '', facultyId: '', deadline: '' });

  const [filterBranch, setFilterBranch] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  const filteredCourses = courses.filter(c => {
    if (filterBranch && c.branch !== filterBranch) return false;
    if (filterSemester && c.semester !== parseInt(filterSemester)) return false;
    return true;
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [coursesRes, facultyRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/courses', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/admin/users?role=FACULTY', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCourses(coursesRes.data);
      setFacultyList(facultyRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingId(course.id);
    setEditForm({ ...course, facultyId: course.facultyId || '', deadline: course.deadline ? course.deadline.substring(0, 10) : '' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/admin/courses/${editingId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(courses.map(c => c.id === editingId ? { ...res.data, faculty: facultyList.find(f => f.id == res.data.facultyId) } : c));
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update course', err);
      alert('Failed to update course');
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/admin/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(courses.filter(c => c.id !== id));
      } catch (err) {
        console.error('Failed to delete course:', err);
        alert('Failed to delete course');
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/admin/courses', newCourse, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses([...courses, { ...res.data, faculty: facultyList.find(f => f.id == res.data.facultyId) }]);
      setShowAddModal(false);
      setNewCourse({ name: '', code: '', branch: '', semester: 1, section: '', facultyId: '', deadline: '' });
    } catch (err) {
      console.error('Failed to add course:', err);
      alert(err.response?.data?.error || 'Failed to add course');
    }
  };

  return (
    <DashboardLayout role="ADMIN" title="Curriculum Registry">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-textBase tracking-tight">Academic Curriculum</h2>
          <p className="text-textMuted mt-1">Manage course offerings and assign faculty.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
            <select
              className="input-field pl-9 py-2 text-sm max-w-[150px]"
              value={filterBranch}
              onChange={e => setFilterBranch(e.target.value)}
            >
              <option value="">All Branches</option>
              {BRANCHES.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <select
              className="input-field py-2 text-sm max-w-[150px]"
              value={filterSemester}
              onChange={e => setFilterSemester(e.target.value)}
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 py-2">
            <Plus className="w-5 h-5" />
            Add Course
          </button>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-12 text-center flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
             </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-surfaceHighlight/50 text-textMuted border-b border-surfaceHighlight">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Course Info</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Academic Metadata</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Assigned Faculty</th>
                  <th className="px-6 py-4 font-semibold text-right uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surfaceHighlight">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-surfaceHighlight/20 transition-colors">
                    
                    {/* Course Info */}
                    <td className="px-6 py-4">
                      {editingId === course.id ? (
                        <div className="space-y-2">
                          <input className="input-field py-1.5 px-3 text-sm h-auto" value={editForm.code} onChange={e => setEditForm({...editForm, code: e.target.value})} placeholder="Code" />
                          <input className="input-field py-1.5 px-3 text-sm h-auto" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Name" />
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold text-primary mb-1">{course.code}</div>
                          <div className="text-textBase font-medium">{course.name}</div>
                        </div>
                      )}
                    </td>

                    {/* Academic Metadata */}
                    <td className="px-6 py-4">
                      {editingId === course.id ? (
                        <div className="flex items-center gap-2">
                          <select className="input-field py-1.5 px-3 text-sm h-auto w-full" value={editForm.branch} onChange={e => setEditForm({...editForm, branch: e.target.value})}>
                            <option value="">Select branch</option>
                            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                          <input className="input-field py-1.5 px-3 text-sm h-auto w-16" type="number" value={editForm.semester} onChange={e => setEditForm({...editForm, semester: parseInt(e.target.value)})} placeholder="Sem" />
                          <input className="input-field py-1.5 px-3 text-sm h-auto w-16" value={editForm.section} onChange={e => setEditForm({...editForm, section: e.target.value})} placeholder="Sec" />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex px-2 py-1 rounded bg-surfaceHighlight/50 text-textBase text-xs font-medium">{course.branch}</span>
                            <span className="inline-flex px-2 py-1 rounded bg-surfaceHighlight/50 text-textBase text-xs font-medium">Sem {course.semester}</span>
                            <span className="inline-flex px-2 py-1 rounded bg-surfaceHighlight/50 text-textBase text-xs font-medium">Sec {course.section}</span>
                          </div>
                          {course.deadline && (
                            <span className="text-xs text-textMuted font-medium px-2">
                              Deadline: <span className="text-textBase font-bold">{new Date(course.deadline).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Assigned Faculty */}
                    <td className="px-6 py-4">
                      {editingId === course.id ? (
                        <div className="flex flex-col gap-2">
                          <select 
                            className="input-field py-1.5 px-3 text-sm h-auto" 
                            value={editForm.facultyId || ''} 
                            onChange={e => setEditForm({...editForm, facultyId: e.target.value})}
                          >
                            <option value="">Unassigned</option>
                            {facultyList.map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                          <div className="flex items-center gap-1 bg-surface border border-surfaceHighlight rounded-lg px-3 py-1 shadow-sm mt-2">
                            <input 
                              type="date"
                              className="bg-transparent text-sm text-textBase outline-none w-full cursor-pointer" 
                              value={editForm.deadline || ''} 
                              onChange={e => setEditForm({...editForm, deadline: e.target.value})}
                              onClick={e => {
                                try {
                                  e.target.showPicker();
                                } catch (err) {}
                              }}
                              title="Feedback Deadline"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-textMuted">
                          <Users className="w-4 h-4" />
                          <span>{course.faculty ? course.faculty.name : 'Unassigned'}</span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      {editingId === course.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={handleSave} className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-colors">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={handleCancel} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/analytics/${course.id}`}
                            className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                            title="View Analytics"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleEdit(course)} className="p-2 bg-surfaceHighlight/50 text-textMuted hover:text-textBase rounded-lg transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(course.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filteredCourses.length === 0 && (
            <div className="p-8 text-center text-textMuted flex flex-col items-center">
              <BookOpen className="w-12 h-12 mb-3 text-surfaceHighlight" />
              <p>No courses found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-surfaceHighlight rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-surfaceHighlight flex justify-between items-center">
              <h3 className="text-xl font-display font-semibold text-textBase">Add New Course</h3>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1.5">Assign Faculty</label>
                <select className="input-field" value={newCourse.facultyId} onChange={e => setNewCourse({...newCourse, facultyId: e.target.value})}>
                  <option value="">Unassigned</option>
                  {facultyList.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-surfaceHighlight mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Add Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageCourses;
