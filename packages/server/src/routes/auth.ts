import { Hono } from "hono";
import argon2 from "argon2";
import { store } from "../store.js";
import {
  createAccessToken,
  createRefreshToken,
  verifyToken,
} from "../auth/jwt.js";

export const authRoutes = new Hono();

// Register
authRoutes.post("/register", async (c) => {
  const { name, email, password } = await c.req.json<{
    name: string;
    email: string;
    password: string;
  }>();

  if (!name || !email || !password) {
    return c.json({ error: "name, email, and password are required" }, 400);
  }

  if (store.getUserByEmail(email)) {
    return c.json({ error: "Email already registered" }, 409);
  }

  const passwordHash = await argon2.hash(password);
  const user = store.createUser(name, email, passwordHash);

  const accessToken = await createAccessToken({
    userId: user.id,
    name: user.name,
    email: user.email,
    color: user.color,
  });
  const refreshToken = await createRefreshToken(user.id);

  return c.json({
    user: { id: user.id, name: user.name, email: user.email, color: user.color },
    accessToken,
    refreshToken,
  });
});

// Login
authRoutes.post("/login", async (c) => {
  const { email, password } = await c.req.json<{
    email: string;
    password: string;
  }>();

  const user = store.getUserByEmail(email);
  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const accessToken = await createAccessToken({
    userId: user.id,
    name: user.name,
    email: user.email,
    color: user.color,
  });
  const refreshToken = await createRefreshToken(user.id);

  return c.json({
    user: { id: user.id, name: user.name, email: user.email, color: user.color },
    accessToken,
    refreshToken,
  });
});

// Refresh token
authRoutes.post("/refresh", async (c) => {
  const { refreshToken } = await c.req.json<{ refreshToken: string }>();

  try {
    const payload = await verifyToken(refreshToken);
    const user = store.getUserById(payload.userId);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const accessToken = await createAccessToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      color: user.color,
    });

    return c.json({ accessToken });
  } catch {
    return c.json({ error: "Invalid refresh token" }, 401);
  }
});
