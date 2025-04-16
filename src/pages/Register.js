// Register.js
import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { hashPassword } from '../utils/hashUtils';
import { useAppContext } from '../AppContext';

import './Register.css';

function Register() {
  const { setCurrentPage } = useAppContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [theme, setTheme] = useState('default');
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const hashedPassword = await hashPassword(password);

      // Insert new user into the 'users' table
      const { data, error: insertError } = await supabase
        .from('user')
        .insert([
          {
            name:name,
            email: email,
            password: hashedPassword,
            theme: theme,
            language: language,
            currency: currency,
          }
        ])
        .select();
      
      setError(`${data}`)

      if (insertError) {
        setError(insertError.message);
        return;
      }

      // Registration successful – store user_id and hashed password in localStorage
      console.log(data);
      if (data && data[0] && data[0].user_id) {
        localStorage.setItem('user_id', data[0].user_id);
        localStorage.setItem('hashed_password', hashedPassword);
        
        setSuccess('Registration successful!');
        // Optionally update app context, e.g. redirect to a dashboard
        setCurrentPage('home');
      } else {
        setError('Registration completed but user data not returned properly');
      }

      // Optionally update app context, e.g. redirect to a dashboard
      setCurrentPage('home'); 
      console.log('Registration successful');

    } catch (err) {
      // setError(`${err}: ${data}`);
      console.error(err);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <br/>
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
        <label>
          Theme:
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          />
        </label>
        <br/>
        <label>
          Language:
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </label>
        <br/>
        <label>
          Currency:
          <input
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
        </label>
        <br/>
        <button type="submit">Register</button>
      </form>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {success && <p style={{color: 'green'}}>{success}</p>}
    </div>
  );
}

export default Register;
