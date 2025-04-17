// Login.js
import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { hashPassword } from '../utils/hashUtils';
import { useAppContext } from '../AppContext';

import './Login.css'

function Login() {
  const { setCurrentPage, setUserId, setAuthenticated } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const hashedPassword = await hashPassword(password);

      const { data, error: queryError } = await supabase
        .from('user')
        .select('*')
        .eq('email', email)
        .single();

      if (queryError) {
        setError(queryError.message);
        return;
      }

      if (data.password !== hashedPassword) {
        setError('Invalid email or password.');
        return;
      }

      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('hashed_password', hashedPassword);

      setUserId(data.user_id);
      setAuthenticated(true)
      setCurrentPage('home');
      console.log('Login successful');

    } catch (err) {
      setError(toString(err));
      console.error(err);
    }
  };

  const handleLogout = () => {
    // Remove stored credentials on logout
    localStorage.removeItem('user_id');
    localStorage.removeItem('hashed_password');
    // Optionally update app context
    setCurrentPage('home');
    console.log('Logged out');
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <br/>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <br/>
        <button type="submit">Log In</button>
      </form>
      {error && <p style={{color: 'red'}}>{error}</p>}

      <button onClick={handleLogout} style={{marginTop: '10px'}}>
        Log Out
      </button>
    </div>
  );
}

export default Login;
