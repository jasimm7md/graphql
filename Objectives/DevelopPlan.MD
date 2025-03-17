
### 1. Setting Up the Project

First, let's set up a basic project structure:

```plaintext
graphql-profile/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Login.js
│   │   ├── Profile.js
│   │   ├── Graph.js
│   ├── App.js
│   ├── index.js
│   └── styles.css
├── package.json
└── README.md

bash:
mkdir -p public src/components && \
touch package.json README.md public/index.html src/App.js src/index.js src/styles.css src/components/Login.js src/components/Profile.js src/components/Graph.js
```

### 2. Installing Dependencies

Install the necessary dependencies using npm:

```bash
npm init -y
npm install react react-dom graphql apollo-client @apollo/client jwt-decode
```

### 3. Creating the Components

#### `public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GraphQL Profile</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="root"></div>
  <script src="index.js"></script>
</body>
</html>
```

#### `src/index.js`

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
```

#### `src/App.js`

```javascript
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
```

#### `src/components/Login.js`

```javascript
import React, { useState } from 'react';
import jwtDecode from 'jwt-decode';

function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('https://learn.reboot01.com/api/auth/signin', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${username}:${password}`),
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
      } else {
        setError(data.message);
      }
    } catch (err) {
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
```

#### `src/components/Profile.js`

```javascript
import React, { useEffect, useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import jwtDecode from 'jwt-decode';
import Graph from './Graph';

const client = new ApolloClient({
  uri: 'https://learn.reboot01.com/api/graphql-engine/v1/graphql',
  cache: new InMemoryCache(),
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

const USER_QUERY = gql`
  query {
    user {
      id
      login
    }
  }
`;

function Profile({ token, setToken }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const decoded = jwtDecode(token);
    localStorage.setItem('token', token);
    setUser(decoded);
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <ApolloProvider client={client}>
      <div className="profile">
        <h2>Profile</h2>
        <button onClick={handleLogout}>Logout</button>
        <UserInfo />
        <Graph />
      </div>
    </ApolloProvider>
  );
}

function UserInfo() {
  const { loading, error, data } = useQuery(USER_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="user-info">
      <h3>User Information</h3>
      <p>ID: {data.user.id}</p>
      <p>Login: {data.user.login}</p>
    </div>
  );
}

export default Profile;
```

#### `src/components/Graph.js`

```javascript
import React from 'react';

function Graph() {
  return (
    <div className="graph">
      <h3>Statistics</h3>
      <svg width="400" height="200">
        {/* Example SVG graph */}
        <rect x="10" y="10" width="50" height="150" fill="blue" />
        <rect x="70" y="30" width="50" height="130" fill="green" />
      </svg>
      <svg width="400" height="200">
        {/* Another example SVG graph */}
        <circle cx="50" cy="50" r="40" fill="red" />
        <circle cx="150" cy="50" r="40" fill="yellow" />
      </svg>
    </div>
  );
}

export default Graph;
```

#### `src/styles.css`

```css
body {
  font-family: Arial, sans-serif;
}

.App {
  text-align: center;
}

.login, .profile {
  margin: 20px;
}

input {
  display: block;
  margin: 10px auto;
  padding: 10px;
  width: 200px;
}

button {
  padding: 10px 20px;
  margin: 10px;
}

.error {
  color: red;
}

.graph {
  margin-top: 20px;
}
```

### 4. Running the Project

To run the project, use the following command:

```bash
npm start
```

This will start the development server and open the application in your default web browser.

### 5. Hosting the Project

To host the project, you can use services like GitHub Pages or Netlify. Follow their respective documentation to deploy your React application.

This solution covers the basic requirements of the project, including login functionality, data querying using GraphQL, and SVG graph generation. You can further enhance the UI and add more features as needed.

Similar code found with 2 license types