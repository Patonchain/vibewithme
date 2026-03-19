import { nanoid } from "nanoid";
import { USER_COLORS } from "@vibewithme/shared";

// In-memory store for Phase 2 (will move to SQLite later)
// This is fine for dev — single server, no persistence needed yet

interface StoredUser {
  id: string;
  name: string;
  email: string;
  color: string;
  passwordHash: string;
  createdAt: number;
}

interface Room {
  id: string;
  name: string;
  createdBy: string;
  members: string[];
  createdAt: number;
}

class Store {
  users = new Map<string, StoredUser>();
  rooms = new Map<string, Room>();
  // email -> userId index
  emailIndex = new Map<string, string>();
  // invite code -> roomId
  inviteCodes = new Map<string, { roomId: string; expiresAt: number }>();

  createUser(
    name: string,
    email: string,
    passwordHash: string,
  ): StoredUser {
    const id = `u_${nanoid(12)}`;
    const color =
      USER_COLORS[this.users.size % USER_COLORS.length];
    const user: StoredUser = {
      id,
      name,
      email,
      color,
      passwordHash,
      createdAt: Date.now(),
    };
    this.users.set(id, user);
    this.emailIndex.set(email.toLowerCase(), id);
    return user;
  }

  getUserByEmail(email: string): StoredUser | undefined {
    const id = this.emailIndex.get(email.toLowerCase());
    return id ? this.users.get(id) : undefined;
  }

  getUserById(id: string): StoredUser | undefined {
    return this.users.get(id);
  }

  createRoom(name: string, createdBy: string): Room {
    const id = `room_${nanoid(8)}`;
    const room: Room = {
      id,
      name,
      createdBy,
      members: [createdBy],
      createdAt: Date.now(),
    };
    this.rooms.set(id, room);
    return room;
  }

  createInviteCode(roomId: string): string {
    const code = nanoid(16);
    this.inviteCodes.set(code, {
      roomId,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h
    });
    return code;
  }

  redeemInvite(code: string, userId: string): Room | null {
    const invite = this.inviteCodes.get(code);
    if (!invite || invite.expiresAt < Date.now()) {
      this.inviteCodes.delete(code);
      return null;
    }
    const room = this.rooms.get(invite.roomId);
    if (room && !room.members.includes(userId)) {
      room.members.push(userId);
    }
    this.inviteCodes.delete(code);
    return room ?? null;
  }
}

export const store = new Store();
