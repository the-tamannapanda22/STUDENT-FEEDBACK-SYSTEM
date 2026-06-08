import { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Loader2, Send, CheckCircle, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const FacultyActionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [planTexts, setPlanTexts] = useState({});

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/faculty/action-plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlans(res.data);
      
      const texts = {};
      res.data.forEach(p => { texts[p.id] = p.planText || ''; });
      setPlanTexts(texts);
    } catch (err) {
      console.error('Failed to fetch action plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (id) => {
    setSubmittingId(id);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/faculty/action-plans/${id}`, {
        planText: planTexts[id]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPlans();
    } catch (err) {
      console.error('Failed to submit action plan:', err);
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="FACULTY" title="Action Plans">
        <div className="flex justify-center p-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="FACULTY" title="Action Plans (Closing the Loop)">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-semibold text-textBase">Improvement Plans</h2>
          <p className="text-textMuted mt-1">Required workflows triggered by low CO attainment (below 60%).</p>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="card p-12 text-center text-textMuted">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-40" />
          <p className="font-medium text-textBase mb-1">No Action Plans Required</p>
          <p>Your courses are performing well above the CO threshold.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="card p-6 border-l-4" style={{ borderLeftColor: plan.status === 'PENDING' ? '#ef4444' : '#10b981' }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-textBase flex items-center gap-2">
                    {plan.course.code} - {plan.course.name}
                    {plan.status === 'PENDING' ? (
                      <span className="bg-red-500/20 text-red-500 text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider">Pending</span>
                    ) : (
                      <span className="bg-green-500/20 text-green-500 text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider">Submitted</span>
                    )}
                  </h3>
                  <p className="text-sm text-textMuted mt-1">
                    B.Tech {plan.course.branch} Sem {plan.course.semester} - Section {plan.course.section}
                  </p>
                </div>
                {plan.status === 'PENDING' && (
                  <div className="flex items-center gap-2 text-danger/80 bg-danger/10 px-3 py-1.5 rounded-lg text-sm font-semibold">
                    <AlertCircle className="w-4 h-4" /> Action Required
                  </div>
                )}
              </div>

              {plan.status === 'PENDING' ? (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-2">
                      Please detail the corrective measures or improvement plan you intend to implement for the next semester to address the low CO outcomes.
                    </label>
                    <textarea 
                      className="input w-full min-h-[120px] resize-y"
                      placeholder="E.g. Will implement more hands-on tutorials and continuous assessments..."
                      value={planTexts[plan.id] || ''}
                      onChange={(e) => setPlanTexts({ ...planTexts, [plan.id]: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button 
                      className="btn-primary py-2 px-6 shadow-md shadow-primary/20 flex items-center gap-2"
                      disabled={!planTexts[plan.id] || !planTexts[plan.id].trim() || submittingId === plan.id}
                      onClick={() => handleSubmit(plan.id)}
                    >
                      {submittingId === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Submit Action Plan
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 bg-surfaceHighlight/30 p-4 rounded-xl border border-surfaceHighlight">
                  <p className="text-sm text-textMuted font-medium mb-2">Submitted Action Plan:</p>
                  <p className="text-textBase whitespace-pre-wrap">{plan.planText}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default FacultyActionPlans;
