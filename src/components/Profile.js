import React, { useEffect, useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import { jwtDecode } from 'jwt-decode';
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
    try {
      const decoded = jwtDecode(token);
      localStorage.setItem('token', token);
      setUser(decoded);
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
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
