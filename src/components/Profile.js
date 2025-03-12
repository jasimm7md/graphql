import React, { useEffect, useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';

const createApolloClient = (token) => {
  return new ApolloClient({
    uri: 'https://learn.reboot01.com/api/graphql-engine/v1/graphql',
    cache: new InMemoryCache(),
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

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
    progressionSkill: user {
      transactions(
        where: {type: {_like: "skill_%"}}
        distinct_on: type
        order_by: [{type: asc}, {amount: desc}]
      ) {
        type
        amount
      }
    }
    recentProj: transaction(
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
  const [client, setClient] = useState(null);
  const [auditData, setAuditData] = useState([]);

  useEffect(() => {
    try {
      const storedToken = sessionStorage.getItem('jwt');
      if (storedToken) {
        const decoded = JSON.parse(atob(storedToken.split('.')[1]));
        setUser(decoded);
        setClient(createApolloClient(storedToken));
      } else {
        console.error('No token found');
      }
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

  if (!client) {
    return <p>Loading...</p>;
  }

  return (
    <ApolloProvider client={client}>
      <div className="profile-container">
        <div className="profile-header">
          <h2>Profile</h2>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
        {user && <UserInfo userId={user.id} fetchAuditData={fetchAuditData} />}
        <AuditHistory auditData={auditData} />
        {/* <Graph /> */}
        <Statistics />
        <TotalXP />
        <AuditRatio />
        <RecentProjects />
      </div>
    </ApolloProvider>
  );
}

function UserInfo({ userId, fetchAuditData }) {
  const { loading, error, data } = useQuery(USER_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error UserInfo(): {error.message}</p>;

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
      <h3>Recent Audit</h3>
      {auditData.map((audit, index) => (
        <div key={index} className="audit-item">
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

function getTopSkills(skills) {
  return skills
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map(skill => ({
      name: skill.type.split('_')[1],
      amount: skill.amount
    }));
}

function Statistics() {
  const { loading, error, data } = useQuery(USER_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error Statistics(): {error.message}</p>;

  const skills = data.progressionSkill[0]?.transactions || [];
  const topSkills = getTopSkills(skills);

  return (
    <div className="statistics">
      <h3>Statistics</h3>
      <svg width="400" height="400" viewBox="0 0 400 400">
        <polygon
          points={topSkills.map((skill, index) => {
            const angle = (Math.PI / 2) + (2 * Math.PI * index / topSkills.length);
            const x = 200 + 100 * Math.cos(angle) * (skill.amount / 100);
            const y = 200 - 100 * Math.sin(angle) * (skill.amount / 100);
            return `${x},${y}`;
          }).join(' ')}
          fill="rgba(0, 128, 0, 0.5)"
          stroke="green"
          strokeWidth="2"
        />
        {topSkills.map((skill, index) => {
          const angle = (Math.PI / 2) + (2 * Math.PI * index / topSkills.length);
          const x = 200 + 120 * Math.cos(angle);
          const y = 200 - 120 * Math.sin(angle);
          return (
            <text key={index} x={x} y={y} textAnchor="middle" fill="black">{skill.name}</text>
          );
        })}
      </svg>
    </div>
  );
}

function TotalXP() {
  const { loading, error, data } = useQuery(USER_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error TotalXP(): {error.message}</p>;

  const xpAmount = data.transaction_aggregate.aggregate.sum.amount;
  const xpInKB = xpAmount / 1000;
  const xpDisplay = xpInKB >= 1000 ? `${(xpInKB / 1000).toFixed(1)} MB` : `${xpInKB.toFixed(0)} KB`;

  return (
    <div className="total-xp">
      <h3>Total XP</h3>
      <p>{xpDisplay}</p>
    </div>
  );
}

function AuditRatio() {
  const { loading, error, data } = useQuery(USER_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error AuditRatio(): {error.message}</p>;

  const user = data.user[0];
  const upAudit = user.totalUp / 1000;
  const downAudit = user.totalDown / 1000;
  const maxAudit = Math.max(upAudit, downAudit);
  const upAuditPercentage = (upAudit / maxAudit) * 60;
  const downAuditPercentage = (downAudit / maxAudit) * 60;
  const ratio = (upAudit / downAudit).toFixed(1);

  return (
    <div className="audit-ratio">
      <h3>Audit Ratio</h3>
      <svg width="400" height="200">
        <rect x="10" y="10" width={`${upAuditPercentage}%`} height="20" fill="brown" />
        <text x={`${upAuditPercentage + 5}%`} y="25" fill="black">{upAudit.toFixed(0)} KB ↑</text>
        <rect x="10" y="40" width={`${downAuditPercentage}%`} height="20" fill="brown" />
        <text x={`${downAuditPercentage + 5}%`} y="55" fill="black">{downAudit.toFixed(0)} KB ↓</text>
      </svg>
      <p>{ratio} {ratio < 1 ? 'Careful buddy!' : 'Almost perfect!'}</p>
    </div>
  );
}

function RecentProjects() {
  const { loading, error, data } = useQuery(USER_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error RecentProjects(): {error.message}</p>;

  const recentProjects = data.recentProj || [];

  return (
    <div className="recent-projects">
      <h3>Recent Projects</h3>
      {recentProjects.length > 0 ? (
        recentProjects.map((proj, index) => (
          <div key={index}>{index + 1}. {proj.object.name}</div>
        ))
      ) : (
        <div>No recent projects</div>
      )}
    </div>
  );
}

export default Profile;
