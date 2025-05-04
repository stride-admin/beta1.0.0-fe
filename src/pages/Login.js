// Login.js
import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { hashPassword } from '../utils/hashUtils';
import { useAppContext } from '../AppContext';
import './Login.css';

function Login() {
  const { setCurrentPage, setUserId, setAuthenticated } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const hashedPassword = await hashPassword(password);
      const { data, error: queryError } = await supabase
        .from('user')
        .select('*')
        .eq('email', email)
        .single();
        
      if (queryError) {
        setError('Invalid email or password');
        return;
      }
      
      if (data.password !== hashedPassword) {
        setError('Invalid email or password');
        return;
      }
      
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('hashed_password', hashedPassword);
      setUserId(data.user_id);
      setAuthenticated(true);
      setCurrentPage('home');
      console.log('Login successful');
    } catch (err) {
      setError(String(err));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form">
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>
        
        <div className="form-group">
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        
        {error && <p className="error-message">{error}</p>}
        
        <button 
          type="submit" 
          className="login-button"
          disabled={isLoading}
        >
          {isLoading ? 'LOGGING IN...' : 'LOG IN'}
        </button>
      </form>
    </div>
  );
}

export default Login;