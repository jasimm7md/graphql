import React, { useState } from 'react';

function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      console.log('Attempting to log in...');
      const response = await fetch('https://learn.reboot01.com/api/auth/signin', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${username}:${password}`)
        }
      });
      const data = await response.text();
      // console.log('Response:', response);
      // console.log('Data:', data);
      if (response.ok) {
        console.log('Login successful, setting token...');
        sessionStorage.setItem('jwt', data.replace(/"/g, '')); // Store the token in session storage without extra quotes
        setToken(data.replace(/"/g, '')); // Set the token without extra quotes
      } else {
        console.log('Login failed:', data);
        setError(data);
      }
    } catch (err) {
      console.log('Login error:', err);
      setError('Login failed');
    }
  };

  return (
    <div className="login">
      <h2>Login</h2>
      <input type="text" placeholder="Username or Email" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default Login;