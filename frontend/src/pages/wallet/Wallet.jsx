import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Wallet as WalletIcon, ArrowUpRight, ArrowDownRight,
  Plus, RefreshCw, CreditCard
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Skeleton } from '../../components/Skeleton';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { carpoolAPI } from '../../services/api';

function TransactionRow({ transaction }) {
  const isCredit = transaction.type === 'Recharge' || transaction.type === 'Refund';
  const typeLabels = {
    Recharge: 'Wallet Top Up',
    Payment: 'Ride Payment',
    Refund: 'Refund',
  };

  const formattedDate = transaction.created_at
    ? new Date(transaction.created_at).toLocaleString([], {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'N/A';

  return (
    <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isCredit ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {isCredit ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
        </div>
        <div>
          <h4 className="font-medium text-slate-900 text-sm">
            {typeLabels[transaction.type] || transaction.type}
            {transaction.description ? ` — ${transaction.description}` : ''}
          </h4>
          <p className="text-xs text-slate-400">{formattedDate}</p>
        </div>
      </div>
      <div className="text-right">
        <div className={`font-semibold text-sm ${isCredit ? 'text-green-600' : 'text-slate-900'}`}>
          {isCredit ? '+' : '-'}₹{Math.abs(transaction.amount)}
        </div>
        <div className="text-xs text-slate-400">Bal: ₹{transaction.balance_after}</div>
      </div>
    </div>
  );
}

function TopUpModal({ isOpen, onClose, onSuccess }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const QUICK_AMOUNTS = [100, 250, 500, 1000];

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await carpoolAPI.topUpWallet({ amount: parseFloat(data.amount) });
      toast.success(`₹${data.amount} added to your wallet!`);
      reset();
      onClose();
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Top up failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Top Up Wallet</h3>
        <p className="text-sm text-slate-500 mb-5">Add funds to your wallet for seamless ride payments.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  const amountInput = document.getElementById('topup-amount');
                  if (amountInput) amountInput.value = amount;
                }}
                className="py-2 text-sm font-medium rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 transition-colors text-slate-700"
              >
                ₹{amount}
              </button>
            ))}
          </div>

          <Input
            id="topup-amount"
            label="Amount (₹)"
            type="number"
            placeholder="Enter amount"
            min={10}
            error={errors.amount?.message}
            {...register('amount', {
              required: 'Amount is required',
              min: { value: 10, message: 'Minimum top up is ₹10' },
              max: { value: 10000, message: 'Maximum top up is ₹10,000' },
            })}
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={loading} className="flex-1 gap-2">
              <Plus className="w-4 h-4" />
              Add Funds
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [walletLoading, setWalletLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [walletError, setWalletError] = useState(null);
  const [showTopUp, setShowTopUp] = useState(false);

  const fetchWallet = useCallback(async () => {
    setWalletLoading(true);
    setWalletError(null);
    try {
      const res = await carpoolAPI.getWallet();
      setWallet(res.data?.data || res.data);
    } catch (err) {
      setWalletError(err.response?.data?.message || 'Failed to load wallet.');
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const res = await carpoolAPI.getTransactions();
      setTransactions(res.data?.data || res.data || []);
    } catch {
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, [fetchWallet, fetchTransactions]);

  const onTopUpSuccess = () => {
    fetchWallet();
    fetchTransactions();
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Wallet & Payments</h1>
          <p className="text-slate-500">Manage your balance and view transaction history.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Balance Card */}
          <Card className="bg-primary-900 text-white border-none shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div className="p-2 rounded-lg bg-primary-800">
                <WalletIcon className="w-6 h-6 text-primary-300" />
              </div>
              <span className="text-sm font-medium text-primary-300">Available Balance</span>
            </div>
            {walletLoading ? (
              <div className="space-y-2 mb-6">
                <Skeleton className="h-9 w-32 bg-primary-700" />
                <Skeleton className="h-3 w-24 bg-primary-800" />
              </div>
            ) : walletError ? (
              <div className="mb-6">
                <p className="text-red-300 text-sm">{walletError}</p>
              </div>
            ) : (
              <div className="mb-6">
                <div className="text-4xl font-bold mb-1">₹{wallet?.balance?.toFixed(2) || '0.00'}</div>
                <p className="text-primary-300 text-sm">
                  Last updated: {wallet?.updated_at ? new Date(wallet.updated_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            )}
            <Button
              className="w-full bg-primary-500 hover:bg-primary-400 text-white border-none gap-2"
              onClick={() => setShowTopUp(true)}
            >
              <Plus className="w-4 h-4" /> Top Up Wallet
            </Button>
          </Card>

          {/* Transactions */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Transaction History</h2>
              <button
                onClick={() => { fetchWallet(); fetchTransactions(); }}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {txLoading ? (
              <Card className="p-0 overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-4 flex items-center gap-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </Card>
            ) : transactions.length === 0 ? (
              <Card>
                <EmptyState
                  icon={CreditCard}
                  title="No transactions yet"
                  description="Your transaction history will appear here once you top up or make payments."
                />
              </Card>
            ) : (
              <Card className="p-0 overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <TransactionRow key={tx.id} transaction={tx} />
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <TopUpModal
        isOpen={showTopUp}
        onClose={() => setShowTopUp(false)}
        onSuccess={onTopUpSuccess}
      />
    </>
  );
}
