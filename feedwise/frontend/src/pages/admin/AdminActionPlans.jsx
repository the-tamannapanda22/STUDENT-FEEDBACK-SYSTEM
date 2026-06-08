import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, AlertCircle, CheckCircle, Search } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminActionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, SUBMITTED

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/action-plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlans(res.data);
    } catch (err) {
      console.error('Failed to fetch admin action plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(p => {
    if (filter !== 'ALL' && p.status !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return p.course.code.toLowerCase().includes(term) || 
             p.course.name.toLowerCase().includes(term) || 
             (p.faculty?.name && p.faculty.name.toLowerCase().includes(term));
    }
    return true;
  });

  if (loading) {
    return (
      <DashboardLayout role="ADMIN" title="Action Plans Tracking">
        <div className="flex justify-center p-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="ADMIN" title="Action Plans Tracking">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-semibold text-textBase">Improvement Plans Overseer</h2>
          <p className="text-textMuted mt-1">Track faculty corrective action plans for courses below the 60% CO threshold.</p>
        </div>
      </div>

      <div className="card p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
          <input
            type="text"
            placeholder="Search by course code, name, or faculty..."
            className="input w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="input w-full md:w-48 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23a8a29e%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="SUBMITTED">Submitted</option>
        </select>
      </div>

      {filteredPlans.length === 0 ? (
        <div className="card p-12 text-center text-textMuted">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-40" />
          <p className="font-medium text-textBase mb-1">All Clear</p>
          <p>No action plans found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredPlans.map((plan) => (
            <div key={plan.id} className="card p-6 border-l-4" style={{ borderLeftColor: plan.status === 'PENDING' ? '#ef4444' : '#10b981' }}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-surfaceHighlight">
                <div>
                  <h3 className="text-xl font-bold text-textBase flex items-center gap-2">
                    {plan.course.code} - {plan.course.name}
                  </h3>
                  <p className="text-sm text-textMuted mt-1">
                    Faculty: <span className="font-medium text-textBase">{plan.faculty ? plan.faculty.name : 'Unknown'}</span> ({plan.faculty?.email})
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {plan.status === 'PENDING' ? (
                    <span className="flex items-center gap-2 bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-red-500/20">
                      <AlertCircle className="w-4 h-4" /> Pending Action
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-green-500/20">
                      <CheckCircle className="w-4 h-4" /> Submitted
                    </span>
                  )}
                </div>
              </div>

              {plan.status === 'SUBMITTED' ? (
                <div className="bg-surfaceHighlight/20 p-4 rounded-xl">
                  <p className="text-xs uppercase font-bold text-textMuted tracking-wider mb-2">Faculty Improvement Plan</p>
                  <p className="text-textBase leading-relaxed whitespace-pre-wrap">{plan.planText}</p>
                </div>
              ) : (
                <div className="bg-danger/5 p-4 rounded-xl border border-danger/10">
                  <p className="text-danger/80 text-sm font-medium">Faculty has not yet submitted an improvement plan for this low-performing course.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminActionPlans;
