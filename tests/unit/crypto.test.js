/**
 * @file 加密工具单元测试
 * @description 测试密码哈希、安全问题和令牌生成功能
 */
const { hashPassword, comparePassword, hashSecurityAnswer, verifySecurityAnswer, hashToken, generateRandomToken } = require('../../src/utils/crypto');

describe('Crypto Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });
    
    it('should generate different hashes for the same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });
  
  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      
      const result = await comparePassword(password, hash);
      expect(result).toBe(true);
    });
    
    it('should return false for non-matching password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await hashPassword(password);
      
      const result = await comparePassword(wrongPassword, hash);
      expect(result).toBe(false);
    });
  });
  
  describe('hashSecurityAnswer', () => {
    it('should hash a security answer', () => {
      const answer = 'My Pet Name';
      const hash = hashSecurityAnswer(answer);
      
      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });
    
    it('should normalize answers (case insensitive, trimmed)', () => {
      const answer1 = '  My Pet Name  ';
      const answer2 = 'my pet name';
      const answer3 = 'MY PET NAME';
      
      const hash1 = hashSecurityAnswer(answer1);
      const hash2 = hashSecurityAnswer(answer2);
      const hash3 = hashSecurityAnswer(answer3);
      
      expect(hash1).toBe(hash2);
      expect(hash2).toBe(hash3);
    });
  });
  
  describe('verifySecurityAnswer', () => {
    it('should return true for matching answer', () => {
      const answer = 'My Secret Answer';
      const hash = hashSecurityAnswer(answer);
      
      const result = verifySecurityAnswer(answer, hash);
      expect(result).toBe(true);
    });
    
    it('should return true for answer with different case', () => {
      const answer = 'My Secret Answer';
      const hash = hashSecurityAnswer(answer);
      
      const result = verifySecurityAnswer('my secret answer', hash);
      expect(result).toBe(true);
    });
    
    it('should return false for non-matching answer', () => {
      const answer = 'My Secret Answer';
      const hash = hashSecurityAnswer(answer);
      
      const result = verifySecurityAnswer('Wrong Answer', hash);
      expect(result).toBe(false);
    });
  });
  
  describe('hashToken', () => {
    it('should hash a token', () => {
      const token = 'some-random-token';
      const hash = hashToken(token);
      
      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });
    
    it('should produce consistent hash for same token', () => {
      const token = 'some-random-token';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      
      expect(hash1).toBe(hash2);
    });
  });
  
  describe('generateRandomToken', () => {
    it('should generate a random token', () => {
      const token = generateRandomToken();
      
      expect(token).toBeDefined();
      expect(token.length).toBe(64);
    });
    
    it('should generate different tokens each time', () => {
      const token1 = generateRandomToken();
      const token2 = generateRandomToken();
      
      expect(token1).not.toBe(token2);
    });
    
    it('should accept custom byte length', () => {
      const token = generateRandomToken(16);
      
      expect(token.length).toBe(32);
    });
  });
});