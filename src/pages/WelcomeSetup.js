// src/pages/WelcomeSetup.js
import { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { supabase } from '../utils/supabaseClient';
import './WelcomeSetup.css';

const WelcomeSetup = () => {
  const { userId, setCurrentPage, refreshUserData, setIsNewUser } = useAppContext();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Health form state
  const [healthForm, setHealthForm] = useState({
    calorie_goal: 2000,
    carbs: 50, // percentage
    fats: 30, // percentage
    protein: 20, // percentage
    hydration_goal: 8,
    hydration_goal_unit: 'cups',
    cardio_goal: 30, // minutes
    steps_goal: 10000
  });
  
  // Wallet form state
  const [walletForm, setWalletForm] = useState({
    balance: 0,
    savings_goal: 0,
    daily_budget: 0
  });
  
  const handleHealthChange = (e) => {
    const { name, value } = e.target;
    setHealthForm(prev => ({
      ...prev,
      [name]: name === 'hydration_goal_unit' ? value : Number(value)
    }));
  };
  
  const handleWalletChange = (e) => {
    const { name, value } = e.target;
    setWalletForm(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };
  
  const handleSubmitHealth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Use userId from context instead of localStorage
      if (!userId) {
        setMessage('Authentication error. Please login again.');
        return;
      }
      
      const { data, error } = await supabase
        .from('user_health')
        .insert([
          { 
            user_id: userId,
            ...healthForm
          }
        ]);
        
      if (error) throw error;
      
      setStep(2); // Move to wallet setup
    } catch (error) {
      console.error('Error saving health data:', error);
      setMessage('Failed to save health data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmitWallet = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Use userId from context instead of localStorage
      if (!userId) {
        setMessage('Authentication error. Please login again.');
        return;
      }
      
      const { data, error } = await supabase
        .from('user_wallet')
        .insert([
          { 
            user_id: userId,
            ...walletForm
          }
        ]);
        
      if (error) throw error;
      
      // Refresh user data to update isNewUser state
      await refreshUserData();
      
      // Explicitly set isNewUser to false since setup is complete
      setIsNewUser(false);
      
      // Setup complete, redirect to home
      setCurrentPage('home');
        window.location.reload();
    } catch (error) {
      console.error('Error saving wallet data:', error);
      setMessage('Failed to save wallet data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="welcome-setup-container">
      <h1>Welcome to Stride!</h1>
      <p>Let's get you set up to start your journey.</p>
      
      {message && <div className="error-message">{message}</div>}
      
      {step === 1 ? (
        <div className="setup-form">
          <h2>Step 1: Health Goals</h2>
          <form onSubmit={handleSubmitHealth}>
            <div className="form-group">
              <label>Daily Calorie Goal</label>
              <input 
                type="number" 
                name="calorie_goal" 
                value={healthForm.calorie_goal} 
                onChange={handleHealthChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Macronutrient Split (%)</label>
              <div className="macro-inputs">
                <div>
                  <label>Carbs</label>
                  <input 
                    type="number" 
                    name="carbs" 
                    value={healthForm.carbs} 
                    onChange={handleHealthChange}
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div>
                  <label>Fats</label>
                  <input 
                    type="number" 
                    name="fats" 
                    value={healthForm.fats} 
                    onChange={handleHealthChange}
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div>
                  <label>Protein</label>
                  <input 
                    type="number" 
                    name="protein" 
                    value={healthForm.protein} 
                    onChange={handleHealthChange}
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>
              {healthForm.carbs + healthForm.fats + healthForm.protein !== 100 && (
                <p className="macro-warning">Note: Macros should add up to 100%</p>
              )}
            </div>
            
            <div className="form-group hydration-group">
              <label>Daily Hydration Goal</label>
              <div className="hydration-input">
                <input 
                  type="number" 
                  name="hydration_goal" 
                  value={healthForm.hydration_goal} 
                  onChange={handleHealthChange}
                  min="0"
                  required
                />
                <select 
                  name="hydration_goal_unit" 
                  value={healthForm.hydration_goal_unit} 
                  onChange={handleHealthChange}
                >
                  <option value="cups">Cups</option>
                  <option value="oz">Ounces</option>
                  <option value="ml">Milliliters</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Daily Cardio Goal (minutes)</label>
              <input 
                type="number" 
                name="cardio_goal" 
                value={healthForm.cardio_goal} 
                onChange={handleHealthChange}
                min="0"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Daily Steps Goal</label>
              <input 
                type="number" 
                name="steps_goal" 
                value={healthForm.steps_goal} 
                onChange={handleHealthChange}
                min="0"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="setup-btn" 
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Next: Financial Goals'}
            </button>
          </form>
        </div>
      ) : (
        <div className="setup-form">
          <h2>Step 2: Financial Goals</h2>
          <form onSubmit={handleSubmitWallet}>
            <div className="form-group">
              <label>Current </label>
              <input 
                type="number" 
                name="balance" 
                value={walletForm.balance} 
                onChange={handleWalletChange}
                step="0.01"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Savings Goal</label>
              <input 
                type="number" 
                name="savings_goal" 
                value={walletForm.savings_goal} 
                onChange={handleWalletChange}
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Daily Budget</label>
              <input 
                type="number" 
                name="daily_budget" 
                value={walletForm.daily_budget} 
                onChange={handleWalletChange}
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div className="setup-buttons">
              <button 
                type="button" 
                className="back-btn" 
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back
              </button>
              <button 
                type="submit" 
                className="setup-btn" 
                disabled={loading}
              >
                {loading ? 'Finishing Setup...' : 'Complete Setup'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default WelcomeSetup;