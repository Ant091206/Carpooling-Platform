import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { CheckCircle, IndianRupee, Wallet } from 'lucide-react';
import PageShell from '../../components/shared/PageShell.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { useWallet } from '../../context/WalletContext.jsx';

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000];

const rechargeSchema = z.object({
  amount: z
    .coerce
    .number({ invalid_type_error: 'Amount must be a number.' })
    .min(10, 'Minimum recharge is ₹10.')
    .max(50000, 'Maximum recharge is ₹50,000.'),
  description: z.string().max(200).optional(),
});

export default function RechargeWallet() {
  const navigate  = useNavigate();
  const { wallet, recharge, fetchWallet } = useWallet();
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [newBalance, setNewBalance] = useState(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(rechargeSchema),
    defaultValues: { amount: '', description: '' },
  });

  const currentAmount = watch('amount');

  const setQuickAmount = (amt) => setValue('amount', amt, { shouldValidate: true });

  const onSubmit = async ({ amount, description }) => {
    setLoading(true);
    try {
      const result = await recharge(Number(amount), description);
      setNewBalance(parseFloat(result.wallet.balance));
      setSuccess(true);
      await fetchWallet();
      toast.success(`₹${amount} added to wallet!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Recharge failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PageShell eyebrow="Wallet" title="Recharge Successful">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <Card className="mx-auto max-w-md flex flex-col items-center gap-6 py-14 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-12 w-12 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-heading text-3xl font-extrabold text-slate-900">
                Wallet Recharged!
              </h2>
              <p className="mt-2 text-slate-500">
                Your new balance is{' '}
                <span className="font-extrabold text-emerald-700 text-xl">
                  ₹{newBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setSuccess(false)} variant="secondary">
                Recharge Again
              </Button>
              <Button onClick={() => navigate('/wallet')}>
                Back to Wallet
              </Button>
            </div>
          </Card>
        </motion.div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Wallet"
      title="Recharge Wallet"
      description="Add funds to your enterprise wallet instantly. Use wallet balance to pay for rides."
    >
      <div className="mx-auto max-w-xl">
        <Card>
          {/* Current Balance */}
          {wallet && (
            <div className="mb-6 rounded-2xl bg-emerald-50 px-5 py-4 flex items-center gap-3">
              <Wallet className="h-6 w-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Current Balance</p>
                <p className="text-2xl font-extrabold text-slate-900">
                  ₹{parseFloat(wallet.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}

          {/* Quick Amounts */}
          <div className="mb-6">
            <p className="mb-3 text-sm font-bold text-slate-600">Quick Select</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setQuickAmount(amt)}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                    Number(currentAmount) === amt
                      ? 'border-emerald-500 bg-emerald-600 text-white shadow-md shadow-emerald-200'
                      : 'border-emerald-100 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  ₹{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              icon={IndianRupee}
              label="Custom Amount (₹)"
              type="number"
              placeholder="Enter amount (₹10 – ₹50,000)"
              error={errors.amount?.message}
              {...register('amount')}
            />
            <Input
              label="Description (optional)"
              placeholder="e.g. Monthly top-up"
              error={errors.description?.message}
              {...register('description')}
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
              icon={Wallet}
            >
              {loading ? 'Processing...' : `Add ₹${Number(currentAmount) > 0 ? Number(currentAmount).toLocaleString('en-IN') : '–'} to Wallet`}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            Funds are added instantly. No real transaction occurs in demo mode.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
