import bcrypt from 'bcrypt';
import { query } from '../config/database';
import { User, CreateUserInput } from '../types/models';

const SALT_ROUNDS = 10;

export async function createUser(input: CreateUserInput): Promise<User> {
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const result = await query(
    `INSERT INTO users (email, password_hash, username)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.email, passwordHash, input.username]
  );

  return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function findUserById(id: number): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0] || null;
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.password_hash);
}

export async function emailExists(email: string): Promise<boolean> {
  const result = await query('SELECT id FROM users WHERE email = $1', [email]);
  return result.rows.length > 0;
}

export async function usernameExists(username: string): Promise<boolean> {
  const result = await query('SELECT id FROM users WHERE username = $1', [username]);
  return result.rows.length > 0;
}
