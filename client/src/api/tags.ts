import { api } from './http';
import type { Tag } from './types';

export const tagsApi = {
  list: () => api.get<Tag[]>('/tags'),
  create: (name: string) => api.post<Tag>('/tags', { name }),
};