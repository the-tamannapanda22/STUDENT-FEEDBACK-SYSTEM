import { useState, useEffect } from 'react';
import { User, Mail, Shield, BookOpen, GraduationCap, MapPin, Building2, Calendar, Loader2, Hash } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }
        
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <DashboardLayout role="STUDENT" title="Profile">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) return null;

  return (
    <DashboardLayout role={profile.role} title="My Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="bg-surface border border-surfaceHighlight rounded-2xl overflow-hidden shadow-xl">
          <div className="h-32 bg-primary/20 bg-gradient-to-r from-primary/30 to-background/5 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          </div>
          <div className="px-6 sm:px-10 pb-8 relative">
            <div className="w-24 h-24 rounded-full bg-surface border-4 border-background flex items-center justify-center absolute -top-12 shadow-xl shadow-black/50">
              <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
            </div>
            
            <div className="pt-16 pb-2">
              <h1 className="text-3xl font-display font-bold text-textBase shadow-sm">{profile.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5 text-textMuted bg-surfaceHighlight/30 px-3 py-1 rounded-full text-sm font-medium border border-surfaceHighlight/50">
                  <Mail className="w-4 h-4 text-primary" /> {profile.email}
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-sm font-bold border border-emerald-400/20 uppercase tracking-wide">
                  <Shield className="w-4 h-4" /> {profile.role}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Details - mostly relevant for STUDENTS, but structurally clean for all */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-textBase mb-6 flex items-center gap-2 border-b border-surfaceHighlight pb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              Account Details
            </h3>
            <div className="space-y-5">
              <div>
                <label className="text-xs text-textMuted uppercase tracking-wider font-semibold mb-1 block">Full Legal Name</label>
                <div className="text-textBase font-medium text-lg leading-tight bg-surfaceHighlight/20 p-3 rounded-lg border border-surfaceHighlight">
                  {profile.name}
                </div>
              </div>
              <div>
                <label className="text-xs text-textMuted uppercase tracking-wider font-semibold mb-1 block">Registered Email Address</label>
                <div className="text-textBase font-medium leading-tight bg-surfaceHighlight/20 p-3 rounded-lg border border-surfaceHighlight">
                  {profile.email}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-textBase mb-6 flex items-center gap-2 border-b border-surfaceHighlight pb-4">
              <GraduationCap className="w-5 h-5 text-primary" />
              Academic Metadata
            </h3>
            {profile.role === 'STUDENT' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surfaceHighlight/20 p-4 rounded-xl border border-surfaceHighlight flex flex-col items-center justify-center text-center">
                  <Hash className="w-6 h-6 text-textMuted mb-2" />
                  <span className="text-xs text-textMuted uppercase font-semibold mb-1 tracking-wider">Enrollment ID</span>
                  <span className="text-textBase font-bold text-lg">{profile.enrollmentId || 'Not Set'}</span>
                </div>
                <div className="bg-surfaceHighlight/20 p-4 rounded-xl border border-surfaceHighlight flex flex-col items-center justify-center text-center">
                  <Building2 className="w-6 h-6 text-textMuted mb-2" />
                  <span className="text-xs text-textMuted uppercase font-semibold mb-1 tracking-wider">Branch</span>
                  <span className="text-textBase font-bold text-lg">{profile.branch || 'Not Set'}</span>
                </div>
                <div className="bg-surfaceHighlight/20 p-4 rounded-xl border border-surfaceHighlight flex flex-col items-center justify-center text-center">
                  <Calendar className="w-6 h-6 text-textMuted mb-2" />
                  <span className="text-xs text-textMuted uppercase font-semibold mb-1 tracking-wider">Semester</span>
                  <span className="text-textBase font-bold text-lg">{profile.semester || 'Not Set'}</span>
                </div>
                <div className="bg-surfaceHighlight/20 p-4 rounded-xl border border-surfaceHighlight flex flex-col items-center justify-center text-center">
                  <MapPin className="w-6 h-6 text-textMuted mb-2" />
                  <span className="text-xs text-textMuted uppercase font-semibold mb-1 tracking-wider">Section</span>
                  <span className="text-textBase font-bold text-lg">{profile.section || 'Not Set'}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[160px] text-center px-4">
                <div className="w-12 h-12 rounded-full bg-surfaceHighlight/50 flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6 text-textMuted" />
                </div>
                <p className="text-textMuted text-sm">Academic mappings (Branch, Semester) are natively reserved for Student enrollment profiles.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Profile;
