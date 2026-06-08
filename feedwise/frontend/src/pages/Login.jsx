import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogIn, Key, Mail, User, Shield, GraduationCap } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT'); // Default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password, role });
      
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'FACULTY') {
        navigate('/faculty');
      } else {
        navigate('/student');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid credentials or server error.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColors = () => {
    if (role === 'STUDENT') return { bg1: 'bg-primary/20', bg2: 'bg-accent/10', text: 'text-primary' };
    if (role === 'FACULTY') return { bg1: 'bg-emerald-500/20', bg2: 'bg-green-500/10', text: 'text-emerald-500' };
    return { bg1: 'bg-amber-500/20', bg2: 'bg-red-500/10', text: 'text-amber-500' };
  };

  const colors = getRoleColors();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-500">
      {/* Abstract Background Design */}
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] ${colors.bg1} blur-[120px] rounded-full pointer-events-none transition-colors duration-700`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] ${colors.bg2} blur-[120px] rounded-full pointer-events-none transition-colors duration-700`} />

      <div className="w-full max-w-md z-10 animate-slide-up">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="bg-surface border border-surfaceHighlight p-4 rounded-2xl shadow-xl flex items-center justify-center mb-6">
            <BookOpen className={`w-10 h-10 ${colors.text} transition-colors duration-500`} />
          </div>
          <h1 className="text-4xl font-display font-semibold text-textBase tracking-tight">Feedback System</h1>
          <p className="text-textMuted mt-3 font-medium">Academic feedback, elevated.</p>
        </div>

        <form onSubmit={handleLogin} className="card flex flex-col gap-5 relative">
          
          <div className="flex bg-surfaceHighlight/30 p-1 rounded-xl mb-2">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${role === 'STUDENT' ? 'bg-primary text-white shadow-md' : 'text-textMuted hover:text-textBase hover:bg-surfaceHighlight/50'}`}
            >
              <GraduationCap className="w-4 h-4" /> Student
            </button>
            <button
              type="button"
              onClick={() => setRole('FACULTY')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${role === 'FACULTY' ? 'bg-emerald-500 text-white shadow-md' : 'text-textMuted hover:text-textBase hover:bg-surfaceHighlight/50'}`}
            >
              <User className="w-4 h-4" /> Faculty/HOD
            </button>
            <button
              type="button"
              onClick={() => setRole('ADMIN')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${role === 'ADMIN' ? 'bg-amber-500 text-white shadow-md' : 'text-textMuted hover:text-textBase hover:bg-surfaceHighlight/50'}`}
            >
              <Shield className="w-4 h-4" /> Academic Section
            </button>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/50 text-danger px-4 py-3 rounded-xl text-sm font-medium animate-fade-in">
              {error}
            </div>
          )}

          <div className="relative">
            <label className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 block ml-1">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
              <input
                type="email"
                placeholder="you@institution.edu"
                className="input-field pl-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 block ml-1">Password</label>
            <div className="relative">
              <Key className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
              <input
                type="password"
                placeholder="••••••••"
                className="input-field pl-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(var(--color-primary),0.3)] transition-all ${
              role === 'STUDENT' ? 'bg-primary hover:bg-primaryHover' :
              role === 'FACULTY' ? 'bg-emerald-600 hover:bg-emerald-500' :
              'bg-amber-600 hover:bg-amber-500'
            } mt-2 disabled:opacity-70`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In as {role === 'STUDENT' ? 'Student' : role === 'FACULTY' ? 'Faculty' : 'Section Head'}
              </>
            )}
          </button>

          <p className="text-center text-sm text-textMuted mt-4">
             New student?{' '}
            <Link to="/signup" className="text-primary hover:text-primaryHover font-medium transition-colors">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
