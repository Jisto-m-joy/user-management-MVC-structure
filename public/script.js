document.getElementById('userForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });

  const result = await response.json();
  alert(result.message);
  if (response.ok) {
    document.getElementById('userForm').reset();
    fetchUsers();
  }
});

async function fetchUsers() {
  const response = await fetch('/api/users');
  const users = await response.json();
  const userList = document.getElementById('userList');
  userList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = `${user.username} (${user.email})`;
    userList.appendChild(li);
  });
}

// Fetch users on page load
fetchUsers();