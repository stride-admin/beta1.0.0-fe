// App.js
import { useState, useEffect } from 'react';
import './App.css';
import { useAppContext } from './AppContext';

import { supabase } from './utils/supabaseClient';

import Home from './pages/Home';
import Wallet from './pages/Wallet';
import Login from './pages/Login';
import Register from './pages/Register';
import Chatbot from './pages/Chatbot';
import WelcomeSetup from './pages/WelcomeSetup';

import Menu from './components/Menu';
import SideMenu from './components/SideMenu';

import { hb_menu, logo, fire } from './icons/icons';

function App() {
  const { currentPage, setCurrentPage, authenticated, setAuthenticated, streak } = useAppContext();
  const [isSideMenuOpen, setSideMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user has health and wallet data
  useEffect(() => {
    const checkUserData = async () => {
      if (!authenticated) {
        setIsLoading(false);
        return;
      }
      
      const user_id = localStorage.getItem('user_id');
      if (!user_id) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Check if user has health data
        const { data: healthData, error: healthError } = await supabase
          .from('user_health')
          .select('*')
          .eq('user_id', user_id)
          .single();
          
        // Check if user has wallet data
        const { data: walletData, error: walletError } = await supabase
          .from('user_wallet')
          .select('*')
          .eq('user_id', user_id)
          .single();
        
        // If either is missing, user needs to complete setup
        setIsNewUser(!healthData || !walletData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking user data:', error);
        setIsLoading(false);
      }
    };
    
    checkUserData();
  }, [authenticated]);
  
  const toggleMenu = () => {
    setSideMenuOpen(prev => !prev);
  };
  
  const closeSideMenu = () => {
    setSideMenuOpen(false);
  };
  
  const navItems = [
    { name: 'Calendar', onClick: () => console.log('Calendar clicked') },
    {
      name: 'Log Out',
      onClick: () => {
        localStorage.removeItem('user_id');
        localStorage.removeItem('hashed_password');
        setAuthenticated(false);
        setCurrentPage('home');
        console.log('User logged out');
      }
    },
  ];
  
  if (isLoading) {
    return (
      <div className="App">
        <div className="loading-screen">
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="App">
      <div className="App-header">
        {!authenticated ? (
          <img
            src={logo}
            alt="logo"
            className="logo-login"
            onClick={toggleMenu}
          />
        ) : (
          <img
            src={hb_menu}
            alt="hb_menu"
            className="hb-menu-icon"
            onClick={toggleMenu}
          />
        )}
      </div>
      
      {/* Side Menu */}
      <SideMenu isOpen={isSideMenuOpen} onClose={closeSideMenu}>
        <div className="side-menu-header">
          <h2>Menu</h2>
        </div>
        <nav className="side-menu-nav">
          {navItems.map((item, index) => (
            <div
              key={index}
              className="side-menu-item"
              onClick={() => {
                item.onClick();
                closeSideMenu();
              }}
            >
              {item.name}
            </div>
          ))}
        </nav>
      </SideMenu>
      
      {/* Main Content */}
      {authenticated ? (
        isNewUser ? (
          // Show Welcome Setup for new users
          <WelcomeSetup />
        ) : (
          // Show regular app content for existing users
          <>
            {currentPage === 'home' && <Home />}
            {currentPage === 'wallet' && <Wallet />}
            {currentPage === 'chatbot' && <Chatbot />}
            <Menu />
          </>
        )
      ) : (
        <div className="auth-container">
          {authMode === 'login' ? (
            <>
              <h2>Welcome back!</h2>
              <Login />
            </>
          ) : (
            <>
              <h2>Welcome to Stride!</h2>
              <Register />
            </>
          )}
        </div>
      )}
      {!authenticated && (
        <p className="auth-switch-text">
          {authMode === 'login' ? (
            <>
              Don't have an account?{' '}
              <span className="auth-link" onClick={() => setAuthMode('register')}>
                Sign up
              </span>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <span className="auth-link" onClick={() => setAuthMode('login')}>
                Log in
              </span>
            </>
          )}
        </p>
      )}
    </div>
  );
}

export default App;