import express from "express";

const router = express.Router();

// 🔹 Protected Route
router.get("/secret", (_, res) => {
  res.json({ message: "This is a secret data!" });
});

export default router;
