export type Role = "admin" | "executor";
export type Priority = "low" | "medium" |"high" | "crit";

// /me и ответ логина: единственное место, где приходит `id`, а не `_id`
export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface Board {
  _id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Status {
  _id: string;
  boardId: string;
  title: string;
  order: number;
}

export interface Tag {
  _id: string;
  name: string;
}

export interface Task {
  _id: string;
  boardId: string;
  statusId: string;
  title: string;
  description?: string;
  priority: Priority;
  assigneeId?: string | null;
  creatorId: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

// GET /boards/:id
export interface BoardWithStatuses {
  board: Board;
  statuses: Status[];
}