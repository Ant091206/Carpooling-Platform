import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, RotateCcw, Download, ArrowLeft, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import PageShell from '../../components/shared/PageShell.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { paymentsAPI } from '../../services/api.js';

const STATUS_META = {
  SUCCESS:  { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Paid' },
  PENDING:  { icon: Clock,       color: 'text-amber-600',   bg: 'bg-amber-100',   label: 'Pending' },
  FAILED:   { icon: XCircle,     color: 'text-red-600',     bg: 'bg-red-100',     label: 'Failed' },
  REFUNDED: { icon: RotateCcw,   color: 'text-sky-600',     bg: 'bg-sky-100',     label: 'Refunded' },
};

export default function PaymentDetails() {
  const { id } = useParams();
  const [payment, setPayment]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refunding, setRefund]  = useState(false);

  useEffect(() => {
    paymentsAPI
      .getById(parseInt(id, 10))
      .then((res) => setPayment(res.data.data))
      .catch(() => toast.error('Payment not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRefund = async () => {
    if (!window.confirm('Are you sure you want to request a refund for this payment?')) return;
    setRefund(true);
    try {
      const res = await paymentsAPI.refund(payment.id);
      setPayment((prev) => ({ ...prev, status: 'REFUNDED' }));
      toast.success(res.data.message || 'Refund initiated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refund failed.');
    } finally {
      setRefund(false);
    }
  };

  if (loading) {
    return (
      <PageShell title="Payment Details">
        <div className="mx-auto max-w-lg space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </PageShell>
    );
  }

  if (!payment) {
    return (
      <PageShell title="Payment Not Found">
        <Card className="mx-auto max-w-md py-16 text-center">
          <p className="text-slate-500">This payment does not exist or you do not have access.</p>
          <Button as={Link} to="/payment/history" variant="secondary" className="mt-4">
            Back to History
          </Button>
        </Card>
      </PageShell>
    );
  }

  const meta   = STATUS_META[payment.status] || STATUS_META.PENDING;
  const Icon   = meta.icon;
  const amount = parseFloat(payment.amount);

  return (
    <PageShell
      eyebrow="Payments"
      title="Payment Details"
      action={
        <Button as={Link} to="/payment/history" variant="secondary" size="sm" icon={ArrowLeft}>
          Back
        </Button>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg space-y-5"
      >
        {/* ── Status Banner ── */}
        <Card className={`flex flex-col items-center gap-3 py-10 text-center`}>
          <div className={`flex h-20 w-20 items-center justify-center rounded-full ${meta.bg}`}>
            <Icon className={`h-10 w-10 ${meta.color}`} />
          </div>
          <div>
            <p className="font-heading text-3xl font-extrabold text-slate-900">
              ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <Badge
              tone={payment.status === 'SUCCESS' ? 'green' : payment.status === 'REFUNDED' ? 'blue' : payment.status === 'FAILED' ? 'red' : 'amber'}
              className="mt-2 text-sm px-4 py-1"
            >
              {meta.label}
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            {payment.paymentMethod} payment
            {payment.paidAt && ` · ${new Date(payment.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`}
          </p>
        </Card>

        {/* ── Invoice Details ── */}
        <Card className="space-y-0 p-0 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
            <p className="font-bold text-slate-600 text-sm">Payment Reference</p>
          </div>
          <div className="px-5 divide-y divide-slate-50">
            <DetailRow label="Reference #"    value={payment.transactionReference || '—'} mono />
            <DetailRow label="Payment ID"     value={`#${payment.id}`} />
            <DetailRow label="Booking ID"     value={`#${payment.bookingId}`} />
            <DetailRow label="Method"         value={payment.paymentMethod} />
            <DetailRow label="Amount"         value={`₹${amount.toFixed(2)}`} bold />
            <DetailRow label="Status"         value={<Badge tone={payment.status === 'SUCCESS' ? 'green' : 'amber'}>{payment.status}</Badge>} />
            {payment.paidAt && (
              <DetailRow
                label="Paid At"
                value={new Date(payment.paidAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
              />
            )}
            <DetailRow label="Created"
              value={new Date(payment.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            />
          </div>
        </Card>

        {/* ── Trip Details ── */}
        {payment.booking?.ride && (
          <Card className="space-y-0 p-0 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
              <p className="font-bold text-slate-600 text-sm">Trip Details</p>
            </div>
            <div className="px-5 divide-y divide-slate-50">
              <DetailRow label="From"       value={payment.booking.ride.pickupName} />
              <DetailRow label="To"         value={payment.booking.ride.destinationName} />
              {payment.booking.ride.departureTime && (
                <DetailRow
                  label="Departure"
                  value={new Date(payment.booking.ride.departureTime).toLocaleString('en-IN')}
                />
              )}
            </div>
          </Card>
        )}

        {/* ── Parties ── */}
        <Card className="space-y-0 p-0 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
            <p className="font-bold text-slate-600 text-sm">Parties</p>
          </div>
          <div className="px-5 divide-y divide-slate-50">
            <DetailRow label="Paid by"      value={payment.payer?.name || '—'} />
            <DetailRow label="Received by"  value={payment.receiver?.name || '—'} />
          </div>
        </Card>

        {/* ── Actions ── */}
        <div className="flex gap-3">
          {payment.status === 'SUCCESS' && (
            <Button
              variant="secondary"
              loading={refunding}
              onClick={handleRefund}
              icon={RotateCcw}
              className="flex-1"
            >
              Request Refund
            </Button>
          )}
          <Button
            variant="ghost"
            icon={CreditCard}
            as={Link}
            to="/payment/history"
            className="flex-1"
          >
            All Payments
          </Button>
        </div>
      </motion.div>
    </PageShell>
  );
}

function DetailRow({ label, value, mono, bold }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <span className="text-sm text-slate-500 font-medium">{label}</span>
      <span className={`text-sm text-right ${bold ? 'font-extrabold text-slate-900' : 'text-slate-700'} ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  );
}
