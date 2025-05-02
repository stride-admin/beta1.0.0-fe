import { useState } from 'react';
import { useAppContext } from '../AppContext';
import { useWallet } from '../hooks/useWallet';

import './FormStyles.css';

export default function ExpenseForm({ onClose }) {
    const { userId } = useAppContext();
    const { addTransaction } = useWallet();

    const [expenseData, setExpenseData] = useState({
        category: '',
        amount: '',
        description: '',
        type: 1 // 1 = debit (expense), 0 = credit (income)
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setExpenseData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) : value
        }));
    };

    const handleTypeChange = (e) => {
        setExpenseData(prev => ({
            ...prev,
            type: e.target.value === 'debit' ? 1 : 0
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...expenseData,
            user_id: userId
            // logged_at will default to NOW() from DB
        };

        try {
            const result = await addTransaction(payload);
            if (result.success) {
                console.log('Transaction added successfully');
            } else {
                console.error('Failed to add transaction');
            }
        } catch (err) {
            console.error("Error inserting transaction:", err);
        }

        // Reset form and close
        setExpenseData({
            category: '',
            amount: '',
            description: '',
            type: 1
        });

        onClose();
    };

    return (
        <div className="form-container">
            <h2>Add Transaction</h2>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        value={expenseData.description}
                        onChange={handleChange}
                        placeholder="E.g. Lunch, Rent, Salary"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={expenseData.category}
                        onChange={handleChange}
                        placeholder="E.g. Food, Utilities, Income"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="amount">Amount</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={expenseData.amount}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="type">Transaction Type</label>
                    <select
                        id="type"
                        name="type"
                        value={expenseData.type === 1 ? 'debit' : 'credit'}
                        onChange={handleTypeChange}
                        required
                    >
                        <option value="debit">Debit (Expense)</option>
                        <option value="credit">Credit (Income)</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                        Add Transaction
                    </button>
                </div>
            </form>
        </div>
    );
}
