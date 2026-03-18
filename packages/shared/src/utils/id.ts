import { nanoid } from "nanoid";

export const createId = (prefix: string = "") =>
  prefix ? `${prefix}_${nanoid(12)}` : nanoid(12);

export const createMessageId = () => createId("msg");
export const createUserId = () => createId("u");
export const createProjectId = () => createId("proj");
export const createTeamId = () => createId("team");
export const createSessionId = () => createId("ses");
