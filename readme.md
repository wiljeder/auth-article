# **Authentication with JWTs & Rotating Refresh Tokens**

**Read the Full Article Here:** [Link to Article](https://dev.to/wiljeder/secure-authentication-with-jwts-rotating-refresh-tokens-typescript-express-vanilla-js-4f41)

## **📌 Overview**

This project demonstrates how to implement a simple yet secure **JWT authentication** system with **rotating refresh tokens** using **Express (TypeScript)** for the backend and **Vanilla JavaScript** for the frontend. Key points:

- ✅ **Access Token** (short-lived) stored in localStorage for easy API usage
- ✅ **Refresh Token** (long-lived) stored in an HTTP-only cookie for security
- ✅ **Token Rotation** (each refresh invalidates the old token)
- ✅ **Minimalist Setup** with a single-file backend and two frontend files

## **🛠 Installation & Setup**

### **1️⃣ Clone the Repository**

```bash
git clone https://github.com/wiljeder/auth-article.git
cd auth-article
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Set Up Environment Variables

Create a `.env` file inside the backend directory:

```bash
ACCESS_SECRET=your-access-secret
REFRESH_SECRET=your-refresh-secret
```

### 4️⃣ Start the Server

```bash
npm run dev
```

The frontend will run on http://localhost:5500 and the backend on http://localhost:5000.

## 🧪 Testing the Flow

1. Open the frontend apge in your browser (http://localhost:5500 or similar).
2. Login with the default credentials (admin / password).
   - If successful, the server responds with an access token (saved in localStorage).
   - A refresh token is stored in an HTTP-only cookie (inaccessible to JavaScript).
3. Protected Endpoint:
   - Click “Get Secret” to call a protected route (/protected/secret).
   - If your access token is still valid, you’ll receive a JSON response with "This is a secret data!".
   - If the access token expired, the frontend automatically tries /auth/refresh to rotate the refresh token and get a new access token.
4. Logout:
   - Click “Logout” to remove your access token from localStorage.
   - The refresh token in the cookie becomes irrelevant unless reused. (A robust app might also clear it server-side.)

## 🔗 Resources

- [Express Official Docs](https://expressjs.com/)
- [JSON Web Tokens (jwt.io)](https://jwt.io/)

## 🛠️ Next Steps

- Implement secure password hashing (bcrypt/Argon2) instead of storing plaintext passwords.
- Switch the in-memory database to a real DB (e.g., PostgreSQL or Mongo) for refresh token storage.
- Use HTTPS in production to ensure cookies are always sent securely.

Contributions & suggestions are welcome!
