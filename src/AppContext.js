import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [authenticated, setAuthenticated] = useState(true);
  const [theme, setTheme] = useState('default');
  const [currentPage, setCurrentPage] = useState('home');

  const [user, setUser] = useState({});
  const [wallet, setWallet] = useState(null);
  const [health, setHealth] = useState(null);
  const [todos, setTodos] = useState(null);

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

  const value = {
    theme,
    setTheme,
    currentPage,
    setCurrentPage,
    userId, setUserId,
    authenticated, setAuthenticated,
    user, setUser,
    wallet, setWallet,
    health, setHealth,
    todos, setTodos
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
