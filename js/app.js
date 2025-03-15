document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');

  if (loginForm) {
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

        const data = await response.json();
        localStorage.setItem('jwt', data.jwt);
        window.location.href = 'index.html';
      } catch (error) {
        errorMessage.textContent = error.message;
      }
    });
  }

  const jwt = localStorage.getItem('jwt');
  if (jwt && window.location.pathname.endsWith('index.html')) {
    fetchUserProfile(jwt);
  }
});

async function fetchUserProfile(jwt) {
  try {
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
          }
        `
      })
    });

    const data = await response.json();
    displayUserProfile(data.data);
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
}

function displayUserProfile(data) {
  const userInfo = document.getElementById('user-info');
  const xpAmount = document.getElementById('xp-amount');
  const grades = document.getElementById('grades');

  userInfo.textContent = `User ID: ${data.user[0].id}, Login: ${data.user[0].login}`;
  xpAmount.textContent = `XP Amount: ${data.transaction.reduce((sum, tx) => sum + tx.amount, 0)}`;
  grades.textContent = `Grades: ${data.progress.map(p => p.grade).join(', ')}`;
}
