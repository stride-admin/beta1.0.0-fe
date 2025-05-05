// App.js
import { useState, useEffect } from 'react';
import './App.css';
import { useAppContext } from './AppContext';
import Home from './pages/Home';
import Wallet from './pages/Wallet';
import Login from './pages/Login';
import Register from './pages/Register';
import Chatbot from './pages/Chatbot';
import Menu from './components/Menu';
import SideMenu from './components/SideMenu';

import { hb_menu, logo } from './icons/icons';

function App() {
  const { currentPage, setCurrentPage, authenticated, setAuthenticated, user } = useAppContext();
  const [isSideMenuOpen, setSideMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  
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
  
  return (
    <div className="App">
      <div className="App-header">
        {!authenticated ? (
          <img
            src={logo}
            alt="hb_menu"
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
      {(authenticated) ? (
        <>
          {currentPage === 'home' && <Home />}
          {currentPage === 'wallet' && <Wallet />}
          {currentPage === 'chatbot' && <Chatbot />}
          <Menu />
        </>
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