import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { authRoutes } from "./routes/auth.js";
import { roomRoutes } from "./routes/rooms.js";
import { healthRoutes } from "./routes/health.js";
import { createCollabServer } from "./collab/hocuspocus.js";

const app = new Hono();

// CORS for local development
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Authorization", "Content-Type"],
  }),
);

// Routes
app.route("/health", healthRoutes);
app.route("/api/auth", authRoutes);
app.route("/api/rooms", roomRoutes);

// Start HTTP server
const HTTP_PORT = Number(process.env.VWM_PORT) || 3847;

serve(
  { fetch: app.fetch, port: HTTP_PORT },
  (info) => {
    console.log(`[vibewithme] API server running on http://localhost:${info.port}`);
  },
);

// Start Hocuspocus WebSocket server
const collab = createCollabServer();
collab.listen().then(() => {
  const wsPort = Number(process.env.VWM_WS_PORT) || 3848;
  console.log(`[vibewithme] Collab server running on ws://localhost:${wsPort}`);
});

console.log("[vibewithme] Server starting...");
