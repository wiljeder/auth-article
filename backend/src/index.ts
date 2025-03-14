import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./auth/routes";
import protectedRoutes from "./protected/routes";
import { authMiddleware } from "./middlewares/auth.middleware";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "https://5fb9-2804-29b8-50d0-db18-7892-5e58-43c9-a883.ngrok-free.app",
    ],
  })
);

app.get("/", (_, res) => {
  res.send("Hello, World!");
});
app.use("/auth", authRoutes);
app.use("/protected", authMiddleware, protectedRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
