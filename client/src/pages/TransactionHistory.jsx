import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Filter, RotateCcw } from 'lucide-react';
import PageShell from '../components/shared/PageShell.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import { walletAPI } from '../services/api.js';

const icons = { DEBIT: ArrowUpRight, CREDIT: ArrowDownLeft, REFUND: RotateCcw };
const money = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(v || 0));

export default function TransactionHistory() {
  const [rows, setRows] = useState([]);
  const [type, setType] = useState('ALL');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    walletAPI.transactions({ limit: 100, sort, ...(type !== 'ALL' ? { type } : {}) })
      .then(({ data }) => setRows(data.data?.records || []))
      .catch((e) => toast.error(e?.response?.data?.message || 'Could not load transactions.'))
      .finally(() => setLoading(false));
  }, [type, sort]);
  const totals = useMemo(() => rows.reduce((acc, tx) => { acc[tx.type] = (acc[tx.type] || 0) + Number(tx.amount || 0); return acc; }, {}), [rows]);
  return <PageShell eyebrow="Wallet" title="Transaction History" description="Filter, sort, and inspect all wallet debits, credits, and refunds."><div className="grid gap-4 sm:grid-cols-3"><Stat label="Credits" value={money(totals.CREDIT)} /><Stat label="Debits" value={money(totals.DEBIT)} /><Stat label="Refunds" value={money(totals.REFUND)} /></div><Card className="space-y-5"><div className="flex flex-wrap items-center gap-3"><Filter className="h-5 w-5 text-emerald-700" /><select value={type} onChange={(e) => setType(e.target.value)} className="rounded-2xl border border-emerald-100 px-4 py-2 text-sm font-bold"><option>ALL</option><option>DEBIT</option><option>CREDIT</option><option>REFUND</option></select><select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-2xl border border-emerald-100 px-4 py-2 text-sm font-bold"><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></div>{loading ? <p className="text-slate-500">Loading transactions...</p> : <div className="divide-y divide-emerald-100">{rows.length === 0 && <p className="py-8 text-center text-slate-500">No transactions found.</p>}{rows.map((tx) => <TxRow key={tx.id} tx={tx} />)}</div>}</Card></PageShell>;
}
function Stat({ label, value }) { return <Card><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 font-heading text-2xl font-extrabold text-slate-950">{value}</p></Card>; }
function TxRow({ tx }) { const Icon = icons[tx.type] || ArrowDownLeft; return <Link to={`/wallet/transactions/${tx.id}`} className="flex items-center gap-4 py-4 hover:bg-emerald-50/50"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Icon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="truncate font-bold text-slate-900">{tx.description || `${tx.type} transaction`}</p><p className="text-sm text-slate-500">{new Date(tx.createdAt).toLocaleString()}</p></div><Badge tone={tx.type === 'DEBIT' ? 'red' : tx.type === 'REFUND' ? 'blue' : 'green'}>{tx.status}</Badge><p className="font-heading text-lg font-extrabold text-slate-950">{money(tx.amount)}</p><ChevronRight className="h-4 w-4 text-slate-400" /></Link>; }
