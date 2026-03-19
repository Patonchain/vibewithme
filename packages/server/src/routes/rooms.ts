import { Hono } from "hono";
import { authMiddleware } from "../auth/middleware.js";
import { store } from "../store.js";

export const roomRoutes = new Hono();

roomRoutes.use("*", authMiddleware);

// Create a room
roomRoutes.post("/", async (c) => {
  const user = c.get("user");
  const { name } = await c.req.json<{ name: string }>();

  if (!name) {
    return c.json({ error: "Room name is required" }, 400);
  }

  const room = store.createRoom(name, user.userId);
  return c.json({ room });
});

// List rooms for current user
roomRoutes.get("/", (c) => {
  const user = c.get("user");
  const rooms = Array.from(store.rooms.values()).filter((r) =>
    r.members.includes(user.userId),
  );
  return c.json({ rooms });
});

// Create invite code
roomRoutes.post("/:roomId/invite", (c) => {
  const user = c.get("user");
  const roomId = c.req.param("roomId");
  const room = store.rooms.get(roomId);

  if (!room) {
    return c.json({ error: "Room not found" }, 404);
  }
  if (!room.members.includes(user.userId)) {
    return c.json({ error: "Not a member of this room" }, 403);
  }

  const code = store.createInviteCode(roomId);
  return c.json({ inviteCode: code });
});

// Join room via invite
roomRoutes.post("/join", async (c) => {
  const user = c.get("user");
  const { inviteCode } = await c.req.json<{ inviteCode: string }>();

  const room = store.redeemInvite(inviteCode, user.userId);
  if (!room) {
    return c.json({ error: "Invalid or expired invite code" }, 400);
  }

  return c.json({ room });
});
