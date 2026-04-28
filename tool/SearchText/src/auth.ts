import { UserService } from './services';
import { validateToken } from '../utils/auth';

// TODO: Add rate limiting for login attempts
interface IUserRepository {
  findById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export function handleLogin(username: string, password: string): boolean {
  console.log('Login attempt for:', username);
  // TODO: Implement proper password hashing
  const isValid = validateCredentials(username, password);
  if (!isValid) {
    console.log('Error: Invalid credentials for', username);
    return false;
  }
  return true;
}

function validateCredentials(user: string, pass: string): boolean {
  // TODO: Replace with database lookup
  return user === 'admin' && pass === 'secret';
}

export default class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async processRequest(req: Request): Promise<Response> {
    const token = req.headers.get('Authorization');
    if (!token) {
      console.log('Error: No authorization token provided');
      return new Response('Unauthorized', { status: 401 });
    }
    return new Response('OK', { status: 200 });
  }
}
