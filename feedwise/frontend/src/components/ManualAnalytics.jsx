import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Filter, Download, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import DashboardLayout from './layout/DashboardLayout';

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
  'CO': { title: 'Course Outcomes (CO) Attainment', color: '#4f46e5' },
  'TEACHING': { title: 'Teaching Feedback', color: '#0ea5e9' },
  'CURRICULUM': { title: 'Curricular Gap Analysis', color: '#10b981' },
};

const ManualAnalytics = ({ role }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState('');

  // Derived unique courses from data for filter
  const uniqueCourses = [...new Map(data.map(item => [item.course.id, item.course])).values()];

  useEffect(() => {
    fetchAnalytics();
  }, [filterCourse]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = filterCourse ? `http://localhost:5000/api/manual-feedback/analysis?courseId=${filterCourse}` : 'http://localhost:5000/api/manual-feedback/analysis';
      
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch manual analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Processing Data for Charts
  let barData = [];
  let pieData = [];
  let lineData = [];

  if (data.length > 0) {
    // 1. Bar Chart: Question Averages for each file
    // We'll just take the first visible file's averages or aggregate them? 
    // Let's aggregate by question across the current filtered dataset
    const aggregateAverages = {};
    const aggregateCounts = {};
    
    data.forEach(file => {
      if (file.analysis && file.analysis.questionAverages) {
        Object.entries(file.analysis.questionAverages).forEach(([q, avg]) => {
          aggregateAverages[q] = (aggregateAverages[q] || 0) + parseFloat(avg);
          aggregateCounts[q] = (aggregateCounts[q] || 0) + 1;
        });
      }
    });

    barData = Object.keys(aggregateAverages).map(q => ({
      name: q,
      Score: parseFloat((aggregateAverages[q] / aggregateCounts[q]).toFixed(2))
    })).sort((a, b) => a.name.localeCompare(b.name));

    lineData = [...barData]; // Reusing the trend

    // 2. Pie Chart: Distribution by File Type or Score Ranges?
    // Let's show average score by File Type
    const typeAverages = {};
    const typeCounts = {};
    data.forEach(file => {
      if (file.analysis && file.analysis.overallSummary) {
        const type = file.fileType;
        typeAverages[type] = (typeAverages[type] || 0) + parseFloat(file.analysis.overallSummary.overallAverage);
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      }
    });

    pieData = Object.keys(typeAverages).map(type => ({
      name: type,
      value: parseFloat((typeAverages[type] / typeCounts[type]).toFixed(2))
    }));
  }

  // Calculate distinct averages for CO (out of 3) and Feedbacks (out of 5)
  let coAvgSum = 0;
  let coCount = 0;
  let qAvgSum = 0;
  let qCount = 0;

  data.forEach(file => {
    if (file.fileType === 'CO' && file.analysis?.overallSummary) {
      coAvgSum += file.analysis.overallSummary.overallAverage;
      coCount++;
    } else if (['CURRICULUM', 'TEACHING'].includes(file.fileType) && file.analysis?.overallSummary) {
      qAvgSum += file.analysis.overallSummary.overallAverage;
      qCount++;
    }
  });

  const coAverageRender = coCount > 0 ? (coAvgSum / coCount).toFixed(2) : '-';
  const qAverageRender = qCount > 0 ? (qAvgSum / qCount).toFixed(2) : '-';

  const handleExport = () => {
    if (data.length === 0) return;

    // Extract all unique question keys (CO1, Q1, etc) across all loaded data
    const allQuestionKeys = new Set();
    data.forEach(file => {
      if (file.analysis && file.analysis.questionAverages) {
        Object.keys(file.analysis.questionAverages).forEach(k => allQuestionKeys.add(k));
      }
    });

    // Sort keys logically: CO1, CO2 before Q1, Q2
    const sortedKeys = Array.from(allQuestionKeys).sort((a, b) => {
      const aMatch = a.match(/([a-zA-Z]+)(\d+)/);
      const bMatch = b.match(/([a-zA-Z]+)(\d+)/);
      if (aMatch && bMatch) {
         if (aMatch[1] === bMatch[1]) {
            return parseInt(aMatch[2]) - parseInt(bMatch[2]);
         }
         return aMatch[1].localeCompare(bMatch[1]);
      }
      return a.localeCompare(b);
    });

    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Build Header
    const headers = [
       "Branch", 
       "Semester", 
       "Course Name", 
       "Subject Code", 
       "Feedback Category", 
       "Total Responses", 
       "Category Average",
       ...sortedKeys
    ];
    csvContent += headers.map(h => `"${h}"`).join(",") + "\n";

    // Build Rows
    data.forEach(file => {
      const branch = file.course?.branch || '';
      const sem = file.course?.semester || '';
      const name = file.course?.name || '';
      const code = file.course?.code || '';
      const type = file.fileType || '';
      const responses = file.analysis?.overallSummary?.totalResponses || 0;
      const avg = (file.analysis?.overallSummary?.overallAverage || 0).toFixed(2);

      const rowData = [
         branch,
         sem,
         name,
         code,
         type,
         responses,
         avg
      ];

      // Add corresponding average for each question column
      sortedKeys.forEach(key => {
         const qAvg = file.analysis?.questionAverages?.[key];
         rowData.push(qAvg !== undefined && qAvg !== null ? qAvg : '-');
      });

      csvContent += rowData.map(val => `"${val}"`).join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `detailed_manual_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout role={role} title="Manual Analytics">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-textBase">Manual Feedback Analytics</h2>
          <p className="text-textMuted mt-1">Insights from manually uploaded Excel data</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
            <select
              className="input-field pl-9 py-2 text-sm"
              value={filterCourse}
              onChange={e => setFilterCourse(e.target.value)}
            >
              <option value="">All Courses</option>
              {uniqueCourses.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2 py-2">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
           <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="card p-12 text-center text-textMuted flex flex-col items-center">
           <p>No manual feedback data available. Please upload files to see analytics.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card border-l-4 border-l-primary">
               <h3 className="text-sm font-semibold text-textMuted uppercase">Files Processed</h3>
               <p className="text-3xl font-display font-bold text-textBase mt-2">{data.length}</p>
            </div>
             <div className="card border-l-4 border-l-purple-500">
               <h3 className="text-sm font-semibold text-textMuted uppercase">Total Responses</h3>
               <p className="text-3xl font-display font-bold text-textBase mt-2">
                 {data.reduce((acc, file) => acc + (file.analysis?.overallSummary?.totalResponses || 0), 0)}
               </p>
            </div>
             <div className="card border-l-4 border-l-emerald-500">
               <h3 className="text-sm font-semibold text-textMuted uppercase">CO Average</h3>
               <p className="text-3xl font-display font-bold text-textBase mt-2 flex items-baseline gap-1">
                 {coAverageRender} <span className="text-sm text-textMuted font-medium">/ 3.0</span>
               </p>
            </div>
             <div className="card border-l-4 border-l-[#f59e0b]">
               <h3 className="text-sm font-semibold text-textMuted uppercase">Feedback Average</h3>
               <p className="text-3xl font-display font-bold text-textBase mt-2 flex items-baseline gap-1">
                 {qAverageRender} <span className="text-sm text-textMuted font-medium">/ 5.0</span>
               </p>
            </div>
          </div>

          {/* Detailed Cards for Each Uploaded File */}
          <div className="space-y-8 mt-8">
             {data.map(file => {
               const isCO = file.fileType === 'CO';
               const maxRating = isCO ? 3 : 5;
               const config = categoryConfig[file.fileType] || { title: file.fileType, color: '#f59e0b' };
               
               const overallAvg = file.analysis?.overallSummary?.overallAverage || 0;
               const percentage = Math.round((overallAvg / maxRating) * 100);

               const questions = Object.entries(file.analysis?.questionAverages || {}).map(([key, val]) => ({
                 shortLabel: key,
                 averageRating: val
               }));

               questions.sort((a, b) => {
                 const aMatch = a.shortLabel.match(/([a-zA-Z]+)(\d+)/);
                 const bMatch = b.shortLabel.match(/([a-zA-Z]+)(\d+)/);
                 if (aMatch && bMatch) {
                   if (aMatch[1] === bMatch[1]) return parseInt(aMatch[2]) - parseInt(bMatch[2]);
                   return aMatch[1].localeCompare(bMatch[1]);
                 }
                 return a.shortLabel.localeCompare(b.shortLabel);
               });

               return (
                 <div key={file.id} className="card !p-0 overflow-hidden border-t-4 border-l-0 border-r-0 border-b-0" style={{ borderTopColor: config.color }}>
                   <div className="bg-surfaceHighlight/30 p-6 border-b border-surfaceHighlight flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div>
                       <div className="flex items-center gap-3 mb-1">
                         <span className="text-xs font-bold px-2 py-0.5 rounded tracking-wider bg-surfaceHighlight text-textMuted uppercase">
                           {file.course?.code}
                         </span>
                         <h3 className="text-xl font-display font-semibold text-textBase">{config.title}</h3>
                       </div>
                       <p className="text-textMuted text-sm">
                         {file.course?.name} (Sem {file.course?.semester}) • Uploaded on {new Date(file.uploadedAt).toLocaleDateString()}
                       </p>
                     </div>
                     <div className="flex items-center gap-3 bg-background border border-surfaceHighlight px-4 py-2 rounded-xl shrink-0">
                       <TrendingUp className="w-4 h-4 text-textMuted" />
                       <span className="text-sm font-medium text-textMuted">Average</span>
                       <span className="text-lg font-bold" style={{ color: config.color }}>{overallAvg.toFixed(2)}</span>
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
                             <th className="px-4 py-3 font-medium rounded-tl-lg w-32">Metric</th>
                             <th className="px-4 py-3 font-medium text-right w-32">Avg Rating</th>
                             <th className="px-4 py-3 font-medium text-right rounded-tr-lg w-28">Percentage</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-surfaceHighlight/50">
                           {questions.map((q) => {
                             const qPct = Math.round((q.averageRating / maxRating) * 100);
                             return (
                               <tr key={q.shortLabel} className="hover:bg-surfaceHighlight/20 transition-colors">
                                 <td className="px-4 py-3 font-medium text-primary">{q.shortLabel}</td>
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

        </div>
      )}
    </DashboardLayout>
  );
};

export default ManualAnalytics;
