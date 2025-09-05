// ===== DOM Elements =====
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const showRegisterLink = document.getElementById("show-register");
const showLoginLink = document.getElementById("show-login");

// ===== Switch between Login & Register =====
showRegisterLink.addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.style.display = "none";
  registerForm.style.display = "block";
});

showLoginLink.addEventListener("click", (e) => {
  e.preventDefault();
  registerForm.style.display = "none";
  loginForm.style.display = "block";
});

// ===== Normalize Users (migration helper) =====
function normalizeUsers() {
  let users = JSON.parse(localStorage.getItem("users")) || {};

  Object.keys(users).forEach((username) => {
    if (typeof users[username] === "string") {
      // Old format → convert to new format
      users[username] = { password: users[username] };
    }
  });

  localStorage.setItem("users", JSON.stringify(users));
  return users;
}

// ===== Register New User =====
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("register-username").value.trim();
  const password = document.getElementById("register-password").value.trim();

  if (!username || !password) {
    alert("Please fill in all fields");
    return;
  }

  let users = normalizeUsers();

  if (users[username]) {
    alert("Username already exists. Please choose another.");
    return;
  }

  // Save new user in correct format
  users[username] = { password };
  localStorage.setItem("users", JSON.stringify(users));

  alert("Registration successful! You can now log in.");
  registerForm.reset();
  registerForm.style.display = "none";
  loginForm.style.display = "block";
});

// ===== Login User =====
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();

  let users = normalizeUsers();

  let storedUser = users[username];

  if (!storedUser) {
    alert("User not found. Please register first.");
    return;
  }

  if (storedUser.password === password) {
    // Save current user
    localStorage.setItem("currentUser", username);

    // Ensure this user has a transaction key
    if (!localStorage.getItem(`transactions_${username}`)) {
      localStorage.setItem(`transactions_${username}`, JSON.stringify([]));
    }

    // Redirect to budget app
    window.location.href = "./index.html";
  } else {
    alert("Invalid username or password");
  }
});

