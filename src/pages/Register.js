// Register.js
import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import './Register.css';

import { supabase } from '../utils/supabaseClient';
import { hashPassword } from '../utils/hashUtils';
import { currencyMap } from '../utils/currencyMap';

function Register() {
  const { setCurrentPage, setUserId, setAuthenticated } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('default-dark');
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Available options
  const currencies = Object.keys(currencyMap);
  const languages = ['English'];
  const themes = ['default-dark'];

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('user')
        .select('*')
        .eq('email', email)
        .single();
      
      if (existingUser) {
        setError('User with this email already exists');
        setIsLoading(false);
        return;
      }

      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Insert new user
      const { data, error: insertError } = await supabase
        .from('user')
        .insert([
          { 
            email, 
            password: hashedPassword, 
            name,
            theme,
            language,
            currency 
          }
        ])
        .select();
      
      if (insertError) {
        setError(insertError.message);
        setIsLoading(false);
        return;
      }
      
      // Successful registration
      setSuccess('Registration successful!');
      console.log('Registration successful:', data);
      localStorage.setItem('user_id', data[0].user_id);
      localStorage.setItem('hashed_password', hashedPassword);
      setUserId(data[0].user_id);
      setAuthenticated(true);
      
      // Short delay before redirecting to home
      setTimeout(() => {
        setCurrentPage('home');
      }, 1500);
    } catch (err) {
      setError(String(err));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-form">
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>
        
        <div className="form-group">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="form-group">
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
          />
        </div>
        
        <div className="form-group">
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="currency">Currency</label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="select-input"
          >
            {currencies.map((curr) => (
              <option key={curr} value={curr}>
                {curr}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="language">Language</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="select-input"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="theme">Theme</label>
          <select
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="select-input"
          >
            {themes.map((thm) => (
              <option key={thm} value={thm}>
                {thm === 'default-dark' ? 'Dark Theme' : thm}
              </option>
            ))}
          </select>
        </div>
        
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        
        <button 
          type="submit" 
          className="register-button"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'SIGN UP'}
        </button>
      </form>
    </div>
  );
}

export default Register;