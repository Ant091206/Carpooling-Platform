import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpCircle, History, TrendingUp, CreditCard, RefreshCw, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import PageShell from '../../components/shared/PageShell.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useWallet } from '../../context/WalletContext.jsx';
import { walletAPI } from '../../services/api.js';

const TXN_ICONS = {
  RECHARGE:     { icon: '↑', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  RIDE_PAYMENT: { icon: '↓', color: 'text-red-500',     bg: 'bg-red-50'     },
  REFUND:       { icon: '↑', color: 'text-sky-600',     bg: 'bg-sky-50'     },
  ADJUSTMENT:   { icon: '~', color: 'text-amber-600',   bg: 'bg-amber-50'   },
  REWARD:       { icon: '★', color: 'text-purple-600',  bg: 'bg-purple-50'  },
};

export default function WalletDashboard() {
  const { wallet, transactions, loading, txnLoading, fetchWallet, fetchTransactions } = useWallet();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchWallet();
    fetchTransactions(1, 5); // Recent 5
  }, [fetchWallet, fetchTransactions]);

  const handleCreateWallet = async () => {
    setCreating(true);
    try {
      await walletAPI.create();
      await fetchWallet();
      toast.success('Wallet created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create wallet.');
    } finally {
      setCreating(false);
    }
  };

  // Derived stats
  const totalRecharged = transactions
    .filter((t) => t.transactionType === 'RECHARGE')
    .reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalSpent = transactions
    .filter((t) => t.transactionType === 'RIDE_PAYMENT')
    .reduce((s, t) => s + parseFloat(t.amount), 0);

  return (
    <PageShell
      eyebrow="Module 10"
      title="My Wallet"
      description="Manage your enterprise wallet — recharge, pay for rides, and track every transaction."
      action={
        <Button as={Link} to="/wallet/recharge" icon={Plus}>
          Recharge Wallet
        </Button>
      }
    >
      {/* ─── Hero Balance Card ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {loading ? (
          <WalletSkeleton />
        ) : !wallet ? (
          <Card className="flex flex-col items-center gap-6 py-14 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
              <Wallet className="h-10 w-10 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-extrabold text-slate-900">
                No wallet yet
              </h2>
              <p className="mt-2 text-slate-500">
                Create your enterprise wallet to start paying for rides instantly.
              </p>
            </div>
            <Button loading={creating} onClick={handleCreateWallet} size="lg" icon={Wallet}>
              Create Wallet
            </Button>
          </Card>
        ) : (
          <div
            className="relative overflow-hidden rounded-3xl p-8 text-white"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
              boxShadow: '0 25px 50px -12px rgba(5,150,105,0.4)',
            }}
          >
            {/* Decorative circles */}
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -right-8 h-48 w-48 rounded-full bg-white/5" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-100 uppercase tracking-widest">
                    Enterprise Wallet
                  </p>
                  <p className="text-xs text-emerald-200">
                    {wallet.status}
                  </p>
                </div>
              </div>

              <p className="text-5xl font-extrabold tracking-tight">
                ₹{parseFloat(wallet.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-2 text-emerald-100 font-medium">Available Balance</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  as={Link}
                  to="/wallet/recharge"
                  className="!bg-white !text-emerald-700 hover:!bg-emerald-50"
                  icon={ArrowUpCircle}
                >
                  Recharge
                </Button>
                <Button
                  as={Link}
                  to="/wallet/history"
                  variant="ghost"
                  className="!text-white hover:!bg-white/10"
                  icon={History}
                >
                  History
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* ─── Stats Row ────────────────────────────────────────── */}
      {wallet && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={TrendingUp} label="Total Recharged" value={`₹${totalRecharged.toLocaleString('en-IN')}`} color="emerald" />
          <StatCard icon={CreditCard} label="Total Spent"     value={`₹${totalSpent.toLocaleString('en-IN')}`}     color="red" />
          <StatCard icon={History}    label="Transactions"    value={transactions.length}                           color="sky" />
          <StatCard icon={Wallet}     label="Wallet Status"   value={wallet.status}                                 color="amber" />
        </div>
      )}

      {/* ─── Quick Actions ───────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <ActionLink to="/wallet/recharge" icon={ArrowUpCircle} label="Recharge Wallet"    desc="Top up your balance" color="emerald" />
        <ActionLink to="/payment"         icon={CreditCard}    label="Pay for Ride"        desc="Pay after trip completion" color="sky" />
        <ActionLink to="/wallet/history"  icon={History}       label="Transaction History" desc="Full audit trail" color="purple" />
      </div>

      {/* ─── Recent Transactions ─────────────────────────────── */}
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-xl font-extrabold text-slate-900">Recent Transactions</h2>
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={() => fetchTransactions(1, 5)}
            loading={txnLoading}
          >
            Refresh
          </Button>
        </div>

        {txnLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState message="No transactions yet. Recharge your wallet to get started." />
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((txn) => {
              const meta = TXN_ICONS[txn.transactionType] || TXN_ICONS.ADJUSTMENT;
              const isCredit = ['RECHARGE', 'REFUND', 'REWARD'].includes(txn.transactionType);
              return (
                <div
                  key={txn.id}
                  className="flex items-center gap-4 rounded-2xl bg-slate-50 px-4 py-3 hover:bg-emerald-50/40 transition"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${meta.bg} ${meta.color} text-lg font-extrabold`}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">
                      {txn.description || txn.transactionType.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-extrabold ${isCredit ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isCredit ? '+' : '-'}₹{parseFloat(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <Badge tone={isCredit ? 'green' : 'red'} className="text-[10px]">
                      {txn.transactionType.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {transactions.length > 0 && (
          <div className="mt-4 text-center">
            <Button as={Link} to="/wallet/history" variant="secondary" size="sm">
              View All Transactions
            </Button>
          </div>
        )}
      </Card>
    </PageShell>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-700',
    red:     'bg-red-50 text-red-600',
    sky:     'bg-sky-50 text-sky-700',
    amber:   'bg-amber-50 text-amber-700',
    purple:  'bg-purple-50 text-purple-700',
  };
  return (
    <Card className="p-5">
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </Card>
  );
}

function ActionLink({ to, icon: Icon, label, desc, color }) {
  const colors = {
    emerald: 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100',
    sky:     'text-sky-600 bg-sky-50 group-hover:bg-sky-100',
    purple:  'text-purple-600 bg-purple-50 group-hover:bg-purple-100',
  };
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-3xl border border-emerald-100 bg-white p-5 shadow-md shadow-emerald-900/5 hover:border-emerald-200 hover:shadow-lg transition-all"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${colors[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="font-bold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </Link>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 text-center">
      <p className="font-semibold text-slate-500">{message}</p>
    </div>
  );
}

function WalletSkeleton() {
  return (
    <div className="h-52 animate-pulse rounded-3xl bg-gradient-to-r from-emerald-200 to-emerald-100" />
  );
}
