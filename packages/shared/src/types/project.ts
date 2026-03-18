export interface Project {
  id: string;
  name: string;
  path: string;
  teamId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface FileEntry {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileEntry[];
  extension?: string;
}
