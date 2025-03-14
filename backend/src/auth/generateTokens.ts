import jwt from "jsonwebtoken";
import { randomUUID as uuidv4 } from "node:crypto";
import db from "../db";

/**
 * Generate short-lived access token for API authorization
 */
export const generateAccessToken = (user: any) => {
  // Create a short-lived token (5 seconds for demo purposes)
  // In production, this would typically be 5-15 minutes
  return jwt.sign({ id: user.id }, process.env.ACCESS_SECRET as string, {
    expiresIn: "5s",
  });
};

/**
 * Generate long-lived refresh token for obtaining new access tokens
 */
export const generateRefreshToken = (user: any) => {
  // Add a unique tokenId to enable token revocation
  const refreshToken = jwt.sign(
    {
      id: user.id,
      tokenId: uuidv4(), // Unique identifier for this specific token
    },
    process.env.REFRESH_SECRET as string,
    { expiresIn: "7d" }
  );

  // Store refresh token in database for validation
  db.refreshTokens[user.id] = refreshToken;

  return refreshToken;
};
