export interface User {
  id: string;
  name: string;
  email: string;
  color: string;
  avatarInitial: string;
}

export interface TeamMember extends User {
  role: "owner" | "editor" | "viewer";
  online: boolean;
  lastSeen: number;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  createdAt: number;
}

export type Permission = "read" | "write" | "admin";
