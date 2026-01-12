import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { Domain, CreateDomainInput } from '../types/models';

export async function createDomain(userId: number, input: CreateDomainInput): Promise<Domain> {
  const verificationToken = uuidv4();

  const result = await query(
    `INSERT INTO domains (domain, user_id, verification_token)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.domain, userId, verificationToken]
  );

  return result.rows[0];
}

export async function findDomainById(id: number): Promise<Domain | null> {
  const result = await query('SELECT * FROM domains WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function findDomainByName(domain: string): Promise<Domain | null> {
  const result = await query('SELECT * FROM domains WHERE domain = $1', [domain]);
  return result.rows[0] || null;
}

export async function findDomainsByUserId(userId: number): Promise<Domain[]> {
  const result = await query(
    'SELECT * FROM domains WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

export async function verifyDomain(id: number, userId: number): Promise<Domain | null> {
  const result = await query(
    `UPDATE domains 
     SET is_verified = true, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function deleteDomain(id: number, userId: number): Promise<boolean> {
  const result = await query(
    'DELETE FROM domains WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function domainExists(domain: string): Promise<boolean> {
  const result = await query('SELECT id FROM domains WHERE domain = $1', [domain]);
  return result.rows.length > 0;
}
