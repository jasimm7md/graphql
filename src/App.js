import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Profile from './components/Profile';

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('jwt');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return (
    <div className="App">
      {token ? <Profile token={token} setToken={setToken} /> : <Login setToken={setToken} />}
    </div>
  );
}

export default App;
