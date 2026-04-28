import bcrypt from 'bcrypt';

// TODO: Add password strength validation
// TODO: Implement account lockout after failed attempts
export class AuthController {
  private users: Map<string, { hash: string; role: string }> = new Map();

  async login(username: string, password: string) {
    const user = this.users.get(username);
    if (!user) {
      return { success: false };
    }
    const match = await bcrypt.compare(password, user.hash);
    return { success: match, token: match ? 'jwt-token-here' : null };
  }

  async getProfile(token: string) {
    // TODO: Implement proper JWT verification
    return { name: 'Test User', role: 'admin' };
  }

  async register(username: string, password: string, role: string) {
    const hash = await bcrypt.hash(password, 10);
    this.users.set(username, { hash, role });
    return { success: true };
  }
}
