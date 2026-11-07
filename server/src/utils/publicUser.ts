interface UserDoc {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
}

export const toPublicUser = (user: UserDoc) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  firstName: user.firstName ?? null,
  lastName: user.lastName ?? null,
});