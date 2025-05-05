import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './utils/supabaseClient'; // Make sure this import points to your supabase client


const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [authenticated, setAuthenticated] = useState(true);
  const [theme, setTheme] = useState('default');
  const [currentPage, setCurrentPage] = useState('home');
  const [isNewUser, setIsNewUser] = useState(false);
  const [isCheckingUserData, setIsCheckingUserData] = useState(true);

  const [user, setUser] = useState({});
  const [health, setHealth] = useState(null);
  const [todos, setTodos] = useState(null);
  const [calendar, setCalendar] = useState(null);
  
  const [wallet, setWallet] = useState(null);
  const [debits, setDebits] = useState(null);
  const [credits, setCredits] = useState(null);
  const [currency, setCurrency] = useState(null);

  const [streak, setStreak] = useState(12);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    const hashedPassword = localStorage.getItem('hashed_password');
    if (storedUserId && hashedPassword) {
      setUserId(storedUserId);
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }
  }, [currentPage]);

    // Check if user has completed setup
  useEffect(() => {
    const checkUserSetup = async () => {
      if (!authenticated || !userId) {
        setIsCheckingUserData(false);
        return;
      }

      try {
        // Check for health data
        const { data: healthData, error: healthError } = await supabase
          .from('user_health')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (healthData) {
          setHealth(healthData);
        }

        // Check for wallet data
        const { data: walletData, error: walletError } = await supabase
          .from('user_wallet')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (walletData) {
          setWallet(walletData);
        }

        // Set new user flag based on presence of both records
        const needsSetup = !healthData || !walletData;
        setIsNewUser(needsSetup);
      } catch (error) {
        console.error('Error checking user setup:', error);
      } finally {
        setIsCheckingUserData(false);
      }
    };

    if (authenticated && userId) {
      checkUserSetup();
    }
  }, [authenticated, userId]);

  // Function to refresh user data after setup completion
  const refreshUserData = async () => {
    if (!authenticated || !userId) return;

    try {
      setIsCheckingUserData(true);
      
      // Fetch health data
      const { data: healthData } = await supabase
        .from('user_health')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (healthData) {
        setHealth(healthData);
      }

      // Fetch wallet data
      const { data: walletData } = await supabase
        .from('user_wallet')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (walletData) {
        setWallet(walletData);
      }

      // Update new user status
      setIsNewUser(!healthData || !walletData);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setIsCheckingUserData(false);
    }
  };

  const value = {
    theme, setTheme,
    currentPage, setCurrentPage,
    userId, setUserId,
    authenticated, setAuthenticated,
    user, setUser,
    wallet, setWallet,
    health, setHealth,
    todos, setTodos,
    calendar, setCalendar,
    debits, setDebits,
    credits, setCredits,
    streak, setStreak,
    currency, setCurrency,
    isNewUser, setIsNewUser,
    isCheckingUserData,
    refreshUserData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
