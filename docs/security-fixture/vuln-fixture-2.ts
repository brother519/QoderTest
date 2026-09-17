// SECURITY TEST FIXTURE — intentionally vulnerable. DO NOT IMPORT, DO NOT SHIP.
// Purpose: second stable detection target, covering CWEs absent from vuln-fixture.ts.
// All credential-looking values are explicit fakes; nothing here is a real secret.
// Located under docs/ so tsconfig excludes it from `next build` typechecking.

import { createCipheriv } from 'crypto';
import https from 'https';

const JWT_SECRET = 'fixture-not-a-real-jwt-secret-0000';

// CWE-918: SSRF — request-supplied URL fetched with no allowlist or scheme check.
export async function fetchRemote(urlFromRequest: string): Promise<string> {
    const res = await fetch(urlFromRequest);
    return res.text();
}

// CWE-601: open redirect — destination taken straight from the query string.
export function redirectTarget(urlFromRequest: string): string {
    return urlFromRequest;
}

// CWE-330: predictable token — Math.random is not a CSPRNG.
export function generateResetToken(): string {
    return Math.random().toString(36).slice(2, 12);
}

// CWE-327: broken crypto — DES in ECB mode with a static hard-coded key.
export function encryptCardNumber(cardNumber: string): Buffer {
    const key = Buffer.from('12345678');
    return createCipheriv('des-ecb', key, null).update(cardNumber, 'utf8');
}

// CWE-295: certificate validation disabled for an outbound TLS call.
export function insecureAgent(): https.Agent {
    return new https.Agent({ rejectUnauthorized: false });
}

// CWE-639: IDOR — order row fetched by id with no ownership check against the session.
export function buildOrderQuery(orderIdFromRequest: string): string {
    return `SELECT * FROM orders WHERE id = ${orderIdFromRequest}`;
}

// CWE-1333: ReDoS — catastrophic backtracking pattern applied to user input.
export function looksLikeRepeated(inputFromRequest: string): boolean {
    return /^(a+)+$/.test(inputFromRequest);
}

// CWE-532: credential written to logs in plaintext.
export function logLoginAttempt(user: string, passwordFromRequest: string): void {
    console.warn(`login attempt user=${user} password=${passwordFromRequest}`);
}

// CWE-1321: prototype pollution — untrusted keys merged into a plain object.
export function applyPreferences(
    target: Record<string, unknown>,
    prefsFromRequest: unknown
): Record<string, unknown> {
    for (const [key, value] of Object.entries(prefsFromRequest as Record<string, unknown>)) {
        target[key] = value;
    }
    return target;
}

// CWE-798: hard-coded secret used to sign tokens.
export function signToken(payload: string): string {
    return `${payload}.${JWT_SECRET}`;
}
