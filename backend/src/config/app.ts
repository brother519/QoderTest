export const appConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  shortCodeLength: parseInt(process.env.SHORT_CODE_LENGTH || '6', 10),
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  
  // Reserved short codes that cannot be used
  reservedCodes: [
    'api',
    'admin',
    'dashboard',
    'login',
    'register',
    'logout',
    'settings',
    'profile',
    'help',
    'about',
    'contact',
    'terms',
    'privacy',
    'static',
    'assets',
    'public',
  ],
};
