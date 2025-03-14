import express from "express";
import jwt from "jsonwebtoken";
import db from "../db";
import { generateAccessToken, generateRefreshToken } from "./generateTokens";

const router = express.Router();

/**
 * Authentication Routes
 */

/**
 * Login endpoint - authenticates user and issues tokens
 */
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate credentials
  const user = db.users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Set refresh token in HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  // Return access token in response body
  res.json({ accessToken });
});

/**
 * Refresh token endpoint - issues new tokens when access token expires
 */
router.post("/refresh", (req, res) => {
  const oldToken = req.cookies.refreshToken;

  // Check if refresh token exists
  if (!oldToken) {
    res.status(401).json({ message: "Unauthorized - No refresh token" });
    return;
  }

  // Verify refresh token
  jwt.verify(
    oldToken,
    process.env.REFRESH_SECRET as string,
    (err: any, user: any) => {
      // Invalid token or token doesn't match stored token
      if (err || db.refreshTokens[user.id] !== oldToken) {
        res.clearCookie("refreshToken");
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      // Generate new tokens (token rotation)
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      // Update stored refresh token
      db.refreshTokens[user.id] = newRefreshToken;

      // Set new refresh token in HTTP-only cookie
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });

      // Return new access token
      res.json({ accessToken: newAccessToken });
    }
  );
});

export default router;
