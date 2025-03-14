// Mock db

const db = {
  users: [{ id: 1, username: "admin", password: "password" }],
  refreshTokens: {} as Record<string, string>,
} as const;

export type TUser = (typeof db.users)[number];

export default db;
