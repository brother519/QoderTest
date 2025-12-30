/**
 * @file 令牌服务单元测试
 * @description 测试JWT令牌的生成和验证功能
 */
const tokenService = require('../../src/services/tokenService');

describe('Token Service', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    roles: [{ name: 'user' }, { name: 'admin' }]
  };
  
  describe('generateAccessToken', () => {
    it('should generate a valid JWT token', () => {
      const token = tokenService.generateAccessToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });
  
  describe('verifyAccessToken', () => {
    it('should verify a valid token', () => {
      const token = tokenService.generateAccessToken(mockUser);
      const decoded = tokenService.verifyAccessToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.sub).toBe(mockUser._id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.roles).toEqual(['user', 'admin']);
    });
    
    it('should return null for invalid token', () => {
      const decoded = tokenService.verifyAccessToken('invalid-token');
      
      expect(decoded).toBeNull();
    });
  });
  
  describe('generateResetToken', () => {
    it('should generate a reset token', () => {
      const token = tokenService.generateResetToken(mockUser._id);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });
  
  describe('verifyResetToken', () => {
    it('should verify a valid reset token', () => {
      const token = tokenService.generateResetToken(mockUser._id);
      const decoded = tokenService.verifyResetToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.sub).toBe(mockUser._id);
      expect(decoded.type).toBe('reset');
    });
    
    it('should return null for non-reset token', () => {
      const accessToken = tokenService.generateAccessToken(mockUser);
      const decoded = tokenService.verifyResetToken(accessToken);
      
      expect(decoded).toBeNull();
    });
  });
  
  describe('decodeToken', () => {
    it('should decode a token without verification', () => {
      const token = tokenService.generateAccessToken(mockUser);
      const decoded = tokenService.decodeToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.sub).toBe(mockUser._id);
    });
    
    it('should return null for invalid token format', () => {
      const decoded = tokenService.decodeToken('not-a-valid-jwt');
      
      expect(decoded).toBeNull();
    });
  });
});