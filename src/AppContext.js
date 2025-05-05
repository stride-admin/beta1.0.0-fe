import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [authenticated, setAuthenticated] = useState(true);
  const [theme, setTheme] = useState('default');
  const [currentPage, setCurrentPage] = useState('home');

  const [user, setUser] = useState({});
  const [health, setHealth] = useState(null);
  const [todos, setTodos] = useState(null);
  const [calendar, setCalendar] = useState(null);
  
  const [wallet, setWallet] = useState(null);
  const [debits, setDebits] = useState(null);
  const [credits, setCredits] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const pieWidth = window.innerWidth * 0.2;
  }, [window.innerWidth]);

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
    credits, setCredits
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
