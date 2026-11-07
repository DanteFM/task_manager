import type { User } from '../api/types';

export function fullName(user: Pick<User, 'firstName' | 'lastName' | 'email'>): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return name || user.email;
}

export function userLabel(user: Pick<User, 'firstName' | 'lastName' | 'email'>): string {
  const name = fullName(user);
  return name === user.email ? name : `${name} (${user.email})`;
}