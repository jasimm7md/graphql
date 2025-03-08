import React, { useEffect, useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import { jwtDecode } from 'jwt-decode';
import Graph from './Graph';

const client = new ApolloClient({
  uri: 'https://learn.reboot01.com/api/graphql-engine/v1/graphql',
  cache: new InMemoryCache(),
  headers: {
    Authorization: `Bearer ${sessionStorage.getItem('jwt')}`
  }
});

const USER_QUERY = gql`
  query {
    user {
        id
        login
        auditRatio
        totalUp
        totalDown
        attrs
    }
    transaction_aggregate(
        where: {
            _and: [
                { type: { _eq: "xp" } },
                { path: { _like: "/bahrain/bh-module/%" } },
                { path: { _nlike: "/bahrain/bh-module/piscine-js/%"} }
            ]
        }
    ) {
        aggregate {
            sum {
                amount
            }
        }
    }
    progressionSkill:user {
        transactions(
            where: {type: {_like: "skill_%"}}
            distinct_on: type
            order_by: [{type: asc}, {amount: desc}]
        ) {
            type
            amount
        }
    }
    recentProj:transaction(
        where: {
            type: { _eq: "xp" }
            _and: [
                { path: { _like: "/bahrain/bh-module%" } },
                { path: { _nlike: "/bahrain/bh-module/checkpoint%" } },
                { path: { _nlike: "/bahrain/bh-module/piscine-js%" } }
            ]
        }
        order_by: { createdAt: desc }
        limit: 5
    ) {
        object {
            type
            name
        }
    }
  }
`;

const AUDIT_QUERY = gql`
  query($userId: Int!) {
    audit(where: {auditor: {id: {_eq: $userId}}, private: {code: {_is_null: false}}}, order_by: {id: desc}, limit: 5) {
      createdAt
      auditedAt
      group {
        path
        captain {
          id
          firstName
          lastName
          login
        }
      }
      private {
        code
      }
    }
  }
`;

function Profile({ token, setToken }) {
  const [user, setUser] = useState(null);
  const [auditData, setAuditData] = useState([]);

  useEffect(() => {
    try {
      const storedToken = sessionStorage.getItem('jwt');
      const decoded = jwtDecode(storedToken);
      setUser(decoded);
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }, [token]);

  const fetchAuditData = async (userId) => {
    try {
      const response = await client.query({ query: AUDIT_QUERY, variables: { userId } });
      setAuditData(response.data.audit);
    } catch (error) {
      console.error('Failed to fetch audit data:', error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('jwt');
    setToken(null);
  };

  return (
    <ApolloProvider client={client}>
      <div className="profile">
        <h2>Profile</h2>
        <UserInfo fetchAuditData={fetchAuditData} />
        <button onClick={handleLogout}>Logout</button>
        <AuditHistory auditData={auditData} />
        <Graph />
      </div>
    </ApolloProvider>
  );
}

function UserInfo({ fetchAuditData }) {
  const { loading, error, data } = useQuery(USER_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const user = data.user[0];
  fetchAuditData(user.id);

  return (
    <div className="user-info">
      <h2>Welcome, {user.attrs.firstName || ''} {user.attrs.lastName || ''} ({user.login})!</h2>
      <h3>User Information</h3>
      <p>ID: {user.id}</p>
      <p>Login: {user.login}</p>
      <p>Email: {user.attrs.email}</p>
      <p>First Name: {user.attrs.firstName}</p>
      <p>Last Name: {user.attrs.lastName}</p>
    </div>
  );
}

function AuditHistory({ auditData }) {
  return (
    <div className="audit-history">
      <h3>Audit History</h3>
      {auditData.map((audit, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', paddingLeft: '35px', paddingRight: '35px' }}>
          <div>
            {audit.group.captain.login} - {audit.group.path.split('/').pop()}
          </div>
          <div className={`status-${!audit.auditedAt || !audit.private || audit.private.code === null ? 'pending' : audit.private.code ? 'pass' : 'fail'}`}>
            {!audit.auditedAt || !audit.private || audit.private.code === null ? 'Pending' : audit.private.code ? 'Pass' : 'Fail'}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Profile;
