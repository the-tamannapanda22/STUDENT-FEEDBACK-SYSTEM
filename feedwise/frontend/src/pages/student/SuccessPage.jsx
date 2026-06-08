import { Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';

const SuccessPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Animated check circle */}
        <div className="flex justify-center mb-8">
          <div className="w-28 h-28 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center animate-pulse-slow">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-display font-bold text-textBase mb-3 tracking-tight">
          Feedback Submitted!
        </h1>
        <p className="text-textMuted text-lg leading-relaxed mb-10">
          Thank you for your valuable input. Your responses have been recorded and will help improve academic quality.
        </p>

        <Link
          to="/student"
          className="btn-primary inline-flex items-center gap-2 px-8 py-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default SuccessPage;
