import { api } from './http';
import type { Role, User } from './types';

export const usersApi = {
  list: (role?: Role) => api.get<User[]>(role ? `/users?role=${role}` : '/users'),
};