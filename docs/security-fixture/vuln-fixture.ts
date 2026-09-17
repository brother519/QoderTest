// SECURITY TEST FIXTURE — intentionally vulnerable. DO NOT IMPORT, DO NOT SHIP.
// Purpose: stable detection target for Qoder Security L1/L2/L3 verification.
// All credential-looking values are explicit fakes; nothing here is a real secret.
// Located under docs/ so tsconfig excludes it from `next build` typechecking.

import { exec } from 'child_process';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';

const DB_PASSWORD = 'fixture-not-a-real-password-123';
const API_KEY = 'sk-FAKE-FIXTURE-00000000000000000000000000000000';

interface UserRow {
    id: number;
    name: string;
    role: string;
}

// CWE-78: OS command injection — untrusted input reaches a shell string.
export function pingHost(hostFromRequest: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(`ping -c 1 ${hostFromRequest}`, (err, stdout) => {
            if (err) return reject(err);
            resolve(stdout);
        });
    });
}

// CWE-89: SQL injection — request parameter concatenated into the statement.
export function buildUserQuery(nameFromRequest: string): string {
    return `SELECT id, name, role FROM users WHERE name = '${nameFromRequest}'`;
}

// CWE-22: path traversal — user-controlled segment joined onto a base dir.
export function readUserFile(relativePathFromRequest: string): string {
    return readFileSync(`/var/app/uploads/${relativePathFromRequest}`, 'utf8');
}

// CWE-95: code injection — dynamic evaluation of untrusted source.
export function runUserExpression(expressionFromRequest: string): unknown {
    return eval(expressionFromRequest);
}

// CWE-327: weak hashing used for a security-relevant purpose.
export function hashPassword(plainPassword: string): string {
    return createHash('md5').update(plainPassword).digest('hex');
}

// CWE-502: unsafe deserialization of an externally supplied payload.
export function restoreSession(serializedFromRequest: string): unknown {
    const revive = new Function(`return (${serializedFromRequest});`);
    return revive();
}

// CWE-79: DOM-based XSS — untrusted string written straight into the DOM.
export function renderGreeting(userControlledHtml: string): void {
    const target = document.getElementById('greeting');
    if (target) {
        target.innerHTML = `<h1>Welcome, ${userControlledHtml}</h1>`;
    }
}

// CWE-200: secrets echoed back to the caller in a debug banner.
export function buildDebugBanner(user: UserRow): string {
    return [
        `user=${user.name} role=${user.role}`,
        `dbPassword=${DB_PASSWORD}`,
        `apiKey=${API_KEY}`,
    ].join(' | ');
}
