import './Finances.css';
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../AppContext';

import { useWallet } from '../../hooks/useWallet';

import Modal from '../../components/Modal';
import PieChart from '../../components/PieChart';

import { currencyMap } from '../../utils/currencyMap';

export default function Finances() {
    const { user } = useAppContext();
    const { wallet, debits, getBalance, getSpentToday, deleteTransaction } = useWallet();
    const balance = getBalance() || 0;
    const spentToday = getSpentToday() || 0;
    const budgetMax = wallet?.daily_budget || 0;
    const savingGoal = wallet?.savings_goal || 0;
    const [ currency, setCurrency ] = useState(user?.currency || '$');
    

    const [ isTransactionsOpen, setTransactionsOpen ] = useState(false);
    const pieWidth = window.innerWidth * 0.2;
    
    // Track active swipeable item
    const [activeSwipeId, setActiveSwipeId] = useState(null);
    
    // Calculate weekly savings stats
    const calculateWeeklySavings = () => {
        if (!debits || !budgetMax) return { current: 0, max: 0 };
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Calculate date 7 days ago
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        // Weekly budget target
        const weeklyBudgetTarget = budgetMax * 7;
        
        // Filter transactions from the last 7 days
        const recentTransactions = debits.filter(transaction => {
            const transactionDate = new Date(transaction.logged_at);
            return transactionDate >= sevenDaysAgo;
        });
        
        // Calculate total spent in the last 7 days
        const totalSpent = recentTransactions.reduce((sum, transaction) => {
            return sum + transaction.amount;
        }, 0);
        
        // Calculate the amount saved (what's left from the weekly budget)
        const saved = weeklyBudgetTarget - totalSpent;
        
        return {
            current: Math.max(0, saved), // Don't show negative savings
            max: weeklyBudgetTarget
        };
    };
    
    const weeklySavings = calculateWeeklySavings();
    
    // Close any open swipe when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeSwipeId && !event.target.closest(`.expense-swipeable[data-id="${activeSwipeId}"]`)) {
                setActiveSwipeId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeSwipeId]);
    
    // Handle swipe gesture
    const handleTouchStart = (debitId) => {
        return (e) => {
            const touch = e.touches[0];
            const swipeItem = e.currentTarget;
            
            // Set current position
            swipeItem.dataset.startX = touch.clientX;
            swipeItem.dataset.currentX = touch.clientX;
        };
    };

    const handleTouchMove = (debitId) => {
        return (e) => {
            const touch = e.touches[0];
            const swipeItem = e.currentTarget;
            
            const startX = parseInt(swipeItem.dataset.startX);
            const currentX = touch.clientX;
            swipeItem.dataset.currentX = currentX;
            
            let diff = currentX - startX;
            
            // Only allow left swipe (negative diff)
            if (diff > 0) diff = 0;
            
            // Limit the swipe distance
            if (diff < -100) diff = -100;
            
            // Apply the transform
            swipeItem.style.transform = `translateX(${diff}px)`;
            
            // Show delete button when swiped enough
            if (diff < -50) {
                setActiveSwipeId(debitId);
            }
        };
    };

    const handleTouchEnd = (debitId) => {
        return (e) => {
            const swipeItem = e.currentTarget;
            const startX = parseInt(swipeItem.dataset.startX);
            const endX = parseInt(swipeItem.dataset.currentX);
            const diff = endX - startX;
            
            // If swiped far enough, keep it open
            if (diff < -50) {
                swipeItem.style.transform = 'translateX(-100px)';
                setActiveSwipeId(debitId);
            } else {
                // Not swiped far enough, snap back
                swipeItem.style.transform = 'translateX(0)';
                setActiveSwipeId(null);
            }
        };
    };

    // Reset swipe state
    const resetSwipe = (debitId) => {
        const swipeItem = document.querySelector(`.expense-swipeable[data-id="${debitId}"]`);
        if (swipeItem) {
            swipeItem.style.transform = 'translateX(0)';
            setActiveSwipeId(null);
        }
    };
    
    const handleDeleteTransaction = async (transactionId) => {
        await deleteTransaction(transactionId);
        resetSwipe(transactionId);
    };

    const handleOpenTransactionsModal = () => {
        setTransactionsOpen(true);
    }
    const handleCloseTransactionsModal = () => {
        setTransactionsOpen(false);
    }
    
    // Group transactions by date for both main table and modal
    const groupTransactionsByDate = (transactions) => {
        if (!transactions || transactions.length === 0) return [];
        
        const groupedTransactions = {};
        
        transactions.forEach(transaction => {
            // Extract date part from logged_at
            const date = transaction.logged_at.split('T')[0];
            
            if (!groupedTransactions[date]) {
                groupedTransactions[date] = [];
            }
            
            groupedTransactions[date].push(transaction);
        });
        
        // Convert to array and sort dates in descending order
        return Object.keys(groupedTransactions)
            .sort()
            .reverse()
            .map(date => ({
                date,
                formattedDate: new Date(date).toLocaleDateString('en-US', {
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                }),
                transactions: groupedTransactions[date].sort((a, b) => 
                    new Date(b.logged_at) - new Date(a.logged_at)
                )
            }));
    };
    
    const groupedDebits = groupTransactionsByDate(debits);
    
    // Get the 5 most recent transactions while preserving date grouping
    const getRecentGroupedTransactions = () => {
        if (!groupedDebits || groupedDebits.length === 0) return [];
        
        const result = [];
        let transactionCount = 0;
        const maxTransactions = 5;
        
        // Iterate through date groups until we have 5 transactions or run out of transactions
        for (const group of groupedDebits) {
            const groupCopy = { ...group };
            const remainingSlots = maxTransactions - transactionCount;
            
            if (remainingSlots <= 0) break;
            
            // If this group has more transactions than remaining slots, take only what we need
            if (group.transactions.length > remainingSlots) {
                groupCopy.transactions = group.transactions.slice(0, remainingSlots);
            }
            
            result.push(groupCopy);
            transactionCount += groupCopy.transactions.length;
        }
        
        return result;
    };
    
    const recentGroupedTransactions = getRecentGroupedTransactions();
    
    useEffect(() => {
        setCurrency(currencyMap[user.currency] || user.currency);
    }, [user]);

    return (
        <div className='finances'>
            <div className='finances-header'>
                <div className='finances-row finances-row-header'>
                    <p className='finances-row-title' style={{ opacity: 0.3, fontSize:'30px' }}>{currency}</p>
                    <p className='finances-row-title' style={{fontSize: '7vh', fontWeight: 1000}}>{parseFloat(balance).toFixed(2)}</p>
                </div>
                <div className='finances-row'>
                    <p className='finances-row-subtitle'>Balance</p>
                </div>
            </div>
            <div className='finances-pies'>
                <PieChart
                    title="Spent (D)"
                    current={spentToday}
                    max={budgetMax}
                    color="#2D81FF"
                    radius={pieWidth}
                />
                <PieChart
                    title="Savings (W)"
                    current={weeklySavings.current}
                    max={weeklySavings.max}
                    color="#DB4CFF"
                    radius={pieWidth}
                />
            </div>

            <div className='finances-table'>
                <div className='finances-table-header'>
                    <p className='finances-table-header-title'>Transactions</p>
                    <p className='finances-table-header-subtitle' onClick={handleOpenTransactionsModal}>See all</p>
                </div>
                <div className='finances-table-expenses'>
                    {recentGroupedTransactions.length > 0 ? (
                        recentGroupedTransactions.map(group => (
                            <div key={group.date}>
                                <div className="finances-table-date-header">
                                    <h3>{group.formattedDate}</h3>
                                </div>
                                
                                {group.transactions.map((debit, index) => (
                                    <div key={debit.transaction_id} className="expense-container">
                                        <div 
                                            className={`expense-swipeable ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}
                                            data-id={debit.transaction_id}
                                            onTouchStart={handleTouchStart(debit.transaction_id)}
                                            onTouchMove={handleTouchMove(debit.transaction_id)}
                                            onTouchEnd={handleTouchEnd(debit.transaction_id)}
                                        >
                                            <div className='finances-table-expense'>
                                                <p className='finances-table-expense-title'>{debit.description}</p>
                                                <p className='finances-table-expense-category'>{debit.category}</p>
                                                <p className='finances-table-expense-amount'>{debit.amount}</p>
                                            </div>
                                        </div>
                                        <div 
                                            className={`delete-expense-btn ${activeSwipeId === debit.transaction_id ? 'visible' : ''}`}
                                            onClick={() => handleDeleteTransaction(debit.transaction_id)}
                                        >
                                            <span className="delete-btn-text">Delete</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    ) : (
                        <p style={{ opacity: 0.5, padding: 10 }}>No recent transactions</p>
                    )}
                </div>
            </div>
            {isTransactionsOpen && (
                <Modal
                    isOpen={isTransactionsOpen}
                    onClose={handleCloseTransactionsModal}
                    className="transactions-modal"
                    transitionDuration={400}
                >
                    <div className='transactions-modal-content'>
                        <div className='transactions-modal-header'>
                            <p className='transactions-modal-title'>All Transactions</p>
                            <p className='transactions-modal-close' onClick={handleCloseTransactionsModal}>X</p>
                        </div>
                        <div className='transactions-modal-body'>
                            {groupedDebits.length > 0 ? (
                                groupedDebits.map(group => (
                                    <div key={group.date}>
                                        <div className="transactions-table-date-header">
                                            <h3>{group.formattedDate}</h3>
                                            <h3 style={{fontSize:'16px'}}>{group.transactions.reduce((acc, debit) => acc + debit.amount, 0)}</h3>
                                        </div>
                                        
                                        {group.transactions.map((debit, index) => (
                                            <div key={debit.transaction_id} className="expense-container">
                                                <div 
                                                    className={`expense-swipeable ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}
                                                    data-id={debit.transaction_id}
                                                    onTouchStart={handleTouchStart(debit.transaction_id)}
                                                    onTouchMove={handleTouchMove(debit.transaction_id)}
                                                    onTouchEnd={handleTouchEnd(debit.transaction_id)}
                                                >
                                                    <div className='finances-table-expense'>
                                                        <p className='finances-table-expense-title'>{debit.description}</p>
                                                        <p className='finances-table-expense-category'>{debit.category}</p>
                                                        <p className='finances-table-expense-amount'>{debit.amount}</p>
                                                        <p className='finances-table-expense-time'>
                                                            {new Date(debit.logged_at).toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div 
                                                    className={`delete-expense-btn ${activeSwipeId === debit.transaction_id ? 'visible' : ''}`}
                                                    onClick={() => handleDeleteTransaction(debit.transaction_id)}
                                                >
                                                    <span className="delete-btn-text">Delete</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            ) : (
                                <p style={{ opacity: 0.5, padding: 10 }}>No transactions available</p>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}