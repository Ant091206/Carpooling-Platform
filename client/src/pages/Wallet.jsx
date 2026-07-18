import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Plus,
  Wallet as WalletIcon,
  Clock,
  ChevronRight,
  IndianRupee,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { walletAPI } from '../services/api.js';

const rechargeSchema = z.object({
  amount: z.coerce
    .number()
    .min(100, 'Minimum top-up is ₹100')
    .max(50000, 'Maximum top-up is ₹50,000'),
});

const TX_ICONS = {
  DEBIT:  { icon: ArrowUpRight,   tone: 'red',   label: 'Debit',  sign: '-' },
  CREDIT: { icon: ArrowDownLeft,  tone: 'green', label: 'Credit', sign: '+' },
  REFUND: { icon: RotateCcw,      tone: 'blue',  label: 'Refund', sign: '+' },
};

function formatINR(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(parseFloat(value || 0));
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr));
}

export default function Wallet() {
  const { user } = useAuth();
  const [wallet, setWallet]               = useState(null);
  const [transactions, setTransactions]   = useState([]);
  const [txMeta, setTxMeta]               = useState({ total: 0, totalPages: 1, page: 1 });
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingTx, setLoadingTx]         = useState(true);
  const [open, setOpen]                   = useState(false);
  const [topping, setTopping]             = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(rechargeSchema),
  });

  const fetchWallet = useCallback(async () => {
    setLoadingWallet(true);
    try {
      const { data } = await walletAPI.get();
      setWallet(data.data);
    } catch (e) {
      toast.error('Could not load wallet balance.');
    } finally {
      setLoadingWallet(false);
    }
  }, []);

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoadingTx(true);
    try {
      const { data } = await walletAPI.transactions({ page, limit: 5 });
      const payload = data.data;
      setTransactions(payload.records || []);
      setTxMeta({ total: payload.total, totalPages: payload.totalPages, page: payload.page });
    } catch (e) {
      toast.error('Could not load transactions.');
    } finally {
      setLoadingTx(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, [fetchWallet, fetchTransactions]);

  const handleTopUp = async (data) => {
    setTopping(true);
    try {
      const res = await walletAPI.topup({ amount: parseFloat(data.amount) });
      toast.success(`Wallet credited with ${formatINR(data.amount)}!`);
      setOpen(false);
      reset();
      await fetchWallet();
      await fetchTransactions();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Top-up failed. Please try again.');
    } finally {
      setTopping(false);
    }
  };

  const totalCredit = transactions
    .filter(t => (t.type === 'CREDIT' || t.type === 'REFUND') && t.receiverId === user?.id)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalDebit = transactions
    .filter(t => t.type === 'DEBIT' && t.senderId === user?.id)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return (
    <PageShell
      eyebrow="Payments"
      title="Wallet & Payments"
      description="Manage your commute credits, view your transaction history, and top-up your corporate wallet."
      action={
        <Button icon={Plus} onClick={() => setOpen(true)} id="btn-topup-wallet">
          Top Up Wallet
        </Button>
      }
    >
      {/* ── Balance Cards ─────────────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-3">
        {/* Main Balance */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="sm:col-span-2"
        >
          <Card className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-7 text-white shadow-xl">
            {/* Decorative blob */}
            <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-emerald-500/20 blur-xl" />

            <p className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-200">
              <WalletIcon className="h-4 w-4" />
              Corporate Wallet Balance
            </p>
            <h2 className="relative mt-4 text-5xl font-extrabold tracking-tight">
              {loadingWallet
                ? <span className="animate-pulse text-3xl">Loading…</span>
                : formatINR(wallet?.balance ?? 0)
              }
            </h2>
            <p className="relative mt-3 text-sm text-emerald-100">
              Credits are used for ride bookings & instant driver settlements.
            </p>

            <div className="relative mt-6 flex items-center gap-3">
              <button
                onClick={fetchWallet}
                className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
                id="btn-refresh-wallet"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50"
                id="btn-quick-topup"
              >
                <Plus className="h-3.5 w-3.5" /> Top Up
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Stats */}
        <div className="flex flex-col gap-5">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="flex items-center gap-4 rounded-2xl bg-emerald-50 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <ArrowDownLeft className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Credits</p>
                <p className="mt-0.5 text-xl font-extrabold text-emerald-700">{formatINR(totalCredit)}</p>
              </div>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="flex items-center gap-4 rounded-2xl bg-red-50 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <ArrowUpRight className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Debits</p>
                <p className="mt-0.5 text-xl font-extrabold text-red-600">{formatINR(totalDebit)}</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ── Recent Transactions ────────────────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900">Recent Transactions</h2>
          <Link
            to="/wallet/transactions"
            id="link-all-transactions"
            className="flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <Card className="divide-y divide-slate-100 rounded-2xl bg-white p-0">
          {loadingTx ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                  </div>
                  <div className="h-5 w-20 animate-pulse rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-14 text-slate-400">
              <Clock className="h-10 w-10" />
              <p className="font-semibold">No transactions yet</p>
              <p className="text-sm">Top-up your wallet or book a ride to see activity here.</p>
            </div>
          ) : (
            <AnimatePresence>
              {transactions.map((tx, i) => {
                const isDebit  = tx.type === 'DEBIT' && tx.senderId === user?.id;
                const meta     = TX_ICONS[tx.type] || TX_ICONS.CREDIT;
                const Icon     = meta.icon;
                const tone     = isDebit ? 'red' : meta.tone;
                const sign     = isDebit ? '-' : '+';

                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      to={`/wallet/transactions/${tx.id}`}
                      id={`tx-row-${tx.id}`}
                      className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
                    >
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        isDebit ? 'bg-red-50 text-red-600' : tx.type === 'REFUND' ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {tx.description || `${meta.label} transaction`}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">{formatDate(tx.createdAt)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-extrabold ${isDebit ? 'text-red-600' : 'text-emerald-700'}`}>
                          {sign}{formatINR(tx.amount)}
                        </p>
                        <Badge tone={tone} className="mt-1">{meta.label}</Badge>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </Card>
      </div>

      {/* ── Top-Up Modal ───────────────────────────────────────────── */}
      <Modal open={open} onClose={() => { setOpen(false); reset(); }} title="Top Up Wallet">
        <form onSubmit={handleSubmit(handleTopUp)} className="space-y-5 pt-1">
          <div className="rounded-2xl bg-emerald-50 p-4 text-center">
            <IndianRupee className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
            <p className="text-sm text-slate-600">Add funds to your corporate wallet to book rides instantly.</p>
          </div>

          <Input
            id="topup-amount"
            label="Amount (INR)"
            type="number"
            placeholder="e.g. 1000"
            error={errors.amount?.message}
            {...register('amount')}
          />

          <div className="flex flex-wrap gap-2">
            {[500, 1000, 2000, 5000].map(preset => (
              <button
                key={preset}
                type="button"
                id={`preset-${preset}`}
                onClick={() => reset({ amount: preset })}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
              >
                ₹{preset.toLocaleString()}
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-500">
            Minimum ₹100 · Maximum ₹50,000 per transaction. Secured via corporate merchant escrow.
          </p>

          <Button
            id="btn-confirm-topup"
            type="submit"
            loading={topping}
            className="w-full"
            size="lg"
            icon={TrendingUp}
          >
            Top Up Now
          </Button>
        </form>
      </Modal>
    </PageShell>
  );
}
