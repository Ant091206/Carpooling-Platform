import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck, Loader2, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react';

export default function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your corporate email';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input automatically
    if (element.value !== '') {
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    // Move to previous input on Backspace
    if (e.key === 'Backspace') {
      if (otp[index] === '') {
        if (index > 0 && inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      }
    }
  };

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(59);
    toast.success('A new security verification code has been dispatched.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    // Simulate verification
    setTimeout(() => {
      setLoading(false);
      toast.success('Authorization token generated successfully.');
      
      // Seed a temporary user session for hackathon demo if not logged in
      const mockProfile = {
        id: 1,
        organization_id: 1,
        employee_id: 'EMP-9921',
        name: 'John Doe',
        email: email.includes('@') ? email : 'john.doe@google.com',
        phone: '555-0199',
        role: 'EMPLOYEE',
        department: 'IT Procurement',
        designation: 'Senior Buyer'
      };
      localStorage.setItem('token', 'mock_verified_token_for_hackathon');
      localStorage.setItem('user', JSON.stringify(mockProfile));
      
      // Reload page structure to sync with session state
      window.location.href = '/dashboard';
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

        {/* Info */}
        <div className="space-y-3 text-center">
          <div className="mx-auto w-12 h-12 bg-green-50 border border-green-200 text-[#16A34A] rounded-2xl flex items-center justify-center shadow-inner">
            <KeyRound className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Security Check</h2>
            <p className="text-slate-500 text-sm font-medium">
              Enter the 6-digit key sent to:
            </p>
            <p className="text-slate-700 text-xs font-bold break-all bg-slate-50 border border-slate-100 rounded-lg p-2 mt-1">
              {email}
            </p>
          </div>
        </div>

        {/* Inputs form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2.5">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                ref={(el) => (inputRefs.current[index] = el)}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-14 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl font-bold text-slate-800 outline-none focus:border-[#16A34A] focus:bg-white focus:ring-1 focus:ring-[#16A34A] transition-all"
              />
            ))}
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
                <span>Verify & Authorize</span>
                <ShieldCheck className="h-4.5 w-4.5" />
              </>
            )}
          </button>
        </form>

        {/* Resend actions */}
        <div className="flex items-center justify-between text-xs px-2">
          <span className="text-slate-400 font-semibold">Didn't receive verification key?</span>
          <button
            onClick={handleResend}
            disabled={timer > 0}
            className={`inline-flex items-center gap-1 font-bold ${
              timer > 0 
                ? 'text-slate-400 cursor-not-allowed' 
                : 'text-[#16A34A] hover:text-[#15803D] hover:underline'
            }`}
          >
            <RefreshCw className="h-3 w-3" />
            <span>{timer > 0 ? `Resend in ${timer}s` : 'Resend Key'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
