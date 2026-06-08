import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, TrendingUp, Loader2, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-surface border border-surfaceHighlight p-3 rounded-lg shadow-xl max-w-xs">
        <p className="text-sm font-bold text-textBase mb-1">{data.code}</p>
        <p className="text-xs text-textMuted mb-2">Sem {data.semester}</p>
        <p className="text-xl font-bold text-primary flex items-center gap-1">
          {data.average} <span className="text-xs text-textMuted font-normal mt-1">/ 5.0</span>
        </p>
      </div>
    );
  }
  return null;
};

const FacultyHistoricalAnalytics = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistoricalData();
  }, []);

  const fetchHistoricalData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/faculty/historical', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setError('Failed to load tracking analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="FACULTY" title="Historical Tracking">
        <div className="flex justify-center p-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="FACULTY" title="Historical Analytics">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button onClick={() => navigate('/faculty')} className="flex items-center gap-2 text-textMuted hover:text-textBase transition-colors mb-4 text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-display font-semibold text-textBase tracking-tight">Longitudinal Tracking</h2>
          </div>
          <p className="text-textMuted font-medium">Observe your teaching evolution across semesters.</p>
        </div>
      </div>

      {error ? (
        <div className="card p-12 text-center text-red-400">{error}</div>
      ) : data.length < 2 ? (
        <div className="card p-12 text-center text-textMuted">
          <Award className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium text-textBase mb-1">Insufficient Data</p>
          <p>We need feedback accumulated from at least two courses to trace your growth.</p>
        </div>
      ) : (
        <div className="card border-t-4 border-l-0 border-r-0 border-b-0 border-t-primary">
           <div className="mb-8">
            <h3 className="text-xl font-display font-bold text-textBase mb-1">Performance Trajectory</h3>
            <p className="text-textMuted text-sm">Average feedback rating scored per sequential course mapping.</p>
           </div>
           
           <div className="h-80 w-full mb-4 pr-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#292524" />
                <XAxis
                  dataKey="code"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#a8a29e', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#a8a29e', fontSize: 12, fontWeight: 500 }}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#4f46e5"
                  strokeWidth={4}
                  dot={{ fill: '#4f46e5', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#ec4899', stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default FacultyHistoricalAnalytics;
