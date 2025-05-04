import { useState, useEffect } from "react";
import { walletService } from "../services/wallet.service";
import { useAppContext } from "../AppContext";

export function useWallet() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { 
        userId, 
        wallet, setWallet,
        debits, setDebits,
        credits, setCredits
    } = useAppContext();
    const [transactions, setTransactions] = useState([]);

    const fetchWallet = async () => {
        if (!userId) return null;

        setLoading(true);
        try {
            const walletData = await walletService.fetchWallet(userId);
            setWallet(walletData);
            setError(null);
            return walletData;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const fetchDebits = async () => {
        if (!userId) return [];

        setLoading(true);
        try {
            const debitsData = await walletService.fetchDebits(userId);
            setDebits(debitsData);
            setError(null);
            return debitsData;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const fetchCredits = async () => {
        if (!userId) return [];

        setLoading(true);
        try {
            const creditsData = await walletService.fetchCredits(userId);
            setCredits(creditsData);
            setError(null);
            return creditsData;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const getBalance = () => {
        if (!wallet) return 0;
        
        // Ensure debits and credits are arrays before using reduce
        const safeDebits = Array.isArray(debits) ? debits : [];
        const safeCredits = Array.isArray(credits) ? credits : [];
        
        const totalDebits = safeDebits.reduce((acc, debit) => acc + debit.amount, 0);
        const totalCredits = safeCredits.reduce((acc, credit) => acc + credit.amount, 0);
        
        return wallet.balance - totalDebits + totalCredits;
    }

    const getSpentToday = () => {
        if (!debits) return 0;
        
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const totalSpentToday = debits.reduce((acc, debit) => {
            const debitDate = new Date(debit.logged_at).toISOString().split('T')[0];
            return debitDate === today ? acc + debit.amount : acc;
        }, 0);
        return totalSpentToday;
    }

    const addTransaction = async (transaction) => {
        const { data, error } = await walletService.addTransaction(transaction);
        if (error) {
            console.error("Error adding transaction:", error);
            return { success: false };
        }
        if (data && data.length > 0) {
            if (transaction.type) {
                setDebits((prevDebits) => [...(Array.isArray(prevDebits) ? prevDebits : []), ...data]);
            } else {
                setCredits((prevCredits) => [...(Array.isArray(prevCredits) ? prevCredits : []), ...data]);
            }
        }
        return { success: true };
    };

    const deleteTransaction = async (transactionId) => {
        const result = await walletService.deleteTransaction(transactionId);
        if (result.success) {
            await fetchDebits();
            await fetchCredits();
        }
        return result;
    }

    useEffect(() => {
        if (userId) {
            fetchWallet();
            fetchDebits();
            fetchCredits();
        }
    }, [userId]);

    return {
        wallet,
        debits,
        credits,
        loading,
        error,
        fetchWallet,
        fetchDebits,
        fetchCredits,
        getBalance,
        getSpentToday,
        addTransaction,
        deleteTransaction
    };
}   