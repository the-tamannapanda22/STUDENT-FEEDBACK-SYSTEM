import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, UserPlus, Key, Mail, User, Layers, BookMarked, Hash } from 'lucide-react';
import axios from 'axios';
import { BRANCHES } from '../constants/options';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    enrollmentId: '',
    password: '',
    branch: '',
    semester: '',
    section: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post('http://localhost:5000/api/auth/signup', formData);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative py-12 px-4 overflow-hidden">
      {/* Abstract Background Design */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-xl z-10 animate-fade-in">
        <div className="text-center mb-8 flex flex-col items-center">
          <h1 className="text-3xl font-display font-semibold text-textBase tracking-tight flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-primary" />
            Create Student Account
          </h1>
          <p className="text-textMuted mt-2 font-medium">Join Revora to submit academic feedback.</p>
        </div>

        <form onSubmit={handleSignup} className="card relative">
          {error && (
            <div className="bg-danger/10 border border-danger/50 text-danger px-4 py-3 rounded-xl text-sm font-medium mb-6 animate-fade-in">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {/* Personal Details */}
            <div className="relative">
              <label className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 block ml-1">Full Name</label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  className="input-field pl-12"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 block ml-1">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
                <input
                  type="email"
                  name="email"
                  placeholder="student@college.edu"
                  className="input-field pl-12"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="relative md:col-span-2">
              <label className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 block ml-1">Enrollment ID</label>
              <div className="relative">
                <Hash className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
                <input
                  type="text"
                  name="enrollmentId"
                  placeholder="e.g. ENR-2024-001"
                  className="input-field pl-12"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="relative mb-6">
            <label className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 block ml-1">Password</label>
            <div className="relative">
              <Key className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="input-field pl-12"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="border-t border-surfaceHighlight pt-6 mt-2 mb-6">
            <h3 className="text-sm font-medium text-textBase mb-4">Academic Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <label className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 block ml-1">Branch</label>
                <div className="relative">
                  <Layers className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" />
                  <select name="branch" className="input-field pl-10 text-sm py-2" onChange={handleChange} required defaultValue="">
                    <option value="" disabled>Select your branch...</option>
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="relative">
                <label className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 block ml-1">Semester</label>
                <div className="relative">
                  <BookMarked className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                  <input type="number" name="semester" placeholder="6" min="1" max="8" className="input-field pl-10 text-sm py-2" onChange={handleChange} required />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 block ml-1">Section</label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                  <input type="text" name="section" placeholder="A" className="input-field pl-10 text-sm py-2" onChange={handleChange} required />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>

          <p className="text-center text-sm text-textMuted mt-5">
            Already have an account?{' '}
            <Link to="/" className="text-primary hover:text-primaryHover font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
