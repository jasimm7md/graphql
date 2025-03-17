document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
  
    function loadLoginForm() {
      content.innerHTML = `
        <div id="login">
          <h1>Login</h1>
          <form id="login-form">
            <label for="username">Username or Email:</label>
            <input type="text" id="username" name="username" required>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
            <button type="submit">Login</button>
          </form>
          <div id="error-message"></div>
        </div>
      `;
  
      const loginForm = document.getElementById('login-form');
      const errorMessage = document.getElementById('error-message');
  
      loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
  
        try {
          const response = await fetch('https://learn.reboot01.com/api/auth/signin', {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + btoa(`${username}:${password}`),
              'Content-Type': 'application/json'
            }
          });
  
          if (!response.ok) {
            throw new Error('Invalid credentials');
          }
  
          const jwt = await response.json();
          console.log('JWT received:', jwt);
          localStorage.setItem('jwt', jwt);
          console.log('JWT stored:', localStorage.getItem('jwt'));
          loadProfilePage(jwt);
        } catch (error) {
          errorMessage.textContent = error.message;
        }
      });
    }
  
    function loadProfilePage(jwt) {
      content.innerHTML = `
        <div id="profile">
          <h1>Profile</h1>
          <div id="user-info"></div>
          <div id="xp-amount"></div>
          <div id="grades"></div>
          <div id="recent-projects"></div>
          <div id="graphs">
            <h3>Statistics</h3>
            <div id="xp-graph"></div>
            <div id="audit-ratio-graph"></div>
          </div>
          <button class="logout-button" id="logout-button">Logout</button>
        </div>
      `;
      document.getElementById('logout-button').addEventListener('click', handleLogout);
      fetchUserProfile(jwt);
    }
  
    function handleLogout() {
      localStorage.removeItem('jwt');
      window.location.reload();
    }
  
    const jwt = localStorage.getItem('jwt');
    console.log('JWT retrieved on load:', jwt);
    if (!jwt) {
      loadLoginForm();
    } else {
      loadProfilePage(jwt);
    }
  });
  
  async function fetchUserProfile(jwt) {
    try {
      console.log('Using JWT:', jwt);
      const response = await fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + jwt,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `
            {
              user {
                id
                login
              }
              transaction {
                amount
              }
              progress {
                grade
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
          `
        })
      });
  
      const result = await response.json();
      console.log('GraphQL response:', result);
      if (result.errors) {
        throw new Error('Error fetching user profile: ' + result.errors[0].message);
      }
      displayUserProfile(result.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }
  
  function displayUserProfile(data) {
    const userInfo = document.getElementById('user-info');
    const xpAmount = document.getElementById('xp-amount');
    const grades = document.getElementById('grades');
    const recentProjects = document.getElementById('recent-projects');
    const xpGraph = document.getElementById('xp-graph');
    const auditRatioGraph = document.getElementById('audit-ratio-graph');
  
    if (data && data.user && data.user.length > 0) {
      userInfo.textContent = `User ID: ${data.user[0].id}, Login: ${data.user[0].login}`;
      const xpAmountValue = data.transaction.reduce((sum, tx) => sum + tx.amount, 0);
      const xpInKB = xpAmountValue / 1000;
      const xpDisplay = xpInKB >= 1000 ? `${(xpInKB / 1000).toFixed(1)} MB` : `${xpInKB.toFixed(0)} KB`;
      xpAmount.textContent = `XP Amount: ${xpDisplay}`;
      grades.textContent = `Grades: ${data.progress.map(p => p.grade).join(', ')}`;
      recentProjects.innerHTML = `
        <h3>Recent Projects</h3>
        ${data.recentProj.length > 0 ? data.recentProj.map((proj, index) => `<div>${index + 1}. ${proj.object.name}</div>`).join('') : '<div>No recent projects</div>'}
      `;
  
      // Generate XP graph
      const xpData = data.transaction.map(tx => tx.amount);
      const xpMax = Math.max(...xpData);
      xpGraph.innerHTML = `
        <svg viewBox="0 0 100 50">
          <polyline fill="none" stroke="blue" stroke-width="2"
            points="${xpData.map((xp, index) => `${index * 10},${50 - (xp / xpMax) * 50}`).join(' ')}" />
        </svg>
      `;
  
      // Generate Audit Ratio graph (dummy data for example)
      const auditData = [70, 30]; // Example data: 70% pass, 30% fail
      auditRatioGraph.innerHTML = `
        <svg viewBox="0 0 100 50">
          <rect x="0" y="0" width="${auditData[0]}" height="5" fill="green" />
          <rect x="${auditData[0]}" y="0" width="${auditData[1]}" height="5" fill="red" />
        </svg>
      `;
    } else {
      userInfo.textContent = 'No user data available';
      xpAmount.textContent = '';
      grades.textContent = '';
      recentProjects.innerHTML = '<div>No recent projects</div>';
    }
  }
  