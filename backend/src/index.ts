import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { randomUUID as uuidv4 } from "crypto";

// Load environment variables
dotenv.config();

// Create an Express app
const app = express();

// Enable JSON body parsing and cookies
app.use(express.json());
app.use(cookieParser());

// CORS setup to allow cross-domain requests (with cookies)
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
  })
);

const db = {
  // Our only user: "admin" / "password"
  users: [{ id: 1, username: "admin", password: "password" }],

  // Mapping of user IDs to their valid refresh tokens
  // e.g. refreshTokens[1] = "<some_jwt_refresh_token>"
  refreshTokens: {} as Record<string, string>,
} as const;

const ACCESS_SECRET = process.env.ACCESS_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

// Generate a short-lived access token (5s for demo; ~15min for real apps)
const generateAccessToken = (user: any) =>
  jwt.sign({ id: user.id }, ACCESS_SECRET, { expiresIn: "5s" });

// Generate a refresh token with a unique tokenId for rotation
const generateRefreshToken = (user: any) => {
  const tokenId = uuidv4(); // unique ID for the refresh token
  const token = jwt.sign({ id: user.id, tokenId }, REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return token;
};

app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;

  // Basic credential check (plaintext for demo)
  const user = db.users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  // Create tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Also store it in db.refreshTokens to track validity
  db.refreshTokens[user.id] = refreshToken;

  // Send refresh token as HTTP-only cookie (unreadable by JS)
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  // The access token is returned in the response body
  res.json({ accessToken });
});

app.post("/auth/refresh", (req, res) => {
  const oldToken = req.cookies.refreshToken;

  if (!oldToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  jwt.verify(oldToken, REFRESH_SECRET, (err: any, user: any) => {
    // If token is invalid or not the latest one
    if (err || db.refreshTokens[user.id] !== oldToken) {
      res.clearCookie("refreshToken");
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    // Remove the old token from "db"
    delete db.refreshTokens[user.id];

    // Generate brand-new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Store the new refresh token
    db.refreshTokens[user.id] = newRefreshToken;

    // Send the new refresh token via HTTP-only cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    // Return the new access token in body
    res.json({ accessToken: newAccessToken });
  });
});

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  jwt.verify(token, ACCESS_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    req.user = user as any;
    next();
  });
};

app.get("/protected/secret", authMiddleware, (_, res) => {
  res.json({ message: "This is a secret data!" });
});

app.listen(5000, () => console.log("Server running on port 5000 🎇"));
