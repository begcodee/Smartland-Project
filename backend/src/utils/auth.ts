import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const SALT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

type SensitiveUserFields =
  | 'passwordHash'
  | 'password'
  | 'resetToken'
  | 'resetTokenHash'
  | 'refreshToken'
  | 'twoFactorSecret';

export function sanitizeUser<T extends Record<string, unknown>>(
  u: T
): Omit<T, SensitiveUserFields> {
  const {
    // Explicitly strip known secret-bearing fields if present.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    passwordHash,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    password,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    resetToken,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    resetTokenHash,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    refreshToken,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    twoFactorSecret,
    ...rest
  } = u as T & Partial<Record<SensitiveUserFields, unknown>>;

  return rest as Omit<T, SensitiveUserFields>;
}
