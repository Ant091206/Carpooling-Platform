import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Loader2, ArrowLeft, Send, ShieldAlert } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your work email.');
      return;
    }

    setLoading(true);
    // Simulate sending OTP message for high fidelity UI
    setTimeout(() => {
      setLoading(false);
      toast.success('Security reset code sent to your email.');
      navigate('/otp-verification', { state: { email } });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-6">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#16A34A]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#22C55E]/5 rounded-full blur-[120px]" />

      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl shadow-slate-100/50 space-y-8 relative z-10 animate-slide-up">
        
        {/* Header Back Link */}
        <div className="flex items-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </Link>
        </div>

        {/* Branding & Status Info */}
        <div className="space-y-3 text-center">
          <div className="mx-auto w-12 h-12 bg-amber-50 border border-amber-200 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Forgot Password?</h2>
            <p className="text-slate-500 text-sm font-medium">
              We'll send a 6-digit OTP to your registered corporate email to reset your session credentials.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Work Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-sm rounded-xl outline-none focus:border-[#16A34A] focus:bg-white focus:ring-1 focus:ring-[#16A34A] transition-all"
                placeholder="you@company.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold rounded-xl shadow-lg shadow-green-600/10 hover:shadow-xl disabled:bg-green-400 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>Send Reset Code</span>
                <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Additional help note */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[11px] text-slate-500 leading-relaxed text-center font-medium">
          If you are unable to recover using your email, please reach out to your organization administrator or IT desk.
        </div>

      </div>
    </div>
  );
}
