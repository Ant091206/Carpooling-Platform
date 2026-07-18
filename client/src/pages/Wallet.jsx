import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CreditCard, IndianRupee, Landmark, Plus, Wallet as WalletIcon } from 'lucide-react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';

const methods = [{ label: 'Cash', icon: IndianRupee }, { label: 'Card', icon: CreditCard }, { label: 'UPI', icon: Landmark }, { label: 'Wallet', icon: WalletIcon }];

export default function Wallet() {
  const [selected, setSelected] = useState('Wallet');
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const recharge = (data) => { toast.success(`Wallet recharged with INR ${data.amount}.`); setOpen(false); };
  return <PageShell eyebrow="Payments" title="Payment & Wallet" description="Choose a payment method, check balance, and recharge wallet credit." action={<Button icon={Plus} onClick={() => setOpen(true)}>Recharge</Button>}><div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"><Card className="bg-emerald-600 text-white"><p className="font-bold text-emerald-100">Wallet balance</p><h2 className="mt-4 font-heading text-5xl font-extrabold">INR 2,450</h2><p className="mt-5 text-emerald-50">Available for ride bookings, pending settlements, and driver payouts.</p></Card><Card className="space-y-5"><h3 className="font-heading text-2xl font-extrabold text-slate-950">Payment method</h3><div className="grid gap-3 sm:grid-cols-2">{methods.map(({ label, icon: Icon }) => <button key={label} onClick={() => setSelected(label)} className={`flex items-center gap-3 rounded-full border px-5 py-4 text-left font-bold transition ${selected === label ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-emerald-100 bg-white text-slate-700 hover:bg-emerald-50'}`}><Icon className="h-5 w-5" />{label}</button>)}</div></Card></div><Modal open={open} onClose={() => setOpen(false)} title="Recharge wallet"><form onSubmit={handleSubmit(recharge)} className="space-y-4"><Input label="Amount" type="number" placeholder="1000" error={errors.amount?.message} {...register('amount', { required: 'Amount is required', min: { value: 100, message: 'Minimum recharge is INR 100' } })} /><Button type="submit" className="w-full">Pay Securely</Button></form></Modal></PageShell>;
}
