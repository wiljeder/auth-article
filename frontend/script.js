const API_URL = "http://localhost:5000";
// Or wherever your backend is running

// DOM helpers
function toggleVisibility(elementId, visible) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = visible ? "block" : "none";
  }
}

function setMessage(message) {
  const messageElement = document.getElementById("message");
  messageElement.innerText = message;
  // Clear after 3 seconds
  setTimeout(() => {
    messageElement.innerText = "";
  }, 3000);
}

// Authentication functions
async function login(e) {
  e.preventDefault();

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      credentials: "include", // Important for cookies
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
      }),
    });

    if (!res.ok) {
      setMessage("Failed to login!");
      return;
    }

    const { accessToken } = await res.json();
    localStorage.setItem("accessToken", accessToken);
    setMessage("Logged in!");

    toggleVisibility("logout-button", true);
    toggleVisibility("login-form", false);
  } catch (error) {
    console.error("Login failed:", error);
    setMessage("Login error occurred!");
  }
}

async function refreshToken() {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include", // Include cookies
  });

  if (res.ok) {
    const { accessToken } = await res.json();
    localStorage.setItem("accessToken", accessToken);
    return accessToken;
  }

  // Handle refresh failure
  localStorage.removeItem("accessToken");
  setMessage("Session expired. Please log in again.");
  toggleVisibility("login-form", true);
  toggleVisibility("logout-button", false);
  throw new Error("Failed to refresh token");
}

async function fetchSecret() {
  let token = localStorage.getItem("accessToken");
  if (!token) {
    setMessage("Please log in first");
    return;
  }

  try {
    // First attempt
    let res = await fetch(`${API_URL}/protected/secret`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    // If the token has expired or is invalid, try refreshing
    if (!res.ok) {
      token = await refreshToken();
      res = await fetch(`${API_URL}/protected/secret`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
    }

    if (res.ok) {
      const data = await res.json();
      setMessage(data.message);
    } else {
      setMessage("Failed to fetch secret.");
    }
  } catch (error) {
    console.error("Error in fetchSecret:", error);
    setMessage("Error occurred while fetching secret.");
  }
}

function logout() {
  localStorage.removeItem("accessToken");
  toggleVisibility("logout-button", false);
  toggleVisibility("login-form", true);
  setMessage("Logged out!");
}

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  // Setup login listener
  document.getElementById("login-form").addEventListener("submit", login);

  // If we already have a token, attempt to use it
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    try {
      await fetchSecret();
      toggleVisibility("login-form", false);
      toggleVisibility("logout-button", true);
    } catch (error) {
      // If the token is invalid, reset everything
      logout();
    }
  }

  // Hide the loader, show content
  toggleVisibility("loader", false);
  document.getElementById("content").style.display = "block";
});
