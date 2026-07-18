import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { CreditCard, IndianRupee, Landmark, Plus, Wallet as WalletIcon } from 'lucide-react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

const rechargeSchema = z.object({
  amount: z.coerce.number().min(100, 'Minimum recharge is INR 100').max(10000, 'Maximum recharge limit is INR 10,000')
});

const methods = [
  { label: 'Card Payment', icon: CreditCard },
  { label: 'UPI QR / Apps', icon: Landmark },
  { label: 'Net Banking', icon: IndianRupee },
  { label: 'Corporate Wallet', icon: WalletIcon }
];

export default function Wallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(2450);
  const [selectedMethod, setSelectedMethod] = useState('Corporate Wallet');
  const [open, setOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(rechargeSchema)
  });

  // Load balance from localStorage on mount
  useEffect(() => {
    const savedBalance = localStorage.getItem(`wallet_balance_${user?.id}`);
    if (savedBalance) {
      setBalance(parseFloat(savedBalance));
    } else {
      localStorage.setItem(`wallet_balance_${user?.id}`, '2450');
    }
  }, [user]);

  // Dynamically load Razorpay SDK script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleRecharge = async (data) => {
    setPaying(true);
    try {
      const amountVal = parseFloat(data.amount);
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_dummyKeyId';

      // Options for Razorpay wallet checkout simulation
      const options = {
        key: razorpayKey,
        amount: Math.round(amountVal * 100),
        currency: 'INR',
        name: 'EnterprisePool Wallet',
        description: 'Top-up commute credits',
        handler: function (response) {
          // Success
          const newBal = balance + amountVal;
          setBalance(newBal);
          localStorage.setItem(`wallet_balance_${user?.id}`, String(newBal));
          toast.success(`Wallet successfully loaded with INR ${amountVal}.`);
          setOpen(false);
          setPaying(false);
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        theme: {
          color: '#059669'
        },
        modal: {
          ondismiss: () => {
            toast.error('Wallet recharge transaction cancelled.');
            setPaying(false);
          }
        }
      };

      // Since wallet recharges do not correspond to specific ride bookings, we can simulate checkout directly
      toast.loading('Contacting payment gateway...');
      setTimeout(() => {
        toast.dismiss();
        if (window.Razorpay && razorpayKey !== 'rzp_test_dummyKeyId') {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // Fallback simulation for developers
          const newBal = balance + amountVal;
          setBalance(newBal);
          localStorage.setItem(`wallet_balance_${user?.id}`, String(newBal));
          toast.success(`[SANDBOX] Wallet recharged with INR ${amountVal}.`);
          setOpen(false);
          setPaying(false);
        }
      }, 1000);
      
    } catch (e) {
      toast.error('Recharge gateway initialization failed.');
      setPaying(false);
    }
  };

  return (
    <PageShell 
      eyebrow="Payments" 
      title="Payment & Wallet" 
      description="Choose a payment method, check balance, and recharge wallet credit."
      action={<Button icon={Plus} onClick={() => setOpen(true)}>Recharge Wallet</Button>}
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-emerald-600 text-white p-6 rounded-3xl flex flex-col justify-between min-h-56">
          <div>
            <p className="font-bold text-emerald-100 text-sm">Corporate wallet balance</p>
            <h2 className="mt-4 font-heading text-5xl font-extrabold">INR {balance.toLocaleString()}</h2>
          </div>
          <p className="mt-5 text-emerald-50 text-sm leading-relaxed">
            Commute credits are available for ride bookings, instant driver settlements, and carbon-offset contributions.
          </p>
        </Card>
        
        <Card className="space-y-5 p-6 bg-white">
          <h3 className="font-heading text-2xl font-extrabold text-slate-950">Payment method</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {methods.map(({ label, icon: Icon }) => (
              <button 
                key={label} 
                onClick={() => setSelectedMethod(label)} 
                className={`flex items-center gap-3 rounded-full border px-5 py-4 text-left font-bold transition ${selectedMethod === label ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-emerald-100 bg-white text-slate-700 hover:bg-emerald-50'}`}
              >
                <Icon className="h-5 w-5 text-emerald-700" />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Recharge Wallet">
        <form onSubmit={handleSubmit(handleRecharge)} className="space-y-4 pt-2">
          <Input 
            label="Amount (INR)" 
            type="number" 
            placeholder="1000" 
            error={errors.amount?.message} 
            {...register('amount')} 
          />
          <p className="text-xs text-slate-500 italic">Top-ups are secured via corporate merchant escrow.</p>
          <Button type="submit" loading={paying} className="w-full" size="lg">Pay Securely</Button>
        </form>
      </Modal>
    </PageShell>
  );
}
