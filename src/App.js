import React, { useState } from 'react';
import Login from './components/Login';
import Profile from './components/Profile';

function App() {
  const [token, setToken] = useState(null);

  return (
    <div className="App">
      {token ? <Profile token={token} setToken={setToken} /> : <Login setToken={setToken} />}
    </div>
  );
}

export default App;
