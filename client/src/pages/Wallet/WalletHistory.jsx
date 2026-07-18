import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, RefreshCw, Download } from 'lucide-react';
import PageShell from '../../components/shared/PageShell.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useWallet } from '../../context/WalletContext.jsx';

const TYPE_OPTIONS = ['ALL', 'RECHARGE', 'RIDE_PAYMENT', 'REFUND', 'ADJUSTMENT', 'REWARD'];

const TYPE_BADGES = {
  RECHARGE:     { tone: 'green',  label: 'Recharge'     },
  RIDE_PAYMENT: { tone: 'red',    label: 'Ride Payment'  },
  REFUND:       { tone: 'blue',   label: 'Refund'        },
  ADJUSTMENT:   { tone: 'amber',  label: 'Adjustment'    },
  REWARD:       { tone: 'green',  label: 'Reward'        },
};

export default function WalletHistory() {
  const { transactions, txnLoading, fetchTransactions, wallet } = useWallet();
  const [search, setSearch]     = useState('');
  const [typeFilter, setFilter] = useState('ALL');
  const [page, setPage]         = useState(1);

  useEffect(() => { fetchTransactions(page, 20); }, [page, fetchTransactions]);

  const filtered = transactions.filter((t) => {
    const matchType = typeFilter === 'ALL' || t.transactionType === typeFilter;
    const matchSearch =
      !search ||
      t.referenceNo?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <PageShell
      eyebrow="Wallet"
      title="Transaction History"
      description="Full audit trail of all your wallet transactions."
      action={
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={txnLoading}
          onClick={() => fetchTransactions(page, 20)}
        >
          Refresh
        </Button>
      }
    >
      {/* Current Balance Banner */}
      {wallet && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-5 py-4 flex items-center justify-between">
          <p className="text-sm font-bold text-emerald-800">Available Balance</p>
          <p className="text-2xl font-extrabold text-emerald-700">
            ₹{parseFloat(wallet.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-5">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by reference or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-400"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {txnLoading ? (
          <div className="space-y-2 p-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-semibold text-slate-400">No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-5 py-3 font-bold text-slate-500">Date</th>
                  <th className="px-5 py-3 font-bold text-slate-500">Reference</th>
                  <th className="px-5 py-3 font-bold text-slate-500">Type</th>
                  <th className="px-5 py-3 font-bold text-slate-500">Description</th>
                  <th className="px-5 py-3 font-bold text-slate-500 text-right">Amount</th>
                  <th className="px-5 py-3 font-bold text-slate-500 text-right">Balance After</th>
                  <th className="px-5 py-3 font-bold text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((txn, i) => {
                  const badge = TYPE_BADGES[txn.transactionType] || { tone: 'slate', label: txn.transactionType };
                  const isCredit = ['RECHARGE', 'REFUND', 'REWARD'].includes(txn.transactionType);
                  return (
                    <motion.tr
                      key={txn.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-emerald-50/30 transition"
                    >
                      <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                        {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                        <br />
                        <span className="text-xs text-slate-400">
                          {new Date(txn.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">{txn.referenceNo}</td>
                      <td className="px-5 py-4">
                        <Badge tone={badge.tone}>{badge.label}</Badge>
                      </td>
                      <td className="px-5 py-4 text-slate-600 max-w-[180px] truncate">
                        {txn.description || '—'}
                      </td>
                      <td className={`px-5 py-4 text-right font-extrabold ${isCredit ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isCredit ? '+' : '-'}₹{parseFloat(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-slate-900">
                        ₹{parseFloat(txn.balanceAfter).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={txn.status === 'SUCCESS' ? 'green' : txn.status === 'FAILED' ? 'red' : 'amber'}>
                          {txn.status}
                        </Badge>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 p-4">
          <p className="text-sm text-slate-500">
            Showing {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
