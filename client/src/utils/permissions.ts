import type { User } from '../api/types';

// Единое место клиентских проверок прав
export const isAdmin = (user: User | null | undefined): boolean => user?.role === 'admin';