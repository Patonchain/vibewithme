import type { Context, Next } from "hono";
import { verifyToken, type TokenPayload } from "./jwt.js";

declare module "hono" {
  interface ContextVariableMap {
    user: TokenPayload;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid authorization header" }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token);
    c.set("user", payload);
    return next();
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
}
