// Configuration
const API_URL = "http://localhost:5500";

// DOM Element IDs
const ELEMENTS = {
  content: "content",
  loginForm: "login-form",
  logoutButton: "logout-button",
  loader: "loader",
  message: "message",
};

/**
 * Show or hide an element by ID
 */
function toggleVisibility(elementId, visible) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = visible ? "block" : "none";
  }
}

/**
 * Display a temporary message to the user
 */
function setMessage(message) {
  const messageElement = document.getElementById(ELEMENTS.message);
  messageElement.innerText = message;

  // Clear message after 3 seconds
  setTimeout(() => {
    messageElement.innerText = "";
  }, 3000);
}

/**
 * Handle user login
 */
async function login(e) {
  e.preventDefault();

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
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

    toggleVisibility(ELEMENTS.logoutButton, true);
    toggleVisibility(ELEMENTS.loginForm, false);
  } catch (error) {
    console.error("Login failed:", error);
    setMessage("Login error occurred!");
  }
}

/**
 * Refresh the authentication token
 */
async function refreshToken() {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "ngrok-skip-browser-warning": "true" },
  });

  if (res.ok) {
    const { accessToken } = await res.json();
    localStorage.setItem("accessToken", accessToken);
    return accessToken;
  }

  // Handle refresh failure
  localStorage.removeItem("accessToken");
  setMessage("Session expired. Please log in again.");
  toggleVisibility(ELEMENTS.loginForm, true);
  toggleVisibility(ELEMENTS.logoutButton, false);

  throw new Error("Failed to refresh token");
}

/**
 * Fetch protected content using token authentication
 */
async function fetchSecret() {
  let token = localStorage.getItem("accessToken");
  if (!token) {
    setMessage("Please log in first");
    return;
  }

  try {
    // First attempt with current token
    let res = await fetch(`${API_URL}/protected/secret`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include",
    });

    // If token expired, try refreshing and retry
    if (!res.ok) {
      token = await refreshToken();
      res = await fetch(`${API_URL}/protected/secret`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        credentials: "include",
      });
    }

    if (res.ok) {
      setMessage(await res.text());
    } else {
      setMessage("Failed to fetch secret.");
    }
  } catch (error) {
    console.error("Error in fetchSecret:", error);
    setMessage("Error occurred while fetching secret.");
  }
}

/**
 * Log the user out
 */
function logout() {
  localStorage.removeItem("accessToken");
  toggleVisibility(ELEMENTS.logoutButton, false);
  toggleVisibility(ELEMENTS.loginForm, true);
  setMessage("Logged out!");
}

// Initialize the application
document.addEventListener("DOMContentLoaded", async () => {
  // Set up event listeners
  document.getElementById(ELEMENTS.loginForm).addEventListener("submit", login);

  // Check if user is already logged in
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    try {
      await fetchSecret();
      toggleVisibility(ELEMENTS.loginForm, false);
      toggleVisibility(ELEMENTS.logoutButton, true);
    } catch (error) {
      // Token invalid, log the user out
      logout();
    }
  }

  // Hide loader and show content
  toggleVisibility(ELEMENTS.loader, false);
  document.getElementById(ELEMENTS.content).style.display = "block";
});
