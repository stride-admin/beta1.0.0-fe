import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import Modal from './Modal';
import { useAppContext } from '../AppContext';
import './WelcomeModal.css';

export default function WelcomeModal({ wallet, health, isOpen, onClose }) {
    const { userId, setWallet, setHealth } = useAppContext();
    const [currentPage, setCurrentPage] = useState(0);
    const [needsSetup, setNeedsSetup] = useState({ wallet: false, health: false });
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [walletData, setWalletData] = useState({
        balance: '',
        saving_goal: ''
    });
    
    const [healthData, setHealthData] = useState({
        calorie_goal: '',
        carbs: '',
        fats: '',
        protein: '',
        hydration_goal: '',
        hydration_goal_unit: ''
    });
    
    // Determine which items need setup
    useEffect(() => {
        setNeedsSetup({
            wallet: !wallet,
            health: !health
        });
        
        // Reset to first page when modal opens
        setCurrentPage(0);
        
        // Pre-fill data if it exists
        if (wallet) {
            setWalletData({
                account_number: wallet.account_number || '',
                routing_number: wallet.routing_number || '',
                bank_name: wallet.bank_name || ''
            });
        }
        
        if (health) {
            setHealthData({
                height: health.height || '',
                weight: health.weight || '',
                blood_type: health.blood_type || '',
                allergies: health.allergies || ''
            });
        }
    }, [wallet, health, isOpen]);
    
    // Calculate total pages based on what's missing
    const totalPages = 1 + (needsSetup.wallet ? 1 : 0) + (needsSetup.health ? 1 : 0);
    
    // Handle wallet form changes
    const handleWalletChange = (e) => {
        const { id, value } = e.target;
        setWalletData(prev => ({
            ...prev,
            [id]: value
        }));
    };
    
    // Handle health form changes
    const handleHealthChange = (e) => {
        const { id, value } = e.target;
        setHealthData(prev => ({
            ...prev,
            [id]: value
        }));
    };
    
    // Submit wallet data
    const submitWallet = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_wallet')
                .upsert(
                    { 
                        user_id: userId,
                        balance: parseFloat(walletData.balance),
                        savings_goal: parseFloat(walletData.saving_goal)
                    },
                    { onConflict: 'user_id' }
                );
    
            if (error) throw error;
    
            setWallet({ 
                user_id: userId,
                balance: parseFloat(walletData.balance),
                saving_goal: parseFloat(walletData.saving_goal)
            });
    
            console.log("Wallet data saved successfully");
            return true;
        } catch (err) {
            console.error("Error saving wallet data:", err);
            return false;
        } finally {
            setLoading(false);
        }
    };    
    
    // Submit health data
    const submitHealth = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_health')
                .upsert(
                    { 
                        user_id: userId,
                        calorie_goal: parseFloat(healthData.calorie_goal),
                        carbs: parseFloat(healthData.carbs),
                        fats: parseFloat(healthData.fats),
                        protein: parseFloat(healthData.protein),
                        hydration_goal: parseFloat(healthData.hydration_goal),
                        hydration_goal_unit: healthData.hydration_goal_unit
                    },
                    { onConflict: 'user_id' }
                );
    
            if (error) throw error;
    
            setHealth({ 
                user_id: userId,
                calorie_goal: parseFloat(healthData.calorie_goal),
                carbs: parseFloat(healthData.carbs),
                fats: parseFloat(healthData.fats),
                protein: parseFloat(healthData.protein),
                hydration_goal: parseFloat(healthData.hydration_goal),
                hydration_goal_unit: healthData.hydration_goal_unit
            });
    
            console.log("Health data saved successfully");
            return true;
        } catch (err) {
            console.error("Error saving health data:", err);
            return false;
        } finally {
            setLoading(false);
        }
    };
    
    // Handle next page navigation
    const nextPage = async () => {
        // If on wallet page and wallet needs setup, submit wallet data
        if (currentPage === 1 && needsSetup.wallet) {
            const success = await submitWallet();
            if (!success) return; // Don't proceed if submission failed
        }
        
        // If on health page, submit health data
        if ((currentPage === 1 && !needsSetup.wallet && needsSetup.health) || 
            (currentPage === 2 && needsSetup.health)) {
            const success = await submitHealth();
            if (!success) return; // Don't proceed if submission failed
        }
        
        // Proceed to next page or close
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        } else {
            onClose(); // Close modal when all pages are completed
        }
    };
    
    // Handle previous page navigation
    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };
    
    // Render intro page content
    const renderIntroPage = () => (
        <div className="welcome-page">
            <h2>Welcome to the App!</h2>
            <p>Before you continue, we need to set up your account.</p>
            {needsSetup.wallet && needsSetup.health && (
                <p>You need to set up both your wallet and health information.</p>
            )}
            {needsSetup.wallet && !needsSetup.health && (
                <p>You need to set up your wallet information.</p>
            )}
            {!needsSetup.wallet && needsSetup.health && (
                <p>You need to set up your health information.</p>
            )}
            <button className="next-button" onClick={nextPage}>Let's Get Started</button>
        </div>
    );
    
    // Render wallet setup page
    const renderWalletSetupPage = () => (
        <div className="setup-page wallet-setup">
            <h2>Set Up Your Wallet</h2>
            <p>Please provide your wallet information below:</p>
            
            <form className="setup-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                    <label htmlFor="balance">Balance</label>
                    <input 
                        type="number" 
                        id="balance" 
                        value={walletData.balance}
                        onChange={handleWalletChange}
                        placeholder="Enter current balance" 
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="saving_goal">Saving Goal</label>
                    <input 
                        type="number" 
                        id="saving_goal" 
                        value={walletData.saving_goal}
                        onChange={handleWalletChange}
                        placeholder="Enter saving goal" 
                        required
                    />
                </div>
            </form>
            
            <div className="button-group">
                <button className="back-button" onClick={prevPage}>Back</button>
                <button 
                    className="next-button" 
                    onClick={nextPage}
                    disabled={loading}
                >
                    {loading ? "Saving..." : needsSetup.health ? "Next" : "Finish"}
                </button>
            </div>
        </div>
    );
    
    // Render health setup page
    const renderHealthSetupPage = () => (
        <div className="setup-page health-setup">
            <h2>Set Up Your Health Information</h2>
            <p>Please provide your health information below:</p>
            
            <form className="setup-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                    <label htmlFor="calorie_goal">Calorie Goal</label>
                    <input 
                        type="number" 
                        id="calorie_goal" 
                        value={healthData.calorie_goal}
                        onChange={handleHealthChange}
                        placeholder="e.g. 2200" 
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="carbs">Carbs (g)</label>
                    <input 
                        type="number" 
                        id="carbs" 
                        value={healthData.carbs}
                        onChange={handleHealthChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="fats">Fats (g)</label>
                    <input 
                        type="number" 
                        id="fats" 
                        value={healthData.fats}
                        onChange={handleHealthChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="protein">Protein (g)</label>
                    <input 
                        type="number" 
                        id="protein" 
                        value={healthData.protein}
                        onChange={handleHealthChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="hydration_goal">Hydration Goal</label>
                    <input 
                        type="number" 
                        id="hydration_goal" 
                        value={healthData.hydration_goal}
                        onChange={handleHealthChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="hydration_goal_unit">Unit</label>
                    <select 
                        id="hydration_goal_unit" 
                        value={healthData.hydration_goal_unit}
                        onChange={handleHealthChange}
                        required
                    >
                        <option value="">Select unit</option>
                        <option value="liters">Liters</option>
                        <option value="ml">Milliliters</option>
                        <option value="cups">Cups</option>
                    </select>
                </div>
            </form>

            
            <div className="button-group">
                <button className="back-button" onClick={prevPage}>Back</button>
                <button 
                    className="next-button" 
                    onClick={nextPage}
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Finish"}
                </button>
            </div>
        </div>
    );
    
    // Determine which page to show based on currentPage and what's missing
    const renderCurrentPage = () => {
        if (currentPage === 0) {
            return renderIntroPage();
        } else if (currentPage === 1) {
            if (needsSetup.wallet) {
                return renderWalletSetupPage();
            } else {
                return renderHealthSetupPage();
            }
        } else if (currentPage === 2) {
            return renderHealthSetupPage();
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="welcome-modal">
            <div className="modal-header">
                <div className="progress-indicator">
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <div 
                            key={index} 
                            className={`progress-dot ${index === currentPage ? 'active' : ''} ${index < currentPage ? 'completed' : ''}`}
                        />
                    ))}
                </div>
            </div>
            <div className="modal-body">
                {renderCurrentPage()}
            </div>
        </Modal>
    );
}