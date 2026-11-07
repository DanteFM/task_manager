interface UserDoc {
  id: string;
  email: string;
  role: string;
}

export const toPublicUser = (user: UserDoc) => ({
  id: user.id,
  email: user.email,
  role: user.role,
});