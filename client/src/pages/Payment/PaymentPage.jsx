import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  CreditCard, Wallet, QrCode, Banknote, CheckCircle,
  Car, MapPin, Clock, Users, IndianRupee
} from 'lucide-react';
import PageShell from '../../components/shared/PageShell.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useWallet } from '../../context/WalletContext.jsx';
import { paymentsAPI, bookingsAPI } from '../../services/api.js';

const METHODS = [
  { id: 'WALLET',   icon: Wallet,    label: 'Enterprise Wallet', desc: 'Instant deduction from balance' },
  { id: 'CASH',     icon: Banknote,  label: 'Cash',              desc: 'Pay the driver directly' },
  { id: 'UPI',      icon: QrCode,    label: 'Demo UPI',          desc: 'Scan QR or use UPI ID' },
];

export default function PaymentPage() {
  const navigate         = useNavigate();
  const [searchParams]   = useSearchParams();
  const bookingId        = parseInt(searchParams.get('bookingId') || '0', 10);
  const { wallet, fetchWallet } = useWallet();

  const [booking, setBooking]           = useState(null);
  const [bookingLoading, setBookingLoad] = useState(true);
  const [method, setMethod]             = useState('WALLET');
  const [paying, setPaying]             = useState(false);
  const [paymentResult, setResult]      = useState(null);
  const [upiOpen, setUpiOpen]           = useState(false);

  // Load booking details
  useEffect(() => {
    if (!bookingId) return;
    setBookingLoad(true);
    bookingsAPI
      .getById(bookingId)
      .then((res) => setBooking(res.data.data))
      .catch(() => toast.error('Could not load booking details.'))
      .finally(() => setBookingLoad(false));
  }, [bookingId]);

  if (!bookingId) {
    return (
      <PageShell title="Ride Payment">
        <Card className="py-16 text-center">
          <p className="text-slate-500 font-semibold">
            No booking selected. Please navigate from your Trips page.
          </p>
        </Card>
      </PageShell>
    );
  }

  const farePerSeat  = parseFloat(booking?.ride?.farePerSeat || 0);
  const seats        = booking?.requestedSeats || 1;
  const totalFare    = farePerSeat * seats;
  const platformFee  = parseFloat((totalFare * 0.02).toFixed(2)); // 2% fee (illustrative)
  const totalPayable = parseFloat((totalFare + platformFee).toFixed(2));
  const walletBal    = parseFloat(wallet?.balance || 0);

  const handlePay = async () => {
    if (method === 'UPI') {
      setUpiOpen(true);
      return;
    }
    setPaying(true);
    try {
      const res = await paymentsAPI.create({ bookingId, paymentMethod: method });
      const data = res.data.data;
      setResult(data);
      await fetchWallet();
      toast.success(data.message || 'Payment successful!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  // UPI demo success
  const handleUpiPaid = async () => {
    setUpiOpen(false);
    setPaying(true);
    try {
      const res = await paymentsAPI.create({ bookingId, paymentMethod: 'UPI' });
      setResult(res.data.data);
      toast.success('UPI payment recorded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'UPI payment failed.');
    } finally {
      setPaying(false);
    }
  };

  if (paymentResult) {
    return (
      <PageShell eyebrow="Payment" title="Payment Complete">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto max-w-md"
        >
          <Card className="flex flex-col items-center gap-6 py-14 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-12 w-12 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-heading text-3xl font-extrabold text-slate-900">Payment Done!</h2>
              <p className="mt-2 text-slate-500">
                {paymentResult.message || `₹${totalFare.toFixed(2)} paid via ${method}.`}
              </p>
            </div>
            <Button onClick={() => navigate('/payment/history')} size="lg">View Payment History</Button>
          </Card>
        </motion.div>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow="Payments" title="Pay for Ride" description="Complete your ride payment after the trip is finished.">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* ── Left: Method selector ── */}
        <div className="space-y-6">
          <Card>
            <h2 className="mb-5 font-heading text-xl font-extrabold text-slate-900">
              Select Payment Method
            </h2>
            <div className="space-y-3">
              {METHODS.map((m) => {
                const Icon = m.icon;
                const isSelected = method === m.id;
                const isInsufficient = m.id === 'WALLET' && walletBal < totalPayable;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => !isInsufficient && setMethod(m.id)}
                    disabled={isInsufficient}
                    className={`w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-100 bg-white hover:border-emerald-200'
                    } ${isInsufficient ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{m.label}</p>
                      <p className="text-xs text-slate-500">
                        {m.id === 'WALLET'
                          ? isInsufficient
                            ? `Insufficient balance (₹${walletBal.toFixed(2)} available)`
                            : `Balance: ₹${walletBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                          : m.desc}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="h-5 w-5 rounded-full border-4 border-emerald-600 bg-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          <Button
            className="w-full"
            size="lg"
            loading={paying}
            disabled={bookingLoading || !booking}
            onClick={handlePay}
            icon={CreditCard}
          >
            {paying ? 'Processing Payment…' : `Pay ₹${totalPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })} via ${method}`}
          </Button>
        </div>

        {/* ── Right: Trip Summary ── */}
        <div className="space-y-4">
          <Card>
            <h2 className="mb-4 font-heading text-lg font-extrabold text-slate-900">
              Trip Summary
            </h2>
            {bookingLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-8 animate-pulse rounded-xl bg-slate-100" />)}
              </div>
            ) : booking ? (
              <div className="space-y-3 text-sm">
                <InfoRow icon={MapPin} label="From"     value={booking.ride?.pickupName} />
                <InfoRow icon={MapPin} label="To"       value={booking.ride?.destinationName} />
                <InfoRow icon={Clock}  label="Departure" value={booking.ride?.departureTime ? new Date(booking.ride.departureTime).toLocaleString('en-IN') : '—'} />
                <InfoRow icon={Users}  label="Seats"    value={`${booking.requestedSeats} seat(s)`} />
                <InfoRow icon={Car}    label="Status"   value={<Badge tone={booking.status === 'ACCEPTED' ? 'green' : 'amber'}>{booking.status}</Badge>} />

                <div className="mt-4 divide-y divide-slate-100 rounded-2xl bg-slate-50 p-4">
                  <FareRow label="Fare per seat"  value={`₹${farePerSeat.toFixed(2)}`} />
                  <FareRow label={`× ${seats} seat(s)`} value={`₹${totalFare.toFixed(2)}`} />
                  <FareRow label="Platform fee (2%)" value={`₹${platformFee.toFixed(2)}`} />
                  <FareRow label="Total Payable" value={`₹${totalPayable.toFixed(2)}`} bold />
                </div>
              </div>
            ) : (
              <p className="text-slate-500">Could not load trip details.</p>
            )}
          </Card>
        </div>
      </div>

      {/* ── UPI Demo Modal ── */}
      <AnimatePresence>
        {upiOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl text-center"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
                <QrCode className="h-10 w-10 text-slate-600" />
              </div>
              <h3 className="font-heading text-2xl font-extrabold text-slate-900">Demo UPI Payment</h3>
              <p className="mt-2 text-sm text-slate-500">
                Scan the QR or pay to the UPI ID below
              </p>
              <div className="mt-4 rounded-2xl bg-emerald-50 p-3">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">UPI ID</p>
                <p className="font-mono font-extrabold text-emerald-900">enterprisepool@upi</p>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                ₹{totalPayable.toFixed(2)}
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Button loading={paying} onClick={handleUpiPaid} className="w-full" icon={CheckCircle}>
                  I've Paid
                </Button>
                <Button variant="ghost" onClick={() => setUpiOpen(false)} className="w-full">
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
      <span className="font-bold text-slate-600 w-24 shrink-0">{label}</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
}

function FareRow({ label, value, bold }) {
  return (
    <div className={`flex justify-between py-2 text-sm ${bold ? 'font-extrabold text-slate-900 text-base border-t border-slate-200 pt-3 mt-1' : 'text-slate-600'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
