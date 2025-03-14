import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TUser } from "../db";

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

  jwt.verify(token, process.env.ACCESS_SECRET as string, (err, user) => {
    if (err) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    req.user = user as TUser;
    next();
  });
};
