import './Finances.css';
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../AppContext';
import { useWallet } from '../../hooks/useWallet';
import PieChart from '../../components/PieChart';

export default function Finances() {
    const { wallet, debits, getBalance, getSpentToday, deleteTransaction } = useWallet();
    const balance = getBalance() || 0;
    const spentToday = getSpentToday() || 0;
    const budgetMax = wallet?.daily_budget || 0;
    const savingGoal = wallet?.savings_goal || 0;
    
    // Track active swipeable item
    const [activeSwipeId, setActiveSwipeId] = useState(null);
    
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
    
    return (
        <div className='finances'>
            <div className='finances-header'>
                <div className='finances-row'>
                    <p className='finances-row-title'>{parseFloat(balance)}</p>
                    <p className='finances-row-title' style={{ opacity: 0.3, fontWeight: 100 }}>$</p>
                    <p className='finances-row-title'>{parseFloat(spentToday)}</p>
                </div>
                <div className='finances-row'>
                    <p className='finances-row-subtitle'>Balance</p>
                    <p className='finances-row-subtitle'>Spent today</p>
                </div>
            </div>
            <div className='finances-pies'>
                <PieChart
                    title="Budget"
                    current={spentToday}
                    max={budgetMax}
                    color="#2D81FF"
                    radius={80}
                />
                <PieChart
                    title="Saved (TBD)"
                    current={100}
                    max={savingGoal}
                    color="#DB4CFF"
                    radius={80}
                />
            </div>

            <div className='finances-table'>
                <div className='finances-table-header'>
                    <p className='finances-table-header-title'>Recent Transactions</p>
                    <p className='finances-table-header-subtitle'>See all</p>
                </div>
                <div className='finances-table-expenses'>
                    {debits && debits.length > 0 ? (
                        debits.slice(0, 5).map((debit, index) => (
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
                        ))
                    ) : (
                        <p style={{ opacity: 0.5, padding: 10 }}>No recent transactions</p>
                    )}
                </div>
            </div>
        </div>
    );
}