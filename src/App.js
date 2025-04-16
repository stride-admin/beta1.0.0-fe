// App.js
import { useState, useEffect } from 'react';
import './App.css';
import { useAppContext } from './AppContext';

import Home from './pages/Home';
import Wallet from './pages/Wallet';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './components/Menu';
import SideMenu from './components/SideMenu';
import { hb_menu } from './icons/icons';

function App() {
  const { currentPage, setCurrentPage } = useAppContext();
  const [isSideMenuOpen, setSideMenuOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(true);
  // New state to toggle between login and registration forms
  const [authMode, setAuthMode] = useState('login');

  // Check if the user is logged in (credentials stored in localStorage)
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const hashedPassword = localStorage.getItem('hashed_password');
    if (userId && hashedPassword) {
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }
  }, [currentPage]);

  const toggleMenu = () => {
    setSideMenuOpen(prev => !prev);
  };

  const closeSideMenu = () => {
    setSideMenuOpen(false);
  };

  // Side menu navigation, including a Log Out option that clears credentials
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
        <img 
          src={hb_menu} 
          alt="hb_menu" 
          className="hb-menu-icon" 
          onClick={toggleMenu}
        />
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
        <>
          {currentPage === 'home' && <Home />}
          {currentPage === 'wallet' && <Wallet />}
          <Menu />
        </>
      ) : (
        <div className="auth-container">
          <h2>{authMode === 'login' ? 'Login' : 'Register'}</h2>
          <div className="auth-toggle">
            <button 
              onClick={() => setAuthMode('login')}
              className={authMode === 'login' ? 'active' : ''}
            >
              Login
            </button>
            <button 
              onClick={() => setAuthMode('register')}
              className={authMode === 'register' ? 'active' : ''}
            >
              Register
            </button>
          </div>
          <div className="auth-form">
            {authMode === 'login' ? <Login /> : <Register />}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
