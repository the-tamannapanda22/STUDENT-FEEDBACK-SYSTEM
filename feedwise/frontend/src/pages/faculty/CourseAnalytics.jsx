import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Users, TrendingUp, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';

const CustomTooltip = ({ active, payload, label, maxRating }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-surfaceHighlight p-3 rounded-lg shadow-xl shadow-black/40 max-w-xs">
        <p className="text-sm font-medium text-textBase mb-2 leading-tight">{label}</p>
        <p className="text-xl font-bold text-primary flex items-center gap-1">
          {payload[0].value.toFixed(1)} <span className="text-xs text-textMuted font-normal mt-1">/ {maxRating ? maxRating.toFixed(1) : '5.0'}</span>
        </p>
      </div>
    );
  }
  return null;
};

const categoryConfig = {
  'COURSE_OUTCOMES': { title: 'Course Outcomes (CO) Attainment', color: '#4f46e5' },
  'SUBJECT_FEEDBACK': { title: 'Teaching Feedback', color: '#0ea5e9' },
  'FACULTY_FEEDBACK': { title: 'Curricular Gap Analysis', color: '#10b981' },
};

const CourseAnalytics = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userStr = localStorage.getItem('user');
  const role = userStr ? JSON.parse(userStr).role : 'FACULTY';
  const isAdmin = role === 'ADMIN';
  const apiBase = isAdmin ? 'http://localhost:5000/api/admin' : 'http://localhost:5000/api/faculty';
  const backPath = isAdmin ? '/admin/courses' : '/faculty';

  useEffect(() => {
    fetchAnalytics();
  }, [courseId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${apiBase}/analytics/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.error || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!data || !data.analytics) return;
    
    const headers = ['Category', 'Question Label', 'Question Text', 'Responses', 'Avg Rating'];
    
    // Group it so we can safely index it
    const grouped = data.analytics.reduce((acc, q) => {
      if (!acc[q.category]) acc[q.category] = [];
      const idx = acc[q.category].length + 1;
      const prefix = q.category === 'COURSE_OUTCOMES' ? 'CO' : 'Q';
      acc[q.category].push({ ...q, shortLabel: `${prefix}${idx}` });
      return acc;
    }, {});

    const rows = [];
    ['COURSE_OUTCOMES', 'SUBJECT_FEEDBACK', 'FACULTY_FEEDBACK'].forEach(cat => {
      if (grouped[cat]) {
        grouped[cat].forEach(q => {
          const catTitle = categoryConfig[cat].title;
          rows.push(`"${catTitle}","${q.shortLabel}","${q.text.replace(/"/g, '""')}","${q.totalResponses}","${typeof q.averageRating === 'number' ? q.averageRating.toFixed(2) : q.averageRating}"`);
        });
      }
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Feedback_Summary_${data.course.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadDetailedCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${apiBase}/courses/${courseId}/raw`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { course, feedbacks } = res.data;
      if (!feedbacks || feedbacks.length === 0) {
        alert("No detailed data available yet.");
        return;
      }

      const qMap = {};
      course.questions.forEach((q, idx) => {
        qMap[q.id] = `Q${idx + 1}`;
      });

      const questionHeaders = course.questions.map(q => qMap[q.id]);
      const headers = ['Student ID', 'Student Name', ...questionHeaders];
      
      const rows = feedbacks.map(fb => {
        const studentInfo = `"${fb.student.enrollmentId || 'Unknown'}","${fb.student.name}"`;
        const answersDict = {};
        fb.answers.forEach(a => {
          answersDict[a.questionId] = a.rating || '';
        });
        const answersStr = course.questions.map(q => `"${answersDict[q.id] !== undefined ? answersDict[q.id] : ''}"`).join(',');
        return `${studentInfo},${answersStr}`;
      });

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Detailed_Feedback_${course.code}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download detailed CSV:', err);
      alert('Failed to download detailed CSV');
    }
  };

  if (loading) {
    return (
      <DashboardLayout role={role} title="Analytics">
        <div className="flex justify-center p-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role={role} title="Analytics">
        <button onClick={() => navigate(backPath)} className="flex items-center gap-2 text-textMuted hover:text-textBase transition-colors mb-6 text-sm font-medium">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="card p-12 text-center text-red-400">{error}</div>
      </DashboardLayout>
    );
  }

  // Group analytics by category, add a sequential shortLabel per category
  const groupedData = data.analytics.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    const idx = acc[q.category].length + 1;
    const prefix = q.category === 'COURSE_OUTCOMES' ? 'CO' : 'Q';
    acc[q.category].push({ ...q, shortLabel: `${prefix}${idx}` });
    return acc;
  }, {});

  // The order we want the sections to appear in
  const categoryOrder = ['COURSE_OUTCOMES', 'SUBJECT_FEEDBACK', 'FACULTY_FEEDBACK'];

  return (
    <DashboardLayout role={role} title="Feedback Analytics">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button onClick={() => navigate(backPath)} className="flex items-center gap-2 text-textMuted hover:text-textBase transition-colors mb-4 text-sm font-medium">
            <ChevronLeft className="w-4 h-4" />
            {isAdmin ? 'Back to Courses' : 'Back to Courses'}
          </button>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-0.5 rounded uppercase tracking-wider">
              {data.course.code}
            </span>
            <h2 className="text-3xl font-display font-semibold text-textBase tracking-tight">{data.course.name}</h2>
          </div>
          <p className="text-textMuted font-medium">B.Tech {data.course.branch} • Semester {data.course.semester} • Section {data.course.section}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-surface border border-surfaceHighlight px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-textMuted uppercase tracking-wider font-semibold">Total Responses</p>
              <p className="text-xl font-bold text-textBase leading-none mt-0.5">{data.totalStudentsResponded}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleDownloadDetailedCSV}
              className="btn-secondary py-2 px-4 shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 text-sm"
              title="Download raw answers per student"
            >
              <Download className="w-4 h-4" />
              Detailed CSV
            </button>
            <button 
              onClick={handleDownloadCSV}
              className="btn-primary py-2 px-4 shadow-[0_0_20px_rgba(var(--color-primary),0.3)] transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 whitespace-nowrap"
            >
              <Download className="w-5 h-5" />
              Summary CSV
            </button>
          </div>
        </div>

      </div>

      {data.analytics.length === 0 ? (
        <div className="card p-12 text-center text-textMuted">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium text-textBase mb-1">No feedback data yet</p>
          <p>Feedback hasn't been submitted for this course. Check back later.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {categoryOrder
            .filter(cat => groupedData[cat] && groupedData[cat].length > 0)
            .map((category) => {
              const questions = groupedData[category];
              const config = categoryConfig[category];
              const maxRating = category === 'COURSE_OUTCOMES' ? 3 : 5;
              const overallAvg = (questions.reduce((acc, q) => acc + q.averageRating, 0) / questions.length).toFixed(2);
              const percentage = Math.round((parseFloat(overallAvg) / maxRating) * 100);

              return (
                <div key={category} className="card !p-0 overflow-hidden border-t-4 border-l-0 border-r-0 border-b-0" style={{ borderTopColor: config.color }}>
                  {/* Category Header */}
                  <div className="bg-surfaceHighlight/30 p-6 border-b border-surfaceHighlight flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-display font-semibold text-textBase">{config.title}</h3>
                      <p className="text-textMuted text-sm mt-1">Detailed breakdown by question</p>
                    </div>
                    <div className="flex items-center gap-3 bg-background border border-surfaceHighlight px-4 py-2 rounded-xl shrink-0">
                      <TrendingUp className="w-4 h-4 text-textMuted" />
                      <span className="text-sm font-medium text-textMuted">Category Average</span>
                      <span className="text-lg font-bold" style={{ color: config.color }}>{overallAvg}</span>
                      <span className="text-xs font-semibold text-textMuted">/ {maxRating}</span>
                      <span
                        className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${config.color}20`, color: config.color }}
                      >
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Bar Chart */}
                    <div className="h-72 w-full mb-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={questions} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#292524" />
                          <XAxis
                            dataKey="shortLabel"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#a8a29e', fontSize: 12, fontWeight: 500 }}
                            dy={10}
                          />
                          <YAxis
                            domain={[0, maxRating]}
                            ticks={Array.from({ length: maxRating + 1 }, (_, i) => i)}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#a8a29e', fontSize: 12, fontWeight: 500 }}
                            dx={-10}
                          />
                          <Tooltip content={<CustomTooltip maxRating={maxRating} />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                          <Bar
                            dataKey="averageRating"
                            radius={[6, 6, 0, 0]}
                            barSize={40}
                            animationDuration={1500}
                          >
                            {questions.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={config.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-surfaceHighlight/50 text-textMuted border-b border-surfaceHighlight">
                          <tr>
                            <th className="px-4 py-3 font-medium rounded-tl-lg w-16">ID</th>
                            <th className="px-4 py-3 font-medium">Question Text</th>
                            <th className="px-4 py-3 font-medium text-right w-32">Responses</th>
                            <th className="px-4 py-3 font-medium text-right w-32">Avg Rating</th>
                            <th className="px-4 py-3 font-medium text-right rounded-tr-lg w-28">Percentage</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surfaceHighlight/50">
                          {questions.map((q) => {
                            const qPct = Math.round((q.averageRating / maxRating) * 100);
                            return (
                              <tr key={q.id} className="hover:bg-surfaceHighlight/20 transition-colors">
                                <td className="px-4 py-3 font-medium text-primary">{q.shortLabel}</td>
                                <td className="px-4 py-3 text-textBase">{q.text}</td>
                                <td className="px-4 py-3 text-right text-textMuted">{q.totalResponses}</td>
                                <td className="px-4 py-3 font-bold text-right text-textBase">
                                  {typeof q.averageRating === 'number' ? q.averageRating.toFixed(2) : q.averageRating}
                                  <span className="ml-1 text-xs font-normal text-textMuted">/ {maxRating}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span
                                    className="inline-block text-xs font-bold px-2.5 py-1 rounded-full"
                                    style={{ backgroundColor: `${config.color}20`, color: config.color }}
                                  >
                                    {qPct}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CourseAnalytics;
