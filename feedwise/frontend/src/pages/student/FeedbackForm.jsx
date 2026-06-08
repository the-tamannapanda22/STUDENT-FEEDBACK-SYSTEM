import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, Send, AlertCircle } from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';

const FeedbackForm = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [courseDetails, setCourseDetails] = useState(null);

  useEffect(() => {
    fetchCourseAndQuestions();
  }, [courseId]);

  const fetchCourseAndQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      // The current API might not have a direct endpoint for single course details easily, 
      // but we can fetch assigned courses again to get the name/faculty
      const coursesRes = await axios.get('http://localhost:5000/api/student/courses', {
         headers: { Authorization: `Bearer ${token}` }
      });
      const currentCourse = coursesRes.data.find(c => c.id === parseInt(courseId));
      if (currentCourse) setCourseDetails(currentCourse);

      const qsRes = await axios.get(`http://localhost:5000/api/student/courses/${courseId}/questions`, {
         headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(qsRes.data);
    } catch (err) {
      console.error('Fetch questions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = (questionId, rating) => {
    setAnswers(prev => ({ ...prev, [questionId]: rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all questions answered
    if (Object.keys(answers).length < questions.length) {
      alert("Please provide a rating for all questions before submitting.");
      return;
    }

    setSubmitting(true);
    
    try {
       const token = localStorage.getItem('token');
       const payload = {
         answers: Object.keys(answers).map(qId => ({
           questionId: parseInt(qId),
           rating: answers[qId]
         }))
       };

       await axios.post(`http://localhost:5000/api/student/courses/${courseId}/feedback`, payload, {
          headers: { Authorization: `Bearer ${token}` }
       });

       navigate('/success');
    } catch (err) {
       console.error("Submission failed:", err);
       alert(err.response?.data?.error || "Submission failed");
       setSubmitting(false);
    }
  };

  const groupedQuestions = questions.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {});

  const categoryLabels = {
    'COURSE_OUTCOMES': 'Course Outcomes Attainment',
    'SUBJECT_FEEDBACK': 'Teaching Feedback',
    'FACULTY_FEEDBACK': 'Curricular Gap Analysis'
  };

  return (
    <DashboardLayout role="STUDENT" title="Feedback Submission">
      <div className="mb-6">
        <button onClick={() => navigate('/student')} className="flex items-center gap-2 text-textMuted hover:text-textBase transition-colors mb-4 text-sm font-medium">
          <ChevronLeft className="w-4 h-4" />
          Back to Courses
        </button>
        {courseDetails && (
          <>
            <h2 className="text-3xl font-display font-semibold text-textBase tracking-tight">{courseDetails.name}</h2>
            <p className="text-textMuted mt-1 font-medium">{courseDetails.code} • {courseDetails.faculty ? courseDetails.faculty.name : 'Unassigned'}</p>
          </>
        )}
      </div>

      {loading ? (
        <div className="card h-64 animate-pulse bg-surface/50 border-surfaceHighlight/30 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : courseDetails?.deadline && new Date(courseDetails.deadline) < new Date() ? (
        <div className="card p-12 text-center text-textMuted border-red-500/20 bg-red-500/5">
           <AlertCircle className="w-12 h-12 mb-4 mx-auto text-red-500/50" />
           <p className="font-semibold text-red-400 text-lg">Feedback Closed</p>
           <p className="mt-2">The deadline for submitting feedback for this course has passed.</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="card p-12 text-center text-textMuted">
           <p>No questions configured for this course yet.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {Object.entries(groupedQuestions).map(([category, qs]) => (
            <div key={category} className="card overflow-hidden !p-0">
              <div className="bg-surfaceHighlight/40 px-6 py-4 border-b border-surfaceHighlight">
                <h3 className="text-lg font-semibold text-textBase tracking-wide">{categoryLabels[category]}</h3>
              </div>
              <div className="p-6 divide-y divide-surfaceHighlight">
                {qs.map((q, index) => (
                  <div key={q.id} className={`${index !== 0 ? 'pt-6' : ''} ${index !== qs.length - 1 ? 'pb-6' : ''}`}>
                    <p className="text-textBase mb-4 font-medium leading-relaxed">{index + 1}. {q.text}</p>
                    <div className="flex items-center gap-3">
                      {(category === 'COURSE_OUTCOMES' ? [1, 2, 3] : [1, 2, 3, 4, 5]).map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRating(q.id, star)}
                          className="group focus:outline-none transition-transform active:scale-95"
                        >
                          <Star 
                            className={`w-8 h-8 transition-colors duration-200 ${
                              answers[q.id] >= star 
                                ? 'fill-accent text-accent' 
                                : 'text-surfaceHighlight hover:text-accent/50 group-hover:fill-accent/30'
                            }`} 
                          />
                        </button>
                      ))}
                      <span className="ml-4 text-sm font-medium text-textMuted bg-surfaceHighlight/30 px-3 py-1 rounded-full">
                        {answers[q.id] ? `${answers[q.id]} / ${category === 'COURSE_OUTCOMES' ? 3 : 5}` : 'Not rated'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary min-w-[200px]"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
};

export default FeedbackForm;
