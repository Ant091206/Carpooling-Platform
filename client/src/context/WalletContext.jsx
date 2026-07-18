import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { walletAPI, paymentsAPI } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';
import toast from 'react-hot-toast';

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [wallet, setWallet]               = useState(null);
  const [transactions, setTransactions]   = useState([]);
  const [payments, setPayments]           = useState([]);
  const [loading, setLoading]             = useState(false);
  const [txnLoading, setTxnLoading]       = useState(false);
  const [payLoading, setPayLoading]       = useState(false);

  // ─── Fetch Wallet ──────────────────────────────────────────
  const fetchWallet = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await walletAPI.get();
      setWallet(res.data.data);
    } catch (err) {
      // 404 means wallet doesn't exist yet — silently allow
      if (err.response?.status !== 404) {
        console.error('Wallet fetch error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // ─── Fetch Transactions ────────────────────────────────────
  const fetchTransactions = useCallback(async (page = 1, limit = 20) => {
    if (!isAuthenticated) return;
    setTxnLoading(true);
    try {
      const res = await walletAPI.transactions({ page, limit });
      setTransactions(res.data.data?.transactions || []);
    } catch (err) {
      console.error('Transaction fetch error:', err);
    } finally {
      setTxnLoading(false);
    }
  }, [isAuthenticated]);

  // ─── Fetch Payment History ─────────────────────────────────
  const fetchPayments = useCallback(async (page = 1, limit = 20) => {
    if (!isAuthenticated) return;
    setPayLoading(true);
    try {
      const res = await paymentsAPI.getAll({ page, limit });
      setPayments(res.data.data?.payments || []);
    } catch (err) {
      console.error('Payment history fetch error:', err);
    } finally {
      setPayLoading(false);
    }
  }, [isAuthenticated]);

  // ─── Recharge ──────────────────────────────────────────────
  const recharge = useCallback(async (amount, description) => {
    const res = await walletAPI.recharge({ amount, description });
    const updated = res.data.data;
    setWallet(updated.wallet);
    // Prepend new transaction to local state
    setTransactions((prev) => [updated.transaction, ...prev]);
    return updated;
  }, []);

  // ─── Auto-load wallet when user logs in ───────────────────
  useEffect(() => {
    if (isAuthenticated) {
      fetchWallet();
    } else {
      setWallet(null);
      setTransactions([]);
      setPayments([]);
    }
  }, [isAuthenticated, fetchWallet]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        transactions,
        payments,
        loading,
        txnLoading,
        payLoading,
        fetchWallet,
        fetchTransactions,
        fetchPayments,
        recharge,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside <WalletProvider>');
  return ctx;
};

export default WalletContext;
