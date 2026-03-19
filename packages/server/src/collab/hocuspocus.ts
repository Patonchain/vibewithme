import { Hocuspocus, Server } from "@hocuspocus/server";
import { verifyToken } from "../auth/jwt.js";

// Document state stored in memory (persistence comes in Phase 3)
const documents = new Map<string, Uint8Array>();

export function createCollabServer() {
  const hocuspocus = new Hocuspocus({
    async onAuthenticate({ token }) {
      try {
        const payload = await verifyToken(token);
        return {
          user: {
            id: payload.userId,
            name: payload.name,
            color: payload.color,
          },
        };
      } catch {
        throw new Error("Authentication failed");
      }
    },

    async onLoadDocument({ document, documentName }) {
      const Y = await import("yjs");
      const stored = documents.get(documentName);
      if (stored) {
        Y.applyUpdate(document, stored);
      }
      return document;
    },

    async onStoreDocument({ documentName, document }) {
      const Y = await import("yjs");
      documents.set(documentName, Y.encodeStateAsUpdate(document));
    },

    async onConnect({ documentName }) {
      console.log(`[collab] User connected to ${documentName}`);
    },

    async onDisconnect({ documentName }) {
      console.log(`[collab] User disconnected from ${documentName}`);
    },
  });

  const server = new Server({
    hocuspocus,
    port: Number(process.env.VWM_WS_PORT) || 3848,
  });

  return server;
}
