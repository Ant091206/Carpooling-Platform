import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RefreshCw, CreditCard, Search, Eye } from 'lucide-react';
import PageShell from '../../components/shared/PageShell.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useWallet } from '../../context/WalletContext.jsx';

const METHOD_BADGES = {
  WALLET:   { tone: 'green',  label: 'Wallet'   },
  CASH:     { tone: 'amber',  label: 'Cash'     },
  UPI:      { tone: 'blue',   label: 'UPI'      },
  RAZORPAY: { tone: 'green',  label: 'Razorpay' },
};

export default function PaymentHistory() {
  const { payments, payLoading, fetchPayments } = useWallet();
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchPayments(page, 20); }, [page, fetchPayments]);

  const filtered = payments.filter((p) =>
    !search ||
    String(p.id).includes(search) ||
    String(p.bookingId).includes(search) ||
    p.transactionReference?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageShell
      eyebrow="Payments"
      title="Payment History"
      description="All your ride payments in one place."
      action={
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={payLoading}
          onClick={() => fetchPayments(page, 20)}
        >
          Refresh
        </Button>
      }
    >
      <Card className="p-0 overflow-hidden">
        {/* Search Bar */}
        <div className="flex items-center gap-3 border-b border-slate-100 p-5">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by payment ID, booking, or reference…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {payLoading ? (
          <div className="space-y-2 p-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CreditCard className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="font-semibold text-slate-400">No payments yet.</p>
            <p className="text-sm text-slate-400 mt-1">
              Payments appear after you complete a ride.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-5 py-3 font-bold text-slate-500">Date</th>
                  <th className="px-5 py-3 font-bold text-slate-500">Trip</th>
                  <th className="px-5 py-3 font-bold text-slate-500">Method</th>
                  <th className="px-5 py-3 font-bold text-slate-500 text-right">Amount</th>
                  <th className="px-5 py-3 font-bold text-slate-500">Status</th>
                  <th className="px-5 py-3 font-bold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((payment, i) => {
                  const methodMeta = METHOD_BADGES[payment.paymentMethod] || { tone: 'slate', label: payment.paymentMethod };
                  return (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-emerald-50/30 transition"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-medium text-slate-700">
                          {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(payment.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {payment.booking?.ride?.pickupName || '—'} → {payment.booking?.ride?.destinationName || '—'}
                        </p>
                        <p className="text-xs text-slate-400">Booking #{payment.bookingId}</p>
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={methodMeta.tone}>{methodMeta.label}</Badge>
                      </td>
                      <td className="px-5 py-4 text-right font-extrabold text-slate-900">
                        ₹{parseFloat(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          tone={
                            payment.status === 'SUCCESS'  ? 'green' :
                            payment.status === 'REFUNDED' ? 'blue'  :
                            payment.status === 'FAILED'   ? 'red'   : 'amber'
                          }
                        >
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Button
                          as={Link}
                          to={`/payment/${payment.id}`}
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                        >
                          View
                        </Button>
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
          <p className="text-sm text-slate-500">{filtered.length} payment(s)</p>
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
