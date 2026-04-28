import { Router } from 'express';
import { AuthController } from './auth';

// TODO: Refactor authentication to use JWT
const router = Router();
const authCtrl = new AuthController();

interface AuthConfig {
  secretKey: string;
  tokenExpiry: number;
  refreshEnabled: boolean;
}

function loadAuthConfig(): AuthConfig {
  return {
    secretKey: process.env.AUTH_SECRET || 'default',
    tokenExpiry: 3600,
    refreshEnabled: true,
  };
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await authCtrl.login(username, password);
  if (!result.success) {
    console.log('Error: Authentication failed for', username);
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ token: result.token });
});

router.get('/profile', async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }
  const profile = await authCtrl.getProfile(token);
  res.json(profile);
});

export default router;
