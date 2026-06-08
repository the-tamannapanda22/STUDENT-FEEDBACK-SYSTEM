import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Tag, Loader2, ArrowLeft, Pencil, Upload } from 'lucide-react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';

const CATEGORIES = {
  CO: 'COURSE_OUTCOMES',
  SUBJECT: 'SUBJECT_FEEDBACK',
  FACULTY: 'FACULTY_FEEDBACK'
};

const FacultyCourseSetup = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES.CO);
  
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    fetchCourseDetails();
    fetchQuestions();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/faculty/courses/${courseId}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourse(res.data.course);
    } catch (err) {
      console.error('Error fetching course:', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/faculty/questions/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(res.data);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !courseId) return;
    
    try {
      const token = localStorage.getItem('token');
      const payload = { text: newQuestion, category: selectedCategory, courseId };
      const res = await axios.post('http://localhost:5000/api/faculty/questions', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setQuestions([...questions, res.data]);
      setNewQuestion('');
    } catch (err) {
      console.error('Failed to add question', err);
      alert('Failed to add question');
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this question?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/faculty/questions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuestions(questions.filter(q => q.id !== id));
      } catch (err) {
        console.error('Failed to delete question', err);
        alert('Failed to delete question');
      }
    }
  };

  const fileInputRef = useRef(null);

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !courseId) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(l => l.trim() !== '');
        
        let parsedRows = lines;
        const firstLineLow = lines[0].toLowerCase();
        if (firstLineLow.includes('text') || firstLineLow.includes('question') || firstLineLow.includes('category')) {
          parsedRows = lines.slice(1);
        }

        const questionsToUpload = [];
        for (const row of parsedRows) {
          const cols = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || row.split(',');
          if (cols.length >= 2) {
            let qText = cols[0].replace(/^"|"$/g, '').trim();
            if (!qText) continue;
            let catRaw = cols[1].replace(/^"|"$/g, '').trim();
            
            let mappedCat = CATEGORIES.SUBJECT;
            if (catRaw.toUpperCase().includes('OUTCOME') || catRaw.toUpperCase() === 'CO') mappedCat = CATEGORIES.CO;
            if (catRaw.toUpperCase().includes('FACULTY')) mappedCat = CATEGORIES.FACULTY;

            questionsToUpload.push({ text: qText, category: mappedCat, courseId });
          }
        }

        if (questionsToUpload.length === 0) {
          alert("No valid questions found. Ensure CSV format: 'Question Text, Category'");
          return;
        }

        const token = localStorage.getItem('token');
        await axios.post('http://localhost:5000/api/faculty/questions/bulk', { questions: questionsToUpload, courseId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        fetchQuestions();
        alert(`Successfully imported ${questionsToUpload.length} questions from CSV.`);
      } catch (err) {
        console.error('Bulk upload error', err);
        alert('Failed to process or upload CSV properly.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEdit = (q) => {
    setEditingQuestionId(q.id);
    setEditingText(q.text);
  };

  const handleSaveEdit = async (id) => {
    if (!editingText.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/faculty/questions/${id}`, { text: editingText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(questions.map(q => q.id === id ? { ...q, text: editingText } : q));
      setEditingQuestionId(null);
    } catch (err) {
      console.error('Failed to update question', err);
      alert('Failed to update question: ' + (err.response?.data?.error || err.message));
    }
  };

  const renderCategoryBox = (categoryKey, title, colorClass, bgColorClass) => {
    const categoryQuestions = questions.filter(q => q.category === categoryKey);
    return (
      <div className={`card !p-0 overflow-hidden flex flex-col h-full border-t-4 border-l-0 border-r-0 border-b-0 ${colorClass}`} style={{ borderTopColor: 'currentColor' }}>
        <div className={`p-4 border-b border-surfaceHighlight flex justify-between items-center ${bgColorClass}`}>
          <h3 className="font-semibold text-textBase">{title}</h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/20 text-textBase">
            {categoryQuestions.length}
          </span>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          {categoryQuestions.length === 0 ? (
             <p className="text-textMuted text-sm text-center py-4">No questions added yet.</p>
          ) : (
            <ul className="space-y-3 relative">
              {categoryQuestions.map((q, i) => (
                <li key={q.id} className="group flex items-start gap-3 text-sm p-2 -mx-2 rounded-lg hover:bg-surfaceHighlight/30 transition-colors">
                  <span className="text-textMuted font-mono mt-0.5 min-w-[20px]">Q{i+1}.</span>
                  {editingQuestionId === q.id ? (
                    <div className="flex-1 flex gap-2">
                      <input 
                        className="input-field py-1 text-sm bg-surfaceHighlight/30 text-textBase w-full h-auto min-h-[32px]"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        autoFocus
                      />
                      <button onClick={() => handleSaveEdit(q.id)} className="text-primary hover:text-primary/80 font-medium px-2 py-1 rounded bg-primary/10">Save</button>
                      <button onClick={() => setEditingQuestionId(null)} className="text-textMuted hover:text-textBase font-medium px-2 py-1 rounded bg-surfaceHighlight/50">Cancel</button>
                    </div>
                  ) : (
                    <>
                      <span className="text-textBase flex-1 leading-relaxed">{q.text}</span>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all shrink-0">
                        <button onClick={() => startEdit(q)} className="p-1.5 text-textMuted hover:text-primary hover:bg-primary/10 rounded">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(q.id)} className="p-1.5 text-textMuted hover:text-red-500 hover:bg-red-500/10 rounded">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
     return <DashboardLayout role="FACULTY" title="Evaluation Framework"><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout role="FACULTY" title="Course Setup">
      <button onClick={() => navigate(-1)} className="btn-secondary py-2 px-3 mb-6 inline-flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-textBase tracking-tight">Questionnaire Configuration</h2>
          {course && <p className="text-textMuted mt-1">Design feedback forms for {course.code} — {course.name}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 lg:h-[400px]">
        {renderCategoryBox(CATEGORIES.CO, 'Course Outcomes (CO)', 'text-indigo-500', 'bg-indigo-500/10')}
        {renderCategoryBox(CATEGORIES.SUBJECT, 'Teaching Feedback', 'text-sky-500', 'bg-sky-500/10')}
        {renderCategoryBox(CATEGORIES.FACULTY, 'Curricular Gap Analysis', 'text-emerald-500', 'bg-emerald-500/10')}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-textBase flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Add New Question
          </h3>
          
          <div>
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleBulkUpload} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary py-2 px-3 text-sm flex items-center gap-2 hover:bg-surfaceHighlight shadow-md"
            >
              <Upload className="w-4 h-4" /> Bulk Import (CSV)
            </button>
          </div>
        </div>
        <form onSubmit={handleAddQuestion} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input 
                required 
                className="input-field" 
                placeholder="Enter question text here..." 
                value={newQuestion} 
                onChange={(e) => setNewQuestion(e.target.value)} 
            />
          </div>
          <div className="w-full md:w-64">
            <div className="relative">
              <Tag className="w-4 h-4 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
              <select 
                className="input-field pl-10 appearance-none bg-surfaceHighlight/50"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value={CATEGORIES.CO}>Course Outcomes</option>
                <option value={CATEGORIES.SUBJECT}>Teaching Feedback</option>
                <option value={CATEGORIES.FACULTY}>Curricular Gap Analysis</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary whitespace-nowrap">
            {loading ? 'Adding...' : 'Add to Bank'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default FacultyCourseSetup;
